const ChatLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <section className="w-full h-full flex items-center justify-center flex items-center justify-center flex items-center justify-center">
            {children}
        </section>
    );
};

export default ChatLayout;
