"use client";
import LeftSideBar from "@/components/chat/LeftSideBar";
import MainBoard from "@/components/chat/MainBoard";
import { ChatProvider } from "@/contexts/ChatContext";

const ChatPage = () => {
    return (
        <div className="flex justify-center items-center flex-row w-full h-full">
            <LeftSideBar />
            <MainBoard />
        </div>
    );
};

export default ChatPage; 