"use client";

import Image from "next/image";
import { Button } from "@heroui/button";
import { MenuIcon, PlusIcon, ArrowLeftIcon } from "@/components/icons";
import { useCallback, useEffect, useState } from "react";
import { ChatMessage } from "@/types";
import { getChats } from "@/app/api/chat";
import { useRouter, usePathname } from "next/navigation";
import { useChat } from "@/contexts/ChatContext";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Spinner } from "@heroui/react";
import { signOut } from "@/app/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { deleteChat } from "@/app/api/chat";
import { useTranslation } from 'react-i18next';

const LeftSideBar: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { chatHistory, isHistoryLoading, setChatHistory } = useChat();
    const { setMessages } = useChat();
    const { user, userProfile, setUser, setLoading } = useAuth();
    const { subscription, plans } = useSubscription();
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmChatId, setDeleteConfirmChatId] = useState<string | null>(null);

    // Function to get current chat ID from pathname
    const getCurrentChatId = () => {
        const match = pathname.match(/\/chat\/([^\/]+)/);
        return match ? match[1] : null;
    };

    const currentChatId = getCurrentChatId();

    // Function to categorize chats by time
    const categorizeChatsByTime = (chats: any[]) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const categories = {
            today: [] as any[],
            yesterday: [] as any[],
            last7Days: [] as any[],
            last30Days: [] as any[],
            older: {} as Record<string, any[]>
        };

        chats.forEach(chat => {
            const chatDate = new Date(chat.updated_at);
            const chatDateOnly = new Date(chatDate.getFullYear(), chatDate.getMonth(), chatDate.getDate());

            if (chatDateOnly.getTime() === today.getTime()) {
                categories.today.push(chat);
            } else if (chatDateOnly.getTime() === yesterday.getTime()) {
                categories.yesterday.push(chat);
            } else if (chatDateOnly >= sevenDaysAgo) {
                categories.last7Days.push(chat);
            } else if (chatDateOnly >= thirtyDaysAgo) {
                categories.last30Days.push(chat);
            } else {
                // Group by month and year for older chats
                const monthYear = chatDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                if (!categories.older[monthYear]) {
                    categories.older[monthYear] = [];
                }
                categories.older[monthYear].push(chat);
            }
        });

        return categories;
    };

    const categorizedChats = categorizeChatsByTime(chatHistory);

    // Component to render chat category section
    const renderChatCategory = (title: string, chats: any[]) => {
        if (chats.length === 0) return null;

        return (
            <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                    {title}
                </h3>
                <div className="space-y-1">
                    {chats.map((chat) => {
                        const isActive = chat.id === currentChatId;
                        return (
                            <div
                                key={chat.id}
                                className={`group relative cursor-pointer p-2 rounded transition-colors duration-200 ${
                                    isActive 
                                        ? 'bg-green-600 hover:bg-green-700' 
                                        : 'hover:bg-gray-700'
                                }`}
                            >
                                <div
                                    onClick={() => handleChatClick(chat.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleChatClick(chat.id);
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${t('chat.openChat')}: ${chat.title || t('chat.untitled')}`}
                                    className="pr-8"
                                >
                                    <h6 className={`text-sm truncate ${isActive ? 'text-white font-medium' : 'text-white'}`}>
                                        {chat.title || t('chat.untitled')}
                                    </h6>
                                    <p className={`text-xs mt-1 ${isActive ? 'text-green-100' : 'text-gray-400'}`}>
                                        {new Date(chat.updated_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            
                            {/* Delete Button */}
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-100/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmChatId(chat.id);
                                }}
                                aria-label={`${t('chat.deleteChat')}: ${chat.title || t('chat.untitled')}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </Button>
                        </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const handleLogout = useCallback(() => {
        setLoading(true);
        signOut().then((res) => {
            if (res.status === 200) {
                localStorage.removeItem("token");
                setUser(null);
            }
            setLoading(false);
        })
    }, []);
    const handleCreateChat = async () => {
        setMessages([]);
        router.push("/chat");
    };

    const handleChatClick = (chatId: string) => {
        // If clicking on the same chat that's currently active, do nothing
        if (chatId === currentChatId) {
            setIsSidebarOpen(false); // Just close the sidebar
            return;
        }
        
        setMessages([]);
        router.push(`/chat/${chatId}`);
    };

    const handleDeleteChat = async (chatId: string) => {
        try {
            setIsDeleting(true);
            await deleteChat(chatId);
            // Remove from local chat history
            const updatedHistory = chatHistory.filter((chat: ChatMessage) => chat.id !== chatId);
            setChatHistory(updatedHistory);
            setDeleteConfirmChatId(null);
            
            // If we're currently viewing the deleted chat, navigate to chat home
            if (chatId === currentChatId) {
                router.push('/chat');
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
        } finally {
            setIsDeleting(false);
        }
    };
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isSidebarOpen]);

    return (
        <>
            {isSidebarOpen && (
                // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
                    onClick={() => setIsSidebarOpen(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setIsSidebarOpen(false);
                        }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={t('chat.closeMenu')}
                />
            )}
            {!isSidebarOpen && (
                <Button
                    isIconOnly
                    className="fixed top-[100px] left-4 z-30 bg-white text-black shadow-lg border border-gray-200 hover:bg-gray-50"
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label={t('chat.openMenu')}
                >
                    <MenuIcon size={20} />
                </Button>
            )}

            <div className={`fixed top-0 left-0 h-full bg-gray-800 text-white transition-transform duration-300 ease-in-out z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-80`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/images/logo.png"
                                alt="Logo"
                                width={32}
                                height={32}
                                className="rounded-full"
                            />
                            <h2 className="text-lg font-semibold">{t('chat.chatHistory')}</h2>
                        </div>
                        <Button
                            isIconOnly
                            variant="light"
                            onClick={() => setIsSidebarOpen(false)}
                            className="text-gray-400 hover:text-white"
                            aria-label={t('chat.closeMenu')}
                        >
                            <ArrowLeftIcon size={20} />
                        </Button>
                    </div>

                    {/* New Chat Button */}
                    <div className="p-4 border-b border-gray-700">
                        <Button
                            onClick={handleCreateChat}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            startContent={<PlusIcon size={16} />}
                        >
                            {t('chat.newChat')}
                        </Button>
                    </div>

                    {/* Chat History */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {isHistoryLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <Spinner color="white" />
                            </div>
                        ) : (
                            <>
                                {renderChatCategory(t('chat.today'), categorizedChats.today)}
                                {renderChatCategory(t('chat.yesterday'), categorizedChats.yesterday)}
                                {renderChatCategory(t('chat.last7Days'), categorizedChats.last7Days)}
                                {renderChatCategory(t('chat.last30Days'), categorizedChats.last30Days)}
                                
                                {/* Older chats grouped by month */}
                                {Object.entries(categorizedChats.older).map(([monthYear, chats]) => 
                                    renderChatCategory(monthYear, chats)
                                )}
                                
                                {chatHistory.length === 0 && (
                                    <p className="text-gray-400 text-center text-sm">
                                        {t('chat.noMessages')}
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-semibold">
                                        {userProfile?.first_name?.charAt(0) || userProfile?.last_name?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium">{userProfile?.first_name || userProfile?.last_name}</p>
                                    <p className="text-xs text-gray-400">
                                        {plans?.find(plan => plan.id === subscription?.plan_id)?.name || 'Free'}
                                    </p>
                                </div>
                            </div>
                            <Button
                                isIconOnly
                                variant="light"
                                onClick={handleLogout}
                                className="text-gray-400 hover:text-white"
                                aria-label={t('Logout')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                </svg>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal 
                isOpen={deleteConfirmChatId !== null} 
                onClose={() => setDeleteConfirmChatId(null)}
                size="md"
            >
                <ModalContent>
                    <ModalHeader>
                        <h3 className="text-lg font-semibold text-black">{t('chat.deleteChat')}</h3>
                    </ModalHeader>
                    <ModalBody>
                        <p className="text-gray-600">
                            {t('chat.confirmDeleteChat')}
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="light"
                            onPress={() => setDeleteConfirmChatId(null)}
                            disabled={isDeleting}
                        >
                            {t('userManagement.cancel')}
                        </Button>
                        <Button
                            color="danger"
                            onPress={() => deleteConfirmChatId && handleDeleteChat(deleteConfirmChatId)}
                            isLoading={isDeleting}
                        >
                            {isDeleting ? t('chat.deleting') : t('Delete')}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default LeftSideBar; 