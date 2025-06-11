"use client";
import LeftSideBar from "@/components/chat/LeftSideBar";
import MainBoard from "@/components/chat/MainBoard";
import { useChat } from "@/contexts/ChatContext";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { getMessages } from "@/app/api/chat";

const ChatPage: React.FC = () => {
    const { id } = useParams();
    const { setMessages, setIsHistoryLoading } = useChat();
    useEffect(() => {
        const fetchChat = async () => {
            setIsHistoryLoading(true);
            const response = await getMessages(id as string);
            setMessages(response.data);
            setIsHistoryLoading(false);
        };
        fetchChat();
    }, [id, setMessages, setIsHistoryLoading]);
    return (
        <div className="flex min-h-screen justify-center items-center flex-row w-full h-full bg-white relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <LeftSideBar />
            <MainBoard />
        </div>
    );
};

export default ChatPage;