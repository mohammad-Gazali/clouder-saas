import { db } from "@/db";
import { hfInference } from "@/lib/hf";
import { supabaseClient } from "@/lib/supabase";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/hf";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { HuggingFaceStream, StreamingTextResponse } from "ai";

export async function POST(req: Request) {
	const body = await req.json();

	const { getUser } = getKindeServerSession();

	const user = getUser();

	if (!user || !user.id || !user.email)
		return new Response("Unauthorized", { status: 401 });

	const { fileId, message } = SendMessageValidator.parse(body);

	const file = await db.file.findUnique({
		where: {
			id: fileId,
			userId: user.id,
		},
	});

	if (!file) return new Response("Not Found", { status: 404 });

	await db.message.create({
		data: {
			text: message,
			isUserMessage: true,
			userId: user.id,
			fileId: file.id,
		},
	});

	// 1: vectorize message
	const embeddings = new HuggingFaceInferenceEmbeddings({
		apiKey: process.env.HUGGING_FACE_API_KEY,
	});

	const vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, {
		client: supabaseClient,
		tableName: "documents",
		queryName: "match_documents",
        filter: {
            file_key: file.key,
        }
	});

	const results = await vectorStore.similaritySearch(message, 4);

	const prevMessages = await db.message.findMany({
		where: {
			fileId,
		},
		orderBy: {
			createdAt: "asc",
		},
		take: 6,
	});

	const formattedMessages = prevMessages.map((message) => message.text);

    //! I faced an impossible problem here, I want to stream data using hugging face but I can't because It need pro plan 😤
	const response = hfInference.textGenerationStream({
		inputs: [
            "Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.",
            ...formattedMessages,
            `And the context is: ${results.map(r => r.pageContent).join("\n\n")}`,
            `And the current user message is: ${message}`,
        ].join("\n"),
	});

    const stream = HuggingFaceStream(response, {
        onCompletion: async (fullResponse) => {
            await db.message.create({
                data: {
                    text: fullResponse,
                    isUserMessage: false,
                    userId: user.id!,
                    fileId: file.id,
                }
            })
        }
    });

    return new StreamingTextResponse(stream)
}
