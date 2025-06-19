import { Request, Response } from "express";
import chain from "../lib/langChain";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { DocumentController } from "./documentController";

class ChatController {
    // Helper method to fetch user prompts
    static getUserPrompts = async (supabase: any, userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_prompts')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching user prompts:', error);
            return [];
        }
    };

    static createChat = async (req: Request, res: Response) => {
        const supabase = (req as any).supabase;
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
            console.log(error);
            res.status(400).json({ error: error.message });
        }
    };

    static getChats = async (req: Request, res: Response) => {
        try {
            const supabase = (req as any).supabase;
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

    static getChat = async (req: Request, res: Response) => {
        try {
            const supabase = (req as any).supabase;
            const { chatId } = req.params;
            const { data, error } = await supabase
                .from('chats')
                .select('*')
                .eq('id', chatId)
                .single();

            if (error) throw error;
            res.status(200).json(data);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };


    static getMessages = async (req: Request, res: Response) => {
        try {
            const supabase = (req as any).supabase;
            const { chatId } = req.params;
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true }).limit(50);

            if (error) throw error;
            console.log(data);
            res.status(200).json(data);
        } catch (error: any) {
            console.log(error);
            res.status(400).json({ error: error.message });
        }
    };

    static createMessage = async (req: Request, res: Response) => {
        try {
            const supabase = (req as any).supabase;
            const { chatId } = req.params;
            const message = req.body.message;

            // Verify chat ownership
            const { data, error } = await supabase
                .from('messages')
                .insert({ ...message, chat_id: chatId })
                .select()
                .single();

            if (error) throw error;
            res.status(200).json(data);
        } catch (error: any) {
            console.log(error);
            res.status(400).json({ error: error.message });
        }
    };

    static deleteChat = async (req: Request, res: Response) => {
        try {
            const supabase = (req as any).supabase;
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
            const supabase = (req as any).supabase;
            const user = (req as any).user;
            const { oldMessages, message } = req.body;

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
            const relevantDocs = await DocumentController.similaritySearch(req, message);

            // Create context from relevant documents
            const context = relevantDocs
                .map(doc => doc.pageContent)
                .join("\n\n");

            // Get user prompts
            const userPrompts = await ChatController.getUserPrompts(supabase, user.id);
            const userPromptsContext = userPrompts.length > 0 
                ? `\n\nUser-specific instructions:\n${userPrompts.map((prompt: any) => prompt.prompt).join('\n')}`
                : '';

            // Create system prompt with context and user prompts
            const systemPrompt = `${botInfo}\n${botSettings?.system_prompt}\n\nContext:\n${context}${userPromptsContext}`;

            // Initialize chat model with settings
            const chatModel = new ChatOpenAI({
                temperature: botSettings?.temperature || 0.7,
                maxTokens: botSettings?.max_tokens || 100,
                modelName: botSettings?.model || "gpt-3.5-turbo",
                streaming: true
            });
            // Add chat history to the system prompt
            const chatHistory = oldMessages.map((msg: string) => {
                const [role, content] = msg.split(": ");
                return role === "user" ? new HumanMessage(content) : new AIMessage(content);
            });
            console.log(chatHistory);
            // Stream the response
            const stream = await chatModel.stream([
                new SystemMessage(systemPrompt),
                ...chatHistory,
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
    static updateMessage = async (req: Request, res: Response) => {
        try {
            const supabase = (req as any).supabase;
            const { messageId } = req.params;
            const { message } = req.body;
            const { error } = await supabase
                .from('messages')
                .update(message)
                .eq('id', messageId);

            if (error) throw error;
            res.status(200).json({ message: 'Message updated successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
    static updateChat = async (req: Request, res: Response) => {
        try {
            const supabase = (req as any).supabase;
            const { chatId } = req.params;
            const { chat } = req.body;
            const { error } = await supabase
                .from('chats')
                .update(chat)
                .eq('id', chatId);

            if (error) throw error;
            res.status(200).json({ message: 'Chat updated successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default ChatController; 