import { HfInference } from "@huggingface/inference";

export const hfInference = new HfInference(process.env.HUGGING_FACE_API_KEY);