"use client"
// import { Button } from "@heroui/button";
import Image from "next/image";
import ChatInput from "./ChatInput";
import { useEffect, useRef, useCallback, useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import { motion, AnimatePresence } from "framer-motion";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Button, Skeleton, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";

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
    const { messages, isLoading, sendStreamMessage, isHistoryLoading, updateChatHistory, deleteMessage, deleteCurrentChat, clearMessages } = useChat();
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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

    const handleDeleteMessage = async (messageId: string) => {
        try {
            setIsDeleting(true);
            await deleteMessage(messageId);
            setShowDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting message:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClearChat = async () => {
        try {
            await deleteCurrentChat();
            setShowClearConfirm(false);
        } catch (error) {
            console.error('Error clearing chat:', error);
        }
    };

    if (isHistoryLoading) {
        return (
            <div className="max-w-[800px] w-full flex-1 flex flex-col relative">
                {/* Skeleton Messages Area */}
                <div className="flex-1 overflow-hidden min-h-0">
                    <motion.div
                        className="h-full px-4 pt-4 pb-2 overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3, 4, 5, 6].map((_, index) => (
                                <MessageSkeleton key={index} isUser={index % 2 === 0} />
                            ))}
                        </div>
                    </motion.div>
                </div>
                
                {/* Skeleton Input Area */}
                <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white sticky bottom-0">
                    <ChatInput onSendMessage={handleSendMessage} disabled={true} props={{
                        className: "border-2 border-gray-200 shadow-lg opacity-50 pointer-events-none"
                    }} />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[800px] w-full flex-1 flex flex-col relative">
            {/* Messages Area */}
            <div className="flex-1 overflow-hidden min-h-0">
                <AnimatePresence>
                    {messages.length > 0 ? (
                        <motion.div
                            key="messages"
                            ref={messagesContainerRef}
                            className="h-full px-4 pt-4 pb-2 overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex flex-col gap-4">
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
                                                        <div className="absolute -top-[50%] -right-1 transform -translate-x-[5px] flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                onClick={() => handleEditMessage(message.id, message.content)}
                                                                variant="ghost"
                                                                size="sm"
                                                                isIconOnly
                                                                className="rounded-full p-1"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                </svg>
                                                            </Button>
                                                            <Button
                                                                onClick={() => setShowDeleteConfirm(message.id)}
                                                                variant="ghost"
                                                                size="sm"
                                                                isIconOnly
                                                                className="rounded-full p-1 text-red-500 hover:text-red-700"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {message.role === 'assistant' && (
                                                        <Button
                                                            onClick={() => setShowDeleteConfirm(message.id)}
                                                            variant="ghost"
                                                            size="sm"
                                                            isIconOnly
                                                            className="absolute -top-[50%] -right-1 transform -translate-x-[5px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-500 hover:text-red-700"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
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
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="h-full px-4 pt-4 pb-2 flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex flex-col items-center gap-4">
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
            </div>
            
            {/* Input Area - Fixed to viewport bottom */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-[#FFFFFF] bg-opacity-50 backdrop-blur-sm sticky bottom-0">
                {messages.length > 0 && (
                    <div className="flex justify-end mb-2">
                        <Button
                            size="sm"
                            variant="light"
                            color="danger"
                            onClick={() => setShowClearConfirm(true)}
                            className="text-xs"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Clear Chat
                        </Button>
                    </div>
                )}
                <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} props={{
                    className: "border-2 border-gray-200 shadow-lg"
                }} />
            </div>

            {/* Delete Message Confirmation Modal */}
            <Modal 
                isOpen={showDeleteConfirm !== null} 
                onOpenChange={() => setShowDeleteConfirm(null)}
                size="sm"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h3 className="text-lg text-black font-sans">Delete Message</h3>
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-gray-600">
                                    Are you sure you want to delete this message? This action cannot be undone.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button 
                                    color="danger" 
                                    onPress={() => showDeleteConfirm && handleDeleteMessage(showDeleteConfirm)}
                                    isLoading={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Clear Chat Confirmation Modal */}
            <Modal 
                isOpen={showClearConfirm} 
                onOpenChange={setShowClearConfirm}
                size="sm"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h3 className="text-lg text-black font-sans">Clear Chat</h3>
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-gray-600">
                                    Are you sure you want to delete this entire chat? This will permanently delete all messages and cannot be undone.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button 
                                    color="danger" 
                                    onPress={handleClearChat}
                                    isLoading={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete Chat'}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default MainBoard;