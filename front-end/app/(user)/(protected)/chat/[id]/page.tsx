"use client";
import LeftSideBar from "@/components/chat/LeftSideBar";
import MainBoard from "@/components/chat/MainBoard";
import { useChat } from "@/contexts/ChatContext";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { getMessages } from "@/app/api/chat";

const ChatPage: React.FC = () => {
    const { id } = useParams();
    const { setMessages } = useChat();
    useEffect(() => {
        const fetchChat = async () => {
            const response = await getMessages(id as string);
            setMessages(response.data);
        };
        fetchChat();
    }, [id]);
    return (
        <div className="flex flex-row justify-center items-center w-full h-full">
            <LeftSideBar />
            <MainBoard />
        </div>
    );
};

export default ChatPage;