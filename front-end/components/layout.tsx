'use client';

import { Link } from "@heroui/link";
import { Navbar } from "./navbar";
import { useTranslation } from 'react-i18next';
import { Alert, Button, Spinner } from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";
import { FacebookIcon, InstagramIcon, LinkedInIcon, LoudSpeakerIcon, XIcon } from "./icons";
import Image from "next/image";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { loading } = useAuth();
    const { t } = useTranslation();

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <Spinner size="lg" color="primary" />
        </div>;
    }

    return (
        <section className="relative flex flex-col bg-color">
            <Navbar />
            <main className=" flex-grow">
                {children}
            </main>
            <footer className="w-full container mx-auto max-w-7xl flex flex-col bg-color justify-end items-center min-h-screen py-12">
                <div className="flex flex-col items-center gap-12">
                    <div className="flex flex-col items-center gap-6">
                        <Alert color="default" variant="flat" icon={<LoudSpeakerIcon size={16} />} radius="full" className="w-fit bg-[#FFFFFF1A] border-[#FFFFFF1C] border-1 p-2">
                            <h6 className="text-sm text-white font-bold">
                                Bereit zu wachsen?
                            </h6>
                        </Alert>
                        <h1 className="text-[40px] font-bold text-center text-white">Der Schritt zu einem selbstbestimmten und erfüllten Leben beginnt hier!</h1>
                        <div className="text-[15px] text-white text-center max-w-[800px]">
                            Bist Du bereit, den nächsten Schritt zu gehen? Finde heraus, wie der Innere Kompass Dir hilft, Deine Ziele zu erreichen – und wie Du dabei auch persönlich wachsen kannst.
                        </div>
                        <Button color="primary" variant="solid" radius="full" className="w-fit text-[18px] py-6 px-8"><span className="font-bold">Kostenloses Erstgespräch vereinbaren</span></Button>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 w-full justify-between">
                        <div className="flex flex-col justify-between gap-4 flex-[2] items-center">
                            <div className=" flex flex-row">
                                <div className=" flex flex-col gap-4 flex-1">
                                    <div><Image src="/images/logo.png" alt="logo" width={270} height={16} /></div>
                                    <div className="w-full flex flex-col gap-4">
                                        <p className="text-[14px] text-white">
                                            Dein Wegweiser zu Klarheit und Erfolg immer dabei.
                                        </p>
                                    </div>
                                </div>
                                <div className=" flex flex-col gap-4 flex-1"></div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-8 flex-1 px-4 hidden md:block">
                            <h2 className="text-[18px] font-bold text-white">Nützliche Links</h2>
                            <ul className="flex flex-col gap-4">
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            Home
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            Das Konzept
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            Das Experte Adrian Müller
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            Kontakt
                                        </span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-8 flex-1 px-4 hidden md:block">
                            <h2 className="text-[18px] font-bold text-white">Kontakt</h2>
                            <ul className="flex flex-col gap-4">
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            Impressum
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            Datenschutz
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            FAQs
                                        </span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-8 flex-1 px-4 hidden md:block">
                            <h2 className="text-[18px] font-bold text-white">Kontakt</h2>
                            <ul className="flex flex-col gap-4">
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            heading-section-subtitle  style-color
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            Mo - Fr: | 9 - 17 Uhr
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            E-Mail
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            info@der-innere-kompass.com
                                        </span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 w-full justify-between items-center border-t border-white/10 py-6">
                        <div className="flex flex-row gap-4">
                            <div>
                                <span className="text-[12px] text-white">
                                    &copy; 2025 Adrian Müller. Alle Rechte vorbehalten.
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-row gap-4">
                            <div>
                                <span className="text-[12px] text-white">
                                    <Link href="/">
                                        <Button color="default" variant="flat" isIconOnly radius="full" className="text-[12px] text-white">
                                            <FacebookIcon size={16} />
                                        </Button>
                                    </Link>
                                </span>
                            </div>
                            <div>
                                <span className="text-[12px] text-white">
                                    <Link href="/">
                                        <Button color="default" variant="flat" isIconOnly radius="full" className="text-[12px] text-white">
                                            <InstagramIcon size={16} />
                                        </Button>
                                    </Link>
                                </span>
                            </div>
                            <div>
                                <span className="text-[12px] text-white">
                                    <Link href="/">
                                        <Button color="default" variant="flat" isIconOnly radius="full" className="text-[12px] text-white">
                                            <LinkedInIcon size={16} />
                                        </Button>
                                    </Link>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </section>
    )
}

export default Layout;
