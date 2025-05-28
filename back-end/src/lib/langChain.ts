import { ChatOpenAI } from "@langchain/openai";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    openAIApiKey: OPENAI_API_KEY
});

export default model;

