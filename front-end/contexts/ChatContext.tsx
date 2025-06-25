'use client'
import { ChatMessage, Message } from "@/types";
import React, { createContext, useContext, useState, useEffect } from "react";
import { sendMessage, createMessage, createChat, updateMessage as updateMessageApi, updateChat, getChat, getChats, getMessages, deleteMessage as deleteMessageApi, deleteChat as deleteChatApi } from "@/app/api/chat";
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
    isMessagesLoading: boolean;
    setIsMessagesLoading: (isLoading: boolean) => void;
    updateChatHistory: (messageId: string, newMessage: string) => void;
    updateMessage: (messageId: string, content: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    deleteCurrentChat: () => Promise<void>;
    clearMessages: () => void;
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
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);

    const sendStreamMessage = async (newMessage: string) => {
        setIsLoading(true);
        let assistantMessage: Message | null = null;
        try {
            if (!chatId) {
                const response = await createChat();
                if (!response.data) {
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
                    title: newMessage.substring(0, 50)
                });
                setChatHistory(prev => prev.map(chat =>
                    chat.id === chatId ? {
                        ...chat,
                        title: newMessage.substring(0, 50)
                    } : chat
                ));
            }

            const userMessage: Message = {
                id: Date.now().toString(),
                chat_id: chatId,
                role: 'user',
                content: newMessage,
                status: 'done',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            assistantMessage = {
                id: (Date.now() + 1).toString(),
                chat_id: chatId,
                role: 'assistant',
                content: "",
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            setMessages(prev => [...prev, userMessage, assistantMessage!]);

            const userMessageResponse = await createMessage({
                chat_id: userMessage.chat_id,
                role: userMessage.role,
                content: userMessage.content,
                status: userMessage.status,
                created_at: userMessage.created_at,
                updated_at: userMessage.updated_at
            });
            if (userMessageResponse.data) {
                userMessage.id = userMessageResponse.data.id;
                setMessages(prev => prev.map(msg =>
                    msg.id === Date.now().toString() ? userMessage : msg
                ));
            }

            const assistantMessageResponse = await createMessage({
                chat_id: assistantMessage!.chat_id,
                role: assistantMessage!.role,
                content: assistantMessage!.content,
                status: assistantMessage!.status,
                created_at: assistantMessage!.created_at,
                updated_at: assistantMessage!.updated_at
            });
            if (assistantMessageResponse.data) {
                assistantMessage!.id = assistantMessageResponse.data.id;
                setMessages(prev => prev.map(msg =>
                    msg.id === (Date.now() + 1).toString() ? assistantMessage! : msg
                ));
            }

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

            const updatedMessage: Partial<Message> = {
                id: assistantMessage!.id,
                content: finalContent,
                status: "done" as const,
                updated_at: new Date().toISOString()
            };
            await updateMessageApi(updatedMessage);
            setMessages(prev => {
                const newMessages = [...prev];
                const index = newMessages.findIndex(msg => msg.id === assistantMessage!.id);
                if (index !== -1) {
                    newMessages[index] = {
                        ...newMessages[index],
                        ...updatedMessage
                    };
                }
                return newMessages;
            });

        } catch (error: any) {
            console.error('Error in sendStreamMessage:', error);
            
            // Handle subscription-related errors
            if (error.response?.status === 403 && error.response?.data?.code) {
                const { code, message } = error.response.data;
                
                if (code === 'NO_SUBSCRIPTION' || code === 'SUBSCRIPTION_EXPIRED') {
                    // Show subscription error message
                    if (assistantMessage) {
                        const errorMessage: Partial<Message> = {
                            id: assistantMessage.id,
                            content: `❌ ${message || 'Active subscription required to continue chatting. Please upgrade your plan.'}`,
                            status: "error" as const,
                            updated_at: new Date().toISOString()
                        };
                        await updateMessageApi(errorMessage);
                        setMessages(prev => prev.map(msg =>
                            msg.id === assistantMessage!.id ? { ...msg, ...errorMessage } as Message : msg
                        ));
                    }
                    // Redirect will be handled by axios interceptor
                    return;
                }
            }

            // Handle other errors
            if (assistantMessage) {
                const errorMessage: Partial<Message> = {
                    id: assistantMessage.id,
                    content: "❌ Sorry, there was an error processing your message. Please try again.",
                    status: "error" as const,
                    updated_at: new Date().toISOString()
                };
                await updateMessageApi(errorMessage);
                setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessage!.id ? { ...msg, ...errorMessage } as Message : msg
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
            return;
        }
        
        if (chatId) {
            setIsMessagesLoading(true);
            setIsHistoryLoading(true);
            
            // Load chat info
            getChat(chatId).then(response => {
                setChat(response.data);
            }).catch(error => {
                console.error('Error loading chat:', error);
            });

            // Load messages for the chat
            getMessages(chatId).then(response => {
                setMessages(response.data || []);
                setIsMessagesLoading(false);
                setIsHistoryLoading(false);
            }).catch(error => {
                console.error('Error loading messages:', error);
                setMessages([]);
                setIsMessagesLoading(false);
                setIsHistoryLoading(false);
            });
        } else {
            // Clear messages when no chatId
            setMessages([]);
            setChat(null);
            setIsMessagesLoading(false);
            setIsHistoryLoading(false);
            setIsLoading(false);
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

    const deleteMessage = async (messageId: string) => {
        try {
            if (!chatId) return;
            
            // Delete message from database
            await deleteMessageApi(chatId, messageId);
            
            // Remove message from local state
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const deleteCurrentChat = async () => {
        try {
            if (!chatId) return;
            
            // Delete chat from database
            await deleteChatApi(chatId);
            
            // Remove chat from history
            setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
            
            // Navigate to chat page without ID
            router.push('/chat');
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };

    const clearMessages = () => {
        setMessages([]);
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
            isMessagesLoading,
            setIsMessagesLoading,
            updateChatHistory,
            updateMessage,
            deleteMessage,
            deleteCurrentChat,
            clearMessages
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