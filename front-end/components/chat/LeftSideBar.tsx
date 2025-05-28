"use client";

import Image from "next/image";
import { Button } from "@heroui/button";
import { MenuIcon, PlusIcon, ArrowLeftIcon } from "@/components/icons";
import { useState } from "react";

const LeftSideBar: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
        <>
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
                    onClick={() => setIsSidebarOpen(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setIsSidebarOpen(false);
                        }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Close sidebar"
                />
            )}
            {!isSidebarOpen && (
                <Button
                    isIconOnly
                    variant="faded"
                    className="fixed left-0 top-[50%] -translate-y-1/2 z-50 rounded-l-none "
                    onClick={() => setIsSidebarOpen(true)}
                >
                    {/* Arrow Left Icon */}
                    <ArrowLeftIcon />
                </Button>
            )}
            <section className={`max-w-[300px] w-full absolute left-0 top-0 z-50 drop-shadow-lg bg-color h-full ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out`}>
                <div className="w-full h-full p-5 flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Image src="/images/logo.png" alt="logo" width={32} height={32} />
                            <h1 className="text-white text-2xl font-bold">Viventis</h1>
                        </div>
                        <div>
                            {/* Toggle Sidebar */}
                            <Button isIconOnly variant="faded" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                <MenuIcon />
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="solid" className="gap-2">
                            <PlusIcon />
                            <h1>New Chat</h1>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default LeftSideBar; 