import { ChatProvider } from "@/contexts/ChatContext";

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ChatProvider>
            {children}
        </ChatProvider>
    );
};

export default ChatLayout;