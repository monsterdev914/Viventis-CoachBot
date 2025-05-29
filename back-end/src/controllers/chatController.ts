import { Request, Response } from "express";
import { supabase } from "../supabaseClient";
import chain from "../lib/langChain";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { DocumentController } from "./documentController";

class ChatController {
    static createChat = async (req: Request, res: Response) => {
        try {
            const user = (req as any).user;
            const { title } = req.body;

            const { data, error } = await supabase
                .from('chats')
                .insert({ user_id: user.id, title })
                .select()
                .single();

            if (error) throw error;
            res.status(200).json(data);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    static getChats = async (req: Request, res: Response) => {
        try {
            const user = (req as any).user;

            const { data, error } = await supabase
                .from('chats')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            res.status(200).json(data);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    static getMessages = async (req: Request, res: Response) => {
        try {
            const { chatId } = req.params;
            const user = (req as any).user;

            // First verify the chat belongs to the user
            const { data: chat, error: chatError } = await supabase
                .from('chats')
                .select('id')
                .eq('id', chatId)
                .eq('user_id', user.id)
                .single();

            if (chatError || !chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', chatId)
                .order('timestamp', { ascending: true });

            if (error) throw error;
            res.status(200).json(data);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    static createMessage = async (req: Request, res: Response) => {
        try {
            const { chatId } = req.params;
            const user = (req as any).user;
            const message = req.body;

            // Verify chat ownership
            const { data: chat, error: chatError } = await supabase
                .from('chats')
                .select('id')
                .eq('id', chatId)
                .eq('user_id', user.id)
                .single();

            if (chatError || !chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }

            //Get response from langChain
            const response = await chain.invoke(message);

            const { data, error } = await supabase
                .from('messages')
                .insert({ ...message, chat_id: chatId, response })
                .select()
                .single();

            if (error) throw error;
            res.status(200).json(data);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    static deleteChat = async (req: Request, res: Response) => {
        try {
            const { chatId } = req.params;
            const user = (req as any).user;

            const { error } = await supabase
                .from('chats')
                .delete()
                .eq('id', chatId)
                .eq('user_id', user.id);

            if (error) throw error;
            res.status(200).json({ message: 'Chat deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    static streamChat = async (req: Request, res: Response) => {
        try {
            const { message } = req.body;

            // Set headers for SSE
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            // Get bot settings
            const { data: botSettings, error: botSettingsError } = await supabase
                .from('bot_settings')
                .select('*')
                .maybeSingle();

            if (botSettingsError) throw botSettingsError;

            // Create bot info for system prompt
            const botInfo = `
            You are a helpful assistant named ${botSettings?.name}.
            Welcome message: ${botSettings?.welcome_message}
            ${botSettings?.description}
            `;

            // Get relevant documents using similarity search
            const relevantDocs = await DocumentController.similaritySearch(message);

            // Create context from relevant documents
            const context = relevantDocs
                .map(doc => doc.pageContent)
                .join("\n\n");

            // Create system prompt with context
            const systemPrompt = `${botInfo}\n${botSettings?.system_prompt}\n\nContext:\n${context}`;

            // Initialize chat model with settings
            const chatModel = new ChatOpenAI({
                temperature: botSettings?.temperature || 0.7,
                maxTokens: botSettings?.max_tokens || 100,
                modelName: botSettings?.model || "gpt-3.5-turbo",
                streaming: true
            });

            // Stream the response
            const stream = await chatModel.stream([
                new SystemMessage(systemPrompt),
                new HumanMessage(message)
            ]);

            for await (const chunk of stream) {
                if (chunk.content) {
                    res.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`);
                }
            }

            res.write('data: [DONE]\n\n');
            res.end();
        } catch (error: any) {
            console.error('Error in streamChat:', error);
            res.status(500).json({ error: error.message });
        }
    };
}

export default ChatController; 