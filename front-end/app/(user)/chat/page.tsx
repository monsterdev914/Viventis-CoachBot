import LeftSideBar from "@/components/chat/LeftSideBar";
import MainBoard from "@/components/chat/MainBoard";
import { ChatProvider } from "@/contexts/ChatContext";
const ChatPage: React.FC = () => {
    return (
        <ChatProvider>
            <LeftSideBar />
            <MainBoard />
        </ChatProvider>
    );
};

export default ChatPage;