'use client';

import { Link } from "@heroui/link";
import { Navbar } from "./navbar";
import { useTranslation } from 'react-i18next';
import { Alert, Button, Spinner } from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";
import { FacebookIcon, InstagramIcon, LinkedInIcon, LoudSpeakerIcon, XIcon } from "./icons";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { FloatingLanguageSwitcher } from "./FloatingLanguageSwitcher";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { loading } = useAuth();
    const { t } = useTranslation();
    const pathname = usePathname();

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">
            <Spinner size="lg" color="primary" />
        </div>;
    }

    return (
        <section className="relative flex flex-col bg-color min-h-screen">
            <FloatingLanguageSwitcher />
            <Navbar />
            <main className=" flex-grow flex flex-col flex-1 items-center justify-center w-full">
                {children}
            </main>
            {pathname === '/' && (
                <footer className="w-full container mx-auto max-w-7xl flex flex-col bg-color justify-end items-center py-12">
                <div className="flex flex-col items-center gap-12">
                    <div className="flex flex-col items-center gap-6">
                        <Alert color="default" variant="flat" icon={<LoudSpeakerIcon size={16} />} radius="full" className="w-fit bg-[#FFFFFF1A] border-[#FFFFFF1C] border-1 p-2">
                            <h6 className="text-sm text-white font-bold md:text-[18px] text-[14px]">
                                {t('footer.readyToGrow')}
                            </h6>
                        </Alert>
                        <h1 className="md:text-[40px] text-[32px] font-bold text-center text-white">{t('footer.callToActionTitle')}</h1>
                        <div className="text-[15px] text-white text-center max-w-[800px]">
                            {t('footer.callToActionDesc')}
                        </div>
                        <Button color="primary" variant="solid" radius="full" className="w-fit md:text-[18px] text-[14px] md:py-6 py-4 md:px-8 px-4">
                            <span className="font-bold">{t('footer.scheduleConsultation')}</span>
                        </Button>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 w-full justify-between">
                        <div className="flex flex-col justify-between gap-4 flex-[2] items-center">
                            <div className=" flex flex-row justify-between">
                                <div className=" flex flex-col gap-4 flex-1 items-center md:items-start">
                                    <div><Image src="/images/logo.png" alt="logo" width={270} height={16} /></div>
                                    <div className="w-full flex flex-col gap-4">
                                        <p className="text-[14px] text-white">
                                            {t('footer.yourCompass')}
                                        </p>
                                    </div>
                                </div>
                                <div className=" flex flex-col gap-4 flex-1 md:block hidden"></div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-8 flex-1 px-4 hidden md:block">
                            <h2 className="text-[18px] font-bold text-white">{t('footer.usefulLinks')}</h2>
                            <ul className="flex flex-col gap-4">
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            {t('Home')}
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            {t('footer.theConcept')}
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            {t('footer.expertAdrian')}
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            {t('footer.contact')}
                                        </span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-8 flex-1 px-4 hidden md:block">
                            <h2 className="text-[18px] font-bold text-white">{t('footer.legal')}</h2>
                            <ul className="flex flex-col gap-4">
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            {t('footer.impressum')}
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            {t('footer.privacy')}
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            {t('footer.faqs')}
                                        </span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-8 flex-1 px-4 hidden md:block">
                            <h2 className="text-[18px] font-bold text-white">{t('footer.contact')}</h2>
                            <ul className="flex flex-col gap-4">
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            {t('footer.workingHours')}
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            {t('footer.mondayFriday')}: {t('footer.timeRange')}
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            {t('footer.email')}
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/">
                                        <span className="text-[14px] text-white">
                                            info@viventis.net
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
                                    {t('footer.copyrightText')}
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
            )}
        </section>
    )
}

export default Layout;
