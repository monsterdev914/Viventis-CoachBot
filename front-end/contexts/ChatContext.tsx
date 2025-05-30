'use client'
import { ChatMessage, Message } from "@/types";
import React, { createContext, useContext, useState, useEffect } from "react";
import { sendMessage, createMessage, createChat, updateMessage, updateChat, getChats } from "@/app/api/chat";
import { useParams, useRouter } from "next/navigation";

type ChatContextType = {
    messages: Message[];
    setMessages: (messages: Message[]) => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    sendStreamMessage: (newMessage: string) => Promise<void>;
    pendingMessage: string | null;
    setPendingMessage: (message: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const params = useParams();
    const router = useRouter();
    const chatId = params?.id as string;
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingMessage, setPendingMessage] = useState<string | null>(null);

    // Handle pending message when URL changes
    useEffect(() => {
        if (chatId && pendingMessage) {
            setPendingMessage(null);
            sendStreamMessage(pendingMessage);
        }
    }, [chatId]);

    const sendStreamMessage = async (newMessage: string) => {
        setIsLoading(true);
        let assistantMessage: Message | null = null;

        try {
            // If we're at the root chat route, create a new chat and store the message
            if (!chatId) {
                const response = await createChat();
                if (!response) {
                    throw new Error('Failed to create chat');
                }
                const newChatId = response.data.id;
                setPendingMessage(newMessage);
                router.push(`/chat/${newChatId}`);
                return;
            }

            // Add user message 
            await updateChat({
                id: chatId,
                updated_at: new Date().toISOString(),
                title: newMessage
            });

            // Async Sidebar
            const userResponse = await createMessage({
                chat_id: chatId,
                content: newMessage,
                role: "user",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: "done"
            });
            setMessages(prev => [...prev, userResponse.data]);

            // Create assistant message placeholder
            const assistantResponse = await createMessage({
                chat_id: chatId,
                content: "",
                role: "assistant",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: "pending"
            });
            assistantMessage = assistantResponse.data;
            if (assistantMessage) {
                setMessages(prev => [...prev, assistantMessage!]);

                let finalContent = "";
                await sendMessage(
                    messages.slice(-10).map(msg => `${msg.role}: ${msg.content}`),
                    newMessage,
                    (chunk) => {
                        finalContent += chunk;
                        setMessages(prev => {
                            return prev.map(msg => {
                                if (msg.id === assistantMessage!.id) {
                                    return {
                                        ...msg,
                                        content: finalContent,
                                        updated_at: new Date().toISOString()
                                    };
                                }
                                return msg;
                            });
                        });
                    }
                );

                // Update the final message state
                const updatedMessage: Message = {
                    ...assistantMessage,
                    content: finalContent,
                    status: "done" as const,
                    updated_at: new Date().toISOString()
                };
                await updateMessage(updatedMessage);
                setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessage!.id ? updatedMessage : msg
                ));
            }
        } catch (error) {
            console.error('Error sending message:', error);
            if (assistantMessage) {
                const errorMessage: Message = {
                    ...assistantMessage,
                    status: "error" as const,
                    updated_at: new Date().toISOString()
                };
                await updateMessage(errorMessage);
                setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessage!.id ? errorMessage : msg
                ));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ChatContext.Provider value={{ messages, setMessages, isLoading, setIsLoading, sendStreamMessage, pendingMessage, setPendingMessage }}>
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