"use client";
import LeftSideBar from "@/components/chat/LeftSideBar";
import MainBoard from "@/components/chat/MainBoard";

const ChatPage: React.FC = () => {
    return (
        <div className="flex justify-center items-center flex-col flex-1 bg-white relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <LeftSideBar />
            <MainBoard />
        </div>
    );
};

export default ChatPage;