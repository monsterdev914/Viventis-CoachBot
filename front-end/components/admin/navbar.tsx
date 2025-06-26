"use client"
import { useAdminAuth } from "@/contexts/AdminAuthContext"
import { Navbar as HeroUINavbar, NavbarContent, NavbarBrand, NavbarMenu, NavbarMenuItem, NavbarMenuToggle, NavbarItem } from "@heroui/navbar"
import { Logo } from "../icons"
import NextLink from "next/link"
import { useTranslation } from 'react-i18next';
import { Select, Avatar } from "@heroui/react"
import { Button } from "@heroui/button"
import { SelectItem } from "@heroui/react"
import { useContext, useState, useCallback } from "react"
import { TranslateContext } from "@/app/TranslateProvider"
import clsx from "clsx"
import { signOut } from "@/app/api"
import { useRouter } from "next/navigation"

const Navbar: React.FC = () => {
    const { t } = useTranslation()
    const { user } = useAdminAuth()
    const { setLanguage, lang } = useContext(TranslateContext)
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = useCallback(() => {
        signOut()
        router.push("/admin/login")
    }, [router]);

    const handleMenuClose = useCallback(() => {
        setIsMenuOpen(false);
    }, []);

    return (
        <HeroUINavbar 
            maxWidth="xl" 
            className="p-2 bg-color border-b border-b-color w-full backdrop-blur-[10px]" 
            classNames={{ 
                menu: "bg-[#FFFFFF] bg-opacity-95 backdrop-blur-[10px] border-t border-t-color shadow-lg" 
            }} 
            position="sticky"
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
        >
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand as="li" className="gap-3 max-w-fit">
                    <NextLink className="flex justify-start items-center gap-1" href="/admin">
                        <Logo />
                        <p className="font-bold text-inherit">{t("admin.navbar.viventisBot")}</p>
                    </NextLink>
                </NavbarBrand>
                {user && (
                    <ul className="hidden lg:flex gap-4 justify-start ml-2">
                        <NavbarItem>
                            <NextLink
                                className={clsx(
                                    "c-primary",
                                    "data-[active=true]:text-primary data-[active=true]:font-medium",
                                )}
                                color="foreground"
                                href="/admin/bot-setting"
                            >
                                {t("admin.navbar.settings")}
                            </NextLink>
                        </NavbarItem>
                        <NavbarItem>
                            <NextLink
                                className={clsx(
                                    "c-primary",
                                    "data-[active=true]:text-primary data-[active=true]:font-medium",
                                )}
                                color="foreground"
                                href="/admin/knowledge-base"
                            >
                                {t("admin.navbar.knowledgeBase")}
                            </NextLink>
                        </NavbarItem>
                        <NavbarItem>
                            <NextLink
                                className={clsx(
                                    "c-primary",
                                    "data-[active=true]:text-primary data-[active=true]:font-medium",
                                )}
                                color="foreground"
                                href="/admin/user-management"
                            >
                                {t("admin.navbar.userManagement")}
                            </NextLink>
                        </NavbarItem>
                    </ul>
                )}
            </NavbarContent>
            
            <NavbarContent
                className="hidden sm:flex basis-1/5 sm:basis-full"
                justify="end"
            >
                {user ? 
                    <Button variant="bordered" color="primary" onClick={handleLogout}>
                        {t("admin.navbar.logout")}
                    </Button> : 
                    <Button variant="bordered" color="primary" as={NextLink} href="/admin/login">
                        {t("admin.navbar.login")}
                    </Button>
                }
                <NavbarItem className="max-md:hidden">
                    <Select 
                        aria-label={t("admin.navbar.language")} 
                        classNames={{ 
                            value: "whitespace-normal overflow-visible text-clip", 
                            selectorIcon: "hidden" 
                        }} 
                        defaultSelectedKeys={[lang]} 
                        placeholder="Select" 
                        onChange={(e) => {
                            setLanguage(e.target.value)
                        }}
                    >
                        <SelectItem key="en" textValue="English" className="text-[black]">English</SelectItem>
                        <SelectItem key="de" textValue="German" className="text-[black]">German</SelectItem>
                    </Select>
                </NavbarItem>
            </NavbarContent>

            <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
                <NavbarMenuToggle />
            </NavbarContent>

            <NavbarMenu>
                <div className="mx-4 mt-4 flex flex-col gap-1 py-2">
                    {user && (
                        <NavbarMenuItem>
                            <div className="flex items-center gap-3 py-4 px-2 mb-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <Avatar
                                    size="md"
                                    name="A"
                                    showFallback
                                    className="bg-primary text-white"
                                />
                                <div className="flex flex-col flex-1">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Admin Panel</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Signed in as Admin</span>
                                </div>
                            </div>
                        </NavbarMenuItem>
                    )}

                    {/* Main Navigation Items */}
                    <div className="space-y-2 mb-4">
                        <NavbarMenuItem>
                            <NextLink 
                                href="/admin"
                                onClick={handleMenuClose}
                                className="text-gray-900 dark:text-gray-100 font-medium flex items-center gap-3 py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors w-full"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                {t("admin.navbar.dashboard")}
                            </NextLink>
                        </NavbarMenuItem>

                        {user && (
                            <NavbarMenuItem>
                                <NextLink 
                                    href="/admin/bot-setting"
                                    onClick={handleMenuClose}
                                    className="text-gray-900 dark:text-gray-100 font-medium flex items-center gap-3 py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors w-full"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {t("admin.navbar.settings")}
                                </NextLink>
                            </NavbarMenuItem>
                        )}

                        {user && (
                            <NavbarMenuItem>
                                <NextLink 
                                    href="/admin/knowledge-base"
                                    onClick={handleMenuClose}
                                    className="text-gray-900 dark:text-gray-100 font-medium flex items-center gap-3 py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors w-full"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    {t("admin.navbar.knowledgeBase")}
                                </NextLink>
                            </NavbarMenuItem>
                        )}

                        {user && (
                            <NavbarMenuItem>
                                <NextLink 
                                    href="/admin/user-management"
                                    onClick={handleMenuClose}
                                    className="text-gray-900 dark:text-gray-100 font-medium flex items-center gap-3 py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors w-full"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                    {t("admin.navbar.userManagement")}
                                </NextLink>
                            </NavbarMenuItem>
                        )}
                    </div>

                    {/* Language Selector for Mobile */}
                    <NavbarMenuItem>
                        <div className="py-2 px-2 mb-4">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                {t("admin.navbar.language")}
                            </label>
                            <Select 
                                aria-label={t("admin.navbar.language")} 
                                classNames={{ 
                                    value: "text-gray-900 dark:text-gray-100",
                                    trigger: "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
                                    popoverContent: "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                                }} 
                                defaultSelectedKeys={[lang]} 
                                placeholder="Select Language" 
                                onChange={(e) => {
                                    setLanguage(e.target.value)
                                }}
                                size="sm"
                            >
                                <SelectItem key="en" textValue="English" className="text-gray-900 dark:text-gray-100">
                                    🇺🇸 English
                                </SelectItem>
                                <SelectItem key="de" textValue="German" className="text-gray-900 dark:text-gray-100">
                                    🇩🇪 German
                                </SelectItem>
                            </Select>
                        </div>
                    </NavbarMenuItem>

                    {/* Admin Actions */}
                    {user ? (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <NavbarMenuItem>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        handleMenuClose();
                                    }}
                                    className="text-red-600 dark:text-red-400 font-medium flex items-center gap-3 py-3 px-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors w-full text-left"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    {t("admin.navbar.logout")}
                                </button>
                            </NavbarMenuItem>
                        </div>
                    ) : (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <NavbarMenuItem>
                                <NextLink 
                                    href="/admin/login"
                                    onClick={handleMenuClose}
                                    className="text-white bg-primary hover:bg-primary-600 font-medium flex items-center justify-center gap-3 py-3 px-4 rounded-lg transition-colors w-full"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    {t("admin.navbar.login")}
                                </NextLink>
                            </NavbarMenuItem>
                        </div>
                    )}
                </div>
            </NavbarMenu>
        </HeroUINavbar>
    )
}

export default Navbar;