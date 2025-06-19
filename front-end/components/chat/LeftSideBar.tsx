"use client";

import Image from "next/image";
import { Button } from "@heroui/button";
import { MenuIcon, PlusIcon, ArrowLeftIcon } from "@/components/icons";
import { useCallback, useEffect, useState } from "react";
import { ChatMessage } from "@/types";
import { getChats } from "@/app/api/chat";
import { useRouter } from "next/navigation";
import { useChat } from "@/contexts/ChatContext";
import { Modal, ModalContent, ModalHeader, Spinner } from "@heroui/react";
import { signOut } from "@/app/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

const LeftSideBar: React.FC = () => {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { chatHistory, isHistoryLoading } = useChat();
    const { setMessages } = useChat();
    const { user, setUser, setLoading } = useAuth();
    const { subscription } = useSubscription();
    const [isOpen, setIsOpen] = useState(false);
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
        setMessages([]);
        router.push(`/chat/${chatId}`);
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
                    aria-label="Close sidebar"
                />
            )}
            {!isSidebarOpen && (
                <Button
                    isIconOnly
                    variant="faded"
                    className="fixed left-0 top-[50%] -translate-y-1/2 z-50 rounded-l-none"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <ArrowLeftIcon />
                </Button>
            )}
            <section 
                className={`fixed top-0 left-0 w-[300px] h-screen z-50 drop-shadow-lg bg-color transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="w-full h-full p-5 flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Image src="/images/logo.png" alt="logo" width={32} height={32} />
                            <h1 className="text-white text-2xl font-bold">Viventis</h1>
                        </div>
                        <div>
                            <Button isIconOnly variant="faded" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                <MenuIcon />
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="solid" className="gap-2" onClick={() => handleCreateChat()}>
                            <PlusIcon />
                            <h1>New Chat</h1>
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-500">
                        <div className="flex flex-col gap-2">
                            {isHistoryLoading ? (
                                <div className="flex justify-center py-4">
                                    <Spinner />
                                </div>
                            ) : chatHistory.length === 0 ? (
                                <div className="flex items-center justify-center py-4">
                                    <h6 className="text-white font-bold">No chats found</h6>
                                </div>
                            ) : (
                                chatHistory.map((chat) => (
                                    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                                    <div
                                        key={chat.id}
                                        className="cursor-pointer hover:bg-gray-700 p-2 rounded"
                                        onClick={() => handleChatClick(chat.id)}
                                    >
                                        <h6 className="text-white">{chat.title ? chat.title : "Untitled"}</h6>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(chat.updated_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="flex flex-row justify-between gap-2">
                        <div></div>
                        <Button variant="light" className="rounded-full" color="primary" isIconOnly onClick={() => {
                            setIsOpen(true);
                            console.log(subscription);
                        }}>
                            <Image src="/images/pre.svg" alt="pre" width={32} height={32} className="w-6 h-6" />
                        </Button>
                    </div>
                    {user && (  
                        <Button variant="solid" className="w-full" onClick={() => handleLogout()}>
                            Logout
                        </Button>
                    )}
                </div>
                <Modal
                    isOpen={isOpen}
                    onOpenChange={setIsOpen}
                >
                    <ModalContent>
                        <ModalHeader>
                            <h1>Upgrade to Pro</h1>
                            <p>
                                {subscription ? `Status: ${subscription.status}` : 'No subscription'}
                            </p>
                        </ModalHeader>
                    </ModalContent>
                </Modal>
            </section>
        </>
    );
};

export default LeftSideBar; 