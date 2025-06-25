"use client"
// import { Button } from "@heroui/button";
import Image from "next/image";
import ChatInput from "./ChatInput";
import { useEffect, useRef, useCallback, useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import { motion, AnimatePresence } from "framer-motion";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Button, Skeleton, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { useTranslation } from 'react-i18next';

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
const MainBoard: React.FC = () => {
    const { t } = useTranslation();
    const { messages, isLoading, sendStreamMessage, isHistoryLoading, updateChatHistory, deleteMessage, deleteCurrentChat } = useChat();
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);


    const scrollToBottom = useCallback(() => {
        // Try multiple approaches to ensure scrolling works
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        } else if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, []);

    // Enhanced scroll effect that triggers on message changes
    useEffect(() => {
        // Scroll immediately
        scrollToBottom();
        
        // Also scroll after a short delay to account for DOM updates and animations
        const timeoutId = setTimeout(() => {
            scrollToBottom();
        }, 100);

        // Additional scroll after animations complete
        const animationTimeoutId = setTimeout(() => {
            scrollToBottom();
        }, 500);

        return () => {
            clearTimeout(timeoutId);
            clearTimeout(animationTimeoutId);
        };
    }, [messages, isLoading, scrollToBottom]);

    // Additional effect to scroll when messages array length changes (new message added)
    useEffect(() => {
        if (messages.length > 0) {
            // Immediate scroll for new messages
            scrollToBottom();
            
            // Delayed scroll to ensure DOM is updated
            const timeoutId = setTimeout(scrollToBottom, 50);
            const secondTimeoutId = setTimeout(scrollToBottom, 200);
            
            return () => {
                clearTimeout(timeoutId);
                clearTimeout(secondTimeoutId);
            };
        }
    }, [messages.length, scrollToBottom]);

    // Effect to handle scrolling when thinking animation appears/disappears
    useEffect(() => {
        if (isLoading) {
            // Scroll when thinking animation appears
            const timeoutId = setTimeout(scrollToBottom, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [isLoading, scrollToBottom]);

    // MutationObserver to handle dynamic content changes (like streaming messages)
    useEffect(() => {
        const messagesContainer = messagesContainerRef.current;
        if (!messagesContainer) return;

        const observer = new MutationObserver((mutations) => {
            // Check if any mutations added nodes or changed text content
            const hasContentChanges = mutations.some(mutation => 
                mutation.type === 'childList' && mutation.addedNodes.length > 0 ||
                mutation.type === 'characterData'
            );
            
            if (hasContentChanges) {
                // Scroll after a brief delay to allow for DOM updates
                setTimeout(scrollToBottom, 50);
            }
        });

        observer.observe(messagesContainer, {
            childList: true,
            subtree: true,
            characterData: true
        });

        return () => observer.disconnect();
    }, [scrollToBottom]);

    const handleSendMessage = async (message: string) => {
        sendStreamMessage(message);
        // Multiple scroll attempts to ensure it works
        setTimeout(scrollToBottom, 50);
        setTimeout(scrollToBottom, 200);
        setTimeout(scrollToBottom, 500);
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
                                                    {/* Show loading state for assistant messages being regenerated */}
                                                    {message.role === 'assistant' && message.status === 'pending' && !message.content ? (
                                                        <div className="flex items-center gap-2 text-gray-500">
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
                                                            <span className="text-sm">{t('chat.thinking')}</span>
                                                        </div>
                                                    ) : (
                                                        <MarkdownRenderer content={message.content} />
                                                    )}
                                                    
                                                    {/* Action buttons - show on hover */}
                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                        {message.role === 'user' && (
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="light"
                                                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                                onClick={() => handleEditMessage(message.id, message.content)}
                                                                aria-label={t('chat.editMessage')}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                </svg>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => setShowDeleteConfirm(message.id)}
                                                            aria-label={t('chat.deleteMessage')}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <div ref={messagesEndRef} className="h-4" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            className="h-full flex flex-col items-center justify-center text-center px-4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="w-24 h-24 mb-6 relative">
                                <Image
                                    src="/images/bot.png"
                                    alt="CoachBot"
                                    fill
                                    className="object-contain opacity-60"
                                />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-700 mb-2">
                                {t('chat.noMessages')}
                            </h2>
                            <p className="text-gray-500 max-w-md">
                                {t('chat.messagePlaceholder')}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Clear Chat Button - only show when there are messages */}
            {messages.length > 0 && (
                <div className="flex-shrink-0 px-4 py-2 bg-white border-t border-gray-200">
                    <div className="flex justify-center">
                        <Button
                            variant="light"
                            color="danger"
                            size="sm"
                            onClick={() => setShowClearConfirm(true)}
                            className="text-red-500 hover:text-red-700"
                        >
                            {t('chat.clearChat')}
                        </Button>
                    </div>
                </div>
            )}
            
            {/* Input Area */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white sticky bottom-0">
                <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
            </div>

            {/* Delete Message Confirmation Modal */}
            <Modal 
                isOpen={showDeleteConfirm !== null} 
                onClose={() => setShowDeleteConfirm(null)}
                size="md"
            >
                <ModalContent>
                    <ModalHeader>
                        <h3 className="text-lg font-semibold text-black">{t('chat.deleteMessage')}</h3>
                    </ModalHeader>
                    <ModalBody>
                        <p className="text-gray-600">
                            {t('chat.confirmDeleteMessage')}
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="light"
                            onPress={() => setShowDeleteConfirm(null)}
                            disabled={isDeleting}
                        >
                            {t('userManagement.cancel')}
                        </Button>
                        <Button
                            color="danger"
                            onPress={() => showDeleteConfirm && handleDeleteMessage(showDeleteConfirm)}
                            isLoading={isDeleting}
                        >
                            {isDeleting ? t('chat.deleting') : t('Delete')}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Clear Chat Confirmation Modal */}
            <Modal 
                isOpen={showClearConfirm} 
                onClose={() => setShowClearConfirm(false)}
                size="md"
            >
                <ModalContent>
                    <ModalHeader>
                        <h3 className="text-lg font-semibold text-black">{t('chat.clearChat')}</h3>
                    </ModalHeader>
                    <ModalBody>
                        <p className="text-gray-600">
                            {t('chat.confirmClearChat')}
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="light"
                            onPress={() => setShowClearConfirm(false)}
                        >
                            {t('userManagement.cancel')}
                        </Button>
                        <Button
                            color="danger"
                            onPress={handleClearChat}
                        >
                            {t('chat.clearChat')}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default MainBoard;