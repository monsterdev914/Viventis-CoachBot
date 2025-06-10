"use client"
import Image from "next/image";
import { Button } from "@heroui/react";
import { FloatingLanguageSwitcher } from "@/components/FloatingLanguageSwitcher";
import ContactUs from "@/components/contacUS";

export default function Home() {
    return (
        <div className="flex flex-col items-center py-20">
            <FloatingLanguageSwitcher />
            <ContactUs />
        </div>
    );
}
