"use client"
// import { Button } from "@heroui/button";
import Image from "next/image";
import ChatInput from "./ChatInput";
import { useEffect, useRef, useCallback, useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import { motion, AnimatePresence } from "framer-motion";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Button, Skeleton, Textarea } from "@heroui/react";

const MessageSkeleton = ({ isUser = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
        <div className={`p-3 rounded-lg ${isUser ? 'bg-green-100' : 'bg-gray-100'} w-[80%] md:w-[60%]`}>
            <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-3/4 rounded-lg bg-default-200" />
                <Skeleton className="h-4 w-full rounded-lg bg-default-200" />
                <Skeleton className="h-4 w-2/3 rounded-lg bg-default-200" />
            </div>
        </div>
    </motion.div>
);

const ThinkingAnimation = () => (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-100 text-gray-800">
        <div className="flex gap-1">
            <motion.div
                className="w-2 h-2 rounded-full bg-gray-400"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.div
                className="w-2 h-2 rounded-full bg-gray-400"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
                className="w-2 h-2 rounded-full bg-gray-400"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
        </div>
        <span className="text-sm text-gray-500">Thinking...</span>
    </div>
);

const MainBoard: React.FC = () => {
    const { messages, isLoading, sendStreamMessage, isHistoryLoading, updateChatHistory } = useChat();
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, scrollToBottom]);

    const handleSendMessage = async (message: string) => {
        sendStreamMessage(message);
        setTimeout(scrollToBottom, 100);
    };

    const handleEditMessage = (messageId: string, content: string) => {
        setEditingMessageId(messageId);
        setEditContent(content);
    };

    const handleSaveEdit = async () => {
        if (editingMessageId && editContent.trim()) {
            updateChatHistory(editingMessageId, editContent);
            setEditingMessageId(null);
            setEditContent("");
        }
    };

    const handleCancelEdit = () => {
        setEditingMessageId(null);
        setEditContent("");
    };

    if (isHistoryLoading) {
        return (
            <div className="max-w-[900px] w-full h-full flex items-center justify-center relative">
                <motion.div
                    className="flex flex-col gap-4 p-4 w-[inherit] relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-col gap-4 w-[inherit] h-[500px] overflow-y-auto scrollbar-hide">
                        {[1, 2, 3, 4].map((_, index) => (
                            <MessageSkeleton key={index} isUser={index % 2 === 0} />
                        ))}
                    </div>
                    <ChatInput onSendMessage={handleSendMessage} disabled={true} props={{
                        className: "border-2 border-gray-200 shadow-lg opacity-50"
                    }} />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-[800px] w-full h-full flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <motion.div
                className="flex flex-col gap-4 p-4 w-[inherit] relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <AnimatePresence>
                    {messages.length > 0 ? (
                        <motion.div
                            key="messages"
                            ref={messagesContainerRef}
                            className="flex flex-col gap-4 w-[inherit] h-[500px] overflow-y-auto scrollbar-hide"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            {messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`p-3 rounded-lg relative group ${message.role === 'user'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {editingMessageId === message.id ? (
                                            <div className="flex flex-col gap-2">
                                                <Textarea
                                                    value={editContent}
                                                    onChange={(e: any) => setEditContent(e.target.value)}
                                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    rows={3}
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        onClick={handleCancelEdit}
                                                        isIconOnly
                                                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                                        variant="light"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </Button>
                                                    <Button
                                                        onClick={handleSaveEdit}
                                                        isIconOnly
                                                        className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {message.role === 'assistant' ? (
                                                    message.status === 'pending' ? (
                                                        <ThinkingAnimation />
                                                    ) : (
                                                        <MarkdownRenderer content={message.content} />
                                                    )
                                                ) : (
                                                    <p>{message.content}</p>
                                                )}
                                                {message.role === 'user' && (
                                                    <Button
                                                        onClick={() => handleEditMessage(message.id, message.content)}
                                                        variant="ghost"
                                                        size="sm"
                                                        isIconOnly
                                                        className="absolute -top-[50%] -right-1 transfrom -translate-x-[5px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                        </svg>
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && messages.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <ThinkingAnimation />
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </motion.div>
                    ) : (
                        <motion.div
                            className="w-[inherit] flex flex-col gap-4 overflow-y-auto max-h-[600px] scrollbar-hide"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="w-full h-full flex items-center justify-center flex-col gap-4">
                                <div className="flex items-center gap-2" role="img" aria-label="Viventis logo and name">
                                    <Image src="/images/logo.png" className="filter invert" alt="Viventis logo" width={54} height={54} />
                                    <p className="text-2xl font-bold text-gray-500">Viventis</p>
                                </div>
                                <div className="text-center text-gray-500">
                                    <p>How can I help you today?</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} props={{
                    className: "border-2 border-gray-200 shadow-lg"
                }} />
            </motion.div>
        </div>
    );
};

export default MainBoard;