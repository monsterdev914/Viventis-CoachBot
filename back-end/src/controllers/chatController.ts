import { Request, Response } from "express";
import { supabase } from "../supabaseClient";
import chain from "../lib/langChain";
import { HumanMessage } from "@langchain/core/messages";


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
        // console.log(req.user);
        try {
            const { message } = req.body;
            // const user = (req as any).user;
            // Set headers for SSE
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            // Use LangChain's streaming with proper message format
            const stream = await chain.stream([
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
            res.status(500).json({ error: error.message });
        }
    };
}

export default ChatController; 