"use client"
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/react";
import { KeyboardEvent, useState } from "react";
import { SendIcon } from "../icons";
import { useTranslation } from "react-i18next";

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    disabled: boolean;
    props?: {
        className?: string;
    };
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, props }) => {
    const [input, setInput] = useState("");
    const { t } = useTranslation();
    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput("");
        }
    };

    return (
        <div className={`flex items-center justify-center flex-col rounded-lg border border-gray-200 shadow-lg bg-white ${props?.className}`}>
            <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`${t("chat.typeMessage")}`}
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