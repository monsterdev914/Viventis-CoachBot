"use client"
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/react";
import { KeyboardEvent, useState } from "react";
import { SendIcon } from "../icons";
import { Message } from "@/types";

interface ChatInputProps {
    onSendMessage: (message: Omit<Message, 'id' | 'chat_id' | 'created_at' | 'updated_at'>) => void;
    disabled: boolean;
    props?: {
        className?: string;
    };
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, props }) => {
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage({
                content: input.trim(),
                role: "user"
            });
            setInput("");
        }
    };

    return (
        <div className={`flex items-center justify-center flex-col rounded-lg bg-white ${props?.className}`}>
            <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                size="lg"
                classNames={{
                    input: "bg-white opacity-100 caret-black ",
                    inputWrapper: "bg-white opacity-100 focus:bg-white shadow-none hover:bg-white data-[hover=true]:bg-white data-[focus=true]:bg-white group-data-[focus=true]:bg-white group-data-[focus-visible=true]:bg-white",
                    base: "bg-white opacity-100 focus:bg-white hover:bg-white rounded-t-lg data-[hover=true]:bg-white data-[focus=true]:bg-white group-data-[focus-visible=true]:bg-white group-data-[focus=true]:bg-white"
                }}
                onKeyDown={(e: KeyboardEvent) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
            />
            <div className="flex flex-row w-full items-center justify-between gap-2 p-2 pt-0">
                <div>
                </div>
                <Button
                    isIconOnly
                    className="text-white bg-black rounded-full"
                    onClick={handleSend}
                >
                    <SendIcon size={18} />
                </Button>
            </div>
        </div>
    )
}

export default ChatInput;