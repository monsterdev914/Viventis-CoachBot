'use client'
import { Message } from "@/types";
import React, { createContext, useContext, useState } from "react";
import { sendMessage } from "@/app/api/chat";

type ChatContextType = {
    messages: Message[];
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Omit<Message, 'id' | 'chat_id' | 'created_at' | 'updated_at'>) => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    sendStreamMessage: (content: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const addMessage = (newMessage: Omit<Message, 'id' | 'chat_id' | 'created_at' | 'updated_at'>) => {
        const message: Message = {
            ...newMessage,
            id: Date.now().toString(),
            chat_id: "1",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, message]);
    };

    const sendStreamMessage = async (content: string) => {
        setIsLoading(true);

        // Add user message
        addMessage({ content, role: "user" });

        // Create assistant message placeholder
        const assistantMessageId = Date.now().toString() + 1;
        const assistantMessage: Message = {
            id: assistantMessageId,
            chat_id: "1",
            content: "",
            role: "assistant",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);

        try {
            await sendMessage(content, (chunk) => {
                console.log(chunk)
                setMessages(prev => {
                    return prev.map(msg => {
                        if (msg.id === assistantMessageId) {
                            return {
                                ...msg,
                                content: msg.content + chunk,
                                updated_at: new Date().toISOString()
                            };
                        }
                        return msg;
                    });
                });
            });
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ChatContext.Provider value={{ messages, setMessages, addMessage, isLoading, setIsLoading, sendStreamMessage }}>
            {children}
        </ChatContext.Provider>
    );
}

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}

export default ChatContext; 