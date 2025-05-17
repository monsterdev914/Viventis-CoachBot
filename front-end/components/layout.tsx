'use client';

import { Link } from "@heroui/link";
import { Navbar } from "./navbar";
import { useTranslation } from 'react-i18next';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    return (
        <section className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow ">
                {children}
            </main>
            <footer className="w-full flex items-center bg-color justify-center py-3">
                <Link
                    isExternal
                    className="flex items-center gap-1 text-current"
                    href="#"
                    title="Viventis.com homepage"
                >
                    <span className="text-default-600">{t("Powered by")}</span>
                    <p className="text-primary">{t("Viventis")} &copy; {new Date().getFullYear()}</p>
                </Link>
            </footer>
        </section>
    )
}

export default Layout;
