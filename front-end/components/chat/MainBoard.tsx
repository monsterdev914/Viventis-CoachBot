"use client"
// import { Button } from "@heroui/button";
import Image from "next/image";
import ChatInput from "./ChatInput";
import { useEffect, useRef } from "react";
import { useChat } from "@/contexts/ChatContext";
import { motion, AnimatePresence } from "framer-motion";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const MainBoard: React.FC = () => {
    const { messages, isLoading, sendStreamMessage } = useChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (newMessage: { content: string; role: "user" | "assistant" }) => {
        sendStreamMessage(newMessage.content);
    };

    return (
        <div className="max-w-[900px] h-full flex items-center justify-center relative">
            <motion.div
                className="flex flex-col gap-4 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <AnimatePresence>
                    {messages.length > 0 ? (
                        <motion.div
                            key="messages"
                            className="flex flex-col gap-4 h-[500px] overflow-y-auto scrollbar-hide"
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
                                    <div className={`p-3 rounded-lg ${message.role === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {message.role === 'assistant' ? (
                                            <MarkdownRenderer content={message.content} />
                                        ) : (
                                            <p>{message.content}</p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </motion.div>
                    ) : (
                        <motion.div
                            className="w-full flex flex-col gap-4 overflow-y-auto max-h-[600px] scrollbar-hide"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="w-full h-full flex items-center justify-center flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <Image src="/images/logo.png" alt="logo" width={54} height={54} />
                                    <p className="text-2xl font-bold">Viventis</p>
                                </div>
                                <div>
                                    <p>How can I help you today?</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} props={{
                    className: ""
                }} />
            </motion.div>
        </div>
    );
};

export default MainBoard;