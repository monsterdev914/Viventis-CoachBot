import { ChatProvider } from "@/contexts/ChatContext";
import ProtectedChatRoute from "@/components/auth/ProtectedChatRoute";

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProtectedChatRoute>
            <ChatProvider>
                {children}
            </ChatProvider>
        </ProtectedChatRoute>
    );
};

export default ChatLayout;