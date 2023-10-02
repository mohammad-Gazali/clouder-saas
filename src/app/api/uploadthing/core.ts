import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/hf"
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { supabaseClient } from "@/lib/supabase";
 
const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async () => {

        const { getUser } = getKindeServerSession();

        const user = getUser();

        if (!user || !user.id || !user.email) throw new Error("Unauthorized");

        return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
        const createdFile = await db.file.create({
            data: {
                key: file.key,
                name: file.name,
                userId: metadata.userId,
                url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
                uploadStatus: "PROCESSING",
            }
        });
        
        try {
            const response = await fetch(`https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`);

            const blob = await response.blob();

            const loader = new PDFLoader(blob);

            const pageLevelDocs = (await loader.load()).map(doc => {
                doc.metadata["file_key"] = file.key;
                return doc;
            });

            const pagesAmount = pageLevelDocs.length;

            // vectorize and index entire document
            const embeddings = new HuggingFaceInferenceEmbeddings({
                apiKey: process.env.HUGGING_FACE_API_KEY,
            })

            await SupabaseVectorStore.fromDocuments(pageLevelDocs, embeddings, {
                client: supabaseClient,
                tableName: "documents",
                queryName: "match_documents",
            });

            await db.file.update({
                data: {
                    uploadStatus: "SUCCESS",
                },
                where: {
                    id: createdFile.id,
                }
            })
        } catch (err) {
            console.log(err)

            await db.file.update({
                data: {
                    uploadStatus: "FAILED",
                },
                where: {
                    id: createdFile.id,
                }
            })
        }
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;