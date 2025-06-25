"use client"
import { useAdminAuth } from "@/contexts/AdminAuthContext"
import { Navbar as HeroUINavbar, NavbarContent, NavbarBrand, NavbarMenu, NavbarMenuItem, NavbarMenuToggle, NavbarItem } from "@heroui/navbar"
import { Logo } from "../icons"
import NextLink from "next/link"
import { useTranslation } from 'react-i18next';
import { Select } from "@heroui/react"
import { Button } from "@heroui/button"
import { SelectItem } from "@heroui/react"
import { useContext } from "react"
import { TranslateContext } from "@/app/TranslateProvider"
import clsx from "clsx"
import { signOut } from "@/app/api"
import { useRouter } from "next/navigation"
const Navbar: React.FC = () => {
    const { t } = useTranslation()
    const { user } = useAdminAuth()
    const { setLanguage } = useContext(TranslateContext)
    const router = useRouter()
    const handleLogout = () => {
        signOut()
        router.push("/admin/login")
    }
    return (
        <HeroUINavbar maxWidth="xl" className="p-2 bg-color border-b border-b-color w-full" classNames={{ menu: "bg-[#FFFFFF] bg-opacity-15 backdrop-blur-[10px] border-t border-t-color" }} position="sticky">
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand as="li" className="gap-3 max-w-fit">
                    <NextLink className="flex justify-start items-center gap-1" href="/admin">
                        <Logo />
                        <p className="font-bold text-inherit">{t("admin.navbar.viventisBot")}</p>
                    </NextLink>
                </NavbarBrand>
                <NavbarMenu>
                    <NavbarMenuItem>
                        <NextLink href="/admin/login">
                            {t("admin.navbar.login")}
                        </NextLink>
                    </NavbarMenuItem>
                </NavbarMenu>
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
                {user ? <Button variant="bordered" color="primary" onClick={handleLogout}>{t("admin.navbar.logout")}</Button> : <Button variant="bordered" color="primary" as={NextLink} href="/auth/login">{t("admin.navbar.login")}</Button>}
                <NavbarItem className="max-md:hidden">
                    <Select aria-label={t("admin.navbar.language")} classNames={{ value: "whitespace-normal overflow-visible text-clip", selectorIcon: "hidden" }} defaultSelectedKeys={["en"]} placeholder="Select" onChange={(e) => {
                        setLanguage(e.target.value)
                    }}>
                        <SelectItem key="en" textValue="English" className="text-[black]">English</SelectItem>
                        <SelectItem key="de" textValue="German" className="text-[black]">German</SelectItem>
                    </Select>
                </NavbarItem>
            </NavbarContent>
            <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
                <NavbarMenuToggle />
            </NavbarContent>
            <NavbarMenu className="">
                <div className="mx-4 mt-2 flex flex-col gap-2 py-2">
                    {user ? <NavbarMenuItem>
                        <NextLink href="javascript:void(0)" onClick={handleLogout}>
                            {t("admin.navbar.logout")}
                        </NextLink>
                    </NavbarMenuItem> : <NavbarMenuItem>
                        <NextLink href="/admin/login">
                            {t("admin.navbar.login")}
                        </NextLink>
                    </NavbarMenuItem>}
                    {user && (
                        <NavbarMenuItem>
                            <NextLink href="/admin">
                                {t("admin.navbar.dashboard")}
                            </NextLink>
                        </NavbarMenuItem>
                    )}
                    {user && (
                        <NavbarMenuItem>
                            <NextLink href="/admin/bot-setting">
                                {t("admin.navbar.settings")}
                            </NextLink>
                        </NavbarMenuItem>
                    )}
                    {user && (
                        <NavbarMenuItem>
                            <NextLink href="/admin/knowledge-base">
                                {t("admin.navbar.knowledgeBase")}
                            </NextLink>
                        </NavbarMenuItem>
                    )}
                </div>
            </NavbarMenu>
        </HeroUINavbar>
    )
}

export default Navbar;