"use client"
import { useAdminAuth } from "@/contexts/AdminAuthContext"
import { Navbar as HeroUINavbar, NavbarContent, NavbarBrand, NavbarMenu, NavbarMenuItem, NavbarMenuToggle, NavbarItem } from "@heroui/navbar"
import { GithubIcon, Logo } from "../icons"
import NextLink from "next/link"
import { Link } from "@heroui/link"
import { siteConfig } from "@/config/site"
import { useTranslation } from 'react-i18next';
import { Select } from "@heroui/react"
import { Button } from "@heroui/button"
import { SelectItem } from "@heroui/react"
import { useContext } from "react"
import { TranslateContext } from "@/app/TranslateProvider"

const Navbar: React.FC = () => {
    const { t } = useTranslation()
    const { user } = useAdminAuth()
    const { setLanguage } = useContext(TranslateContext)
    const handleLogout = () => {
        handleLogout()
    }
    return (
        <HeroUINavbar maxWidth="xl" className="p-2 bg-color border-b border-b-color w-full" position="sticky">
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand as="li" className="gap-3 max-w-fit">
                    <NextLink className="flex justify-start items-center gap-1" href="/">
                        <Logo />
                        <p className="font-bold text-inherit">{t("Viventis")}</p>
                    </NextLink>
                </NavbarBrand>
                <NavbarMenu>
                    <NavbarMenuItem>
                        <NextLink href="/admin/login">
                            Login
                        </NextLink>
                    </NavbarMenuItem>
                </NavbarMenu>
            </NavbarContent>
            <NavbarContent
                className="hidden sm:flex basis-1/5 sm:basis-full"
                justify="end"
            >
                {user ? <Button variant="bordered" color="primary" onClick={handleLogout}>{t("Logout")}</Button> : <Button variant="bordered" color="primary" as={NextLink} href="/auth/login">{t("Login")}</Button>}
                <NavbarItem className="max-md:hidden">
                    <Select aria-label="lang" classNames={{ value: "whitespace-normal overflow-visible text-clip", selectorIcon: "hidden" }} defaultSelectedKeys={["en"]} placeholder="Select" onChange={(e) => {
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
            <NavbarMenu>
                <div className="mx-4 mt-2 flex flex-col gap-2">
                    {siteConfig.navMenuItems.map((item, index) => (
                        <NavbarMenuItem key={`${item}-${index}`}>
                            <Link
                                color={
                                    index === 2
                                        ? "primary"
                                        : index === siteConfig.navMenuItems.length - 1
                                            ? "danger"
                                            : "foreground"
                                }
                                href="#"
                                size="lg"
                            >
                                {t(item.label)}
                            </Link>
                        </NavbarMenuItem>
                    ))}
                </div>
            </NavbarMenu>
        </HeroUINavbar>
    )
}

export default Navbar;