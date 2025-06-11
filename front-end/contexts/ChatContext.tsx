'use client'
import { ChatMessage, Message } from "@/types";
import React, { createContext, useContext, useState, useEffect } from "react";
import { sendMessage, createMessage, createChat, updateMessage as updateMessageApi, updateChat, getChat, getChats } from "@/app/api/chat";
import { useParams, useRouter } from "next/navigation";

type ChatContextType = {
    messages: Message[];
    setMessages: (messages: Message[]) => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    sendStreamMessage: (newMessage: string) => Promise<void>;
    pendingMessage: string | null;
    setPendingMessage: (message: string | null) => void;
    chat: ChatMessage | null;
    setChat: (chat: ChatMessage | null) => void;
    chatHistory: ChatMessage[];
    setChatHistory: (chatHistory: ChatMessage[]) => void;
    isHistoryLoading: boolean;
    setIsHistoryLoading: (isHistoryLoading: boolean) => void;
    updateChatHistory: (messageId: string, newMessage: string) => void;
    updateMessage: (messageId: string, content: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const params = useParams();
    const router = useRouter();
    const chatId = params?.id as string;
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingMessage, setPendingMessage] = useState<string | null>(null);
    const [chat, setChat] = useState<ChatMessage | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    const sendStreamMessage = async (newMessage: string) => {
        setIsLoading(true);
        let assistantMessage: Message | null = null;

        try {
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

            if (chat == null) {
                await updateChat({
                    id: chatId,
                    updated_at: new Date().toISOString(),
                    title: newMessage
                });
                setChatHistory(prev => prev.map(chat =>
                    chat.id === chatId ? {
                        ...chat,
                        title: newMessage
                    } : chat
                ));
            }

            const userResponse = await createMessage({
                chat_id: chatId,
                content: newMessage,
                role: "user",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: "done"
            });
            setMessages(prev => [...prev, userResponse.data]);

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

                const updatedMessage: Message = {
                    ...assistantMessage,
                    content: finalContent,
                    status: "done" as const,
                    updated_at: new Date().toISOString()
                };
                await updateMessageApi(updatedMessage);
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
                await updateMessageApi(errorMessage);
                setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessage!.id ? errorMessage : msg
                ));
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (chatId && pendingMessage) {
            setPendingMessage(null);
            sendStreamMessage(pendingMessage);
        }
        if (chatId) {
            getChat(chatId).then(response => {
                setChat(response.data);
            });
        }
    }, [chatId]);

    useEffect(() => {
        setIsHistoryLoading(true);
        getChats().then(response => {
            setChatHistory(response.data);
            console.log(response.data);
            setIsHistoryLoading(false);
        });
    }, []);

    const updateChatHistory = async (messageId: string, newMessage: string) => {
        try {
            //update message in database
            await updateMessageApi({
                id: messageId,
                content: newMessage,
                updated_at: new Date().toISOString()
            });

            //update chat history
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? {
                    ...msg,
                    content: newMessage,
                    updated_at: new Date().toISOString()
                } : msg
            ));

            try {
                if (messageId) {
                    //get message messageID next message id
                    const nextMessageId = messages.findIndex((msg: Message, index: number) => msg.id === messageId);
                    const nextMessage = messages[nextMessageId + 1];

                    // Set loading state for the next message (assistant's response)
                    setMessages(prev => prev.map(msg =>
                        msg.id === nextMessage.id ? {
                            ...msg,
                            status: "pending"
                        } : msg
                    ));

                    let finalContent = "";
                    await sendMessage(
                        messages.slice(-10).map(msg => `${msg.role}: ${msg.content}`),
                        newMessage,
                        (chunk) => {
                            finalContent += chunk;
                            setMessages(prev => {
                                return prev.map(msg => {
                                    if (msg.id === nextMessage.id) {
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

                    const updatedMessage: Partial<Message> = {
                        id: nextMessage.id,
                        content: finalContent,
                        status: "done" as const,
                        updated_at: new Date().toISOString()
                    };
                    await updateMessageApi(updatedMessage);
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const index = newMessages.findIndex(msg => msg.id === nextMessage.id);
                        if (index !== -1) {
                            newMessages[index] = {
                                ...newMessages[index],
                                ...updatedMessage
                            };
                        }
                        return newMessages;
                    });
                }
            } catch (error) {
                console.error('Error regenerating response:', error);
                if (messageId) {
                    const nextMessageId = messages.findIndex((msg: Message) => msg.id === messageId);
                    const nextMessage = messages[nextMessageId + 1];
                    const errorMessage: Partial<Message> = {
                        id: nextMessage.id,
                        status: "error" as const,
                        updated_at: new Date().toISOString()
                    };
                    await updateMessageApi(errorMessage);
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const index = newMessages.findIndex(msg => msg.id === nextMessage.id);
                        if (index !== -1) {
                            newMessages[index] = {
                                ...newMessages[index],
                                ...errorMessage
                            };
                        }
                        return newMessages;
                    });
                }
            }
        } catch (error) {
            console.error('Error updating chat history:', error);
        }
    };

    const updateMessage = async (messageId: string, content: string) => {
        try {
            setIsLoading(true);
            // Find the existing message to preserve its properties
            const existingMessage = messages.find(msg => msg.id === messageId);
            if (!existingMessage) return;
            // Update message in database
            const updatedMessage: Message = {
                ...existingMessage,
                content: content,
                updated_at: new Date().toISOString()
            };
            await updateMessageApi(updatedMessage);

            // Update local messages state
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? {
                    ...msg,
                    content: content,
                    updated_at: new Date().toISOString()
                } : msg
            ));

            // If this is the last user message, update chat history and regenerate response
            const lastUserMessage = messages.filter(m => m.role === 'user').pop();
            if (lastUserMessage?.id === messageId) {
                await updateChatHistory(messageId, content);
            }
        } catch (error) {
            console.error('Error updating message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ChatContext.Provider value={{
            messages,
            setMessages,
            isLoading,
            setIsLoading,
            sendStreamMessage,
            chat,
            setChat,
            pendingMessage,
            setPendingMessage,
            chatHistory,
            setChatHistory,
            isHistoryLoading,
            setIsHistoryLoading,
            updateChatHistory,
            updateMessage
        }}>
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