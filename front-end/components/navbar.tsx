'use client'
import { useCallback, useContext } from "react";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { Button, Select, SelectItem, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar, User } from "@heroui/react";
import NextLink from "next/link";
import clsx from "clsx";
import { siteConfig } from "@/config/site";
import {
  Logo,
} from "@/components/icons";
import { TranslateContext } from "@/app/TranslateProvider";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/app/api";



export const Navbar = () => {
  const { user, setUser, setLoading } = useAuth();
  const { setLanguage, lang } = useContext(TranslateContext);
  const handleLogout = useCallback(() => {
    setLoading(true);
    signOut().then((res) => {
      if (res.status === 200) {
        localStorage.removeItem("token");
        setUser(null);
      }
      setLoading(false);
    })
  }, []);

  const handleSettings = useCallback(() => {
    window.location.href = '/settings';
  }, []);
  const { t } = useTranslation();
  return (
    <HeroUINavbar maxWidth="xl" className="p-2 backdrop-blur-[10px] bg-color/95 border-b border-b-color bg-color" classNames={{ menu: "bg-[#FFFFFF] bg-opacity-15 backdrop-blur-[10px] border-t border-t-color" }} position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="#">
            <Logo />
            <p className="font-bold text-inherit">{t("Viventis Bot")}</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  "c-primary",
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
              >
                {t(item.label)}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        {user ?
          <NavbarItem>
            <NextLink href="/chat">
              <Button variant="solid" color="primary">{t("Chat")}</Button>
            </NextLink>
          </NavbarItem>
          : <NavbarItem>
            <NextLink href="/auth/login">
              <Button variant="bordered" color="primary">{t("Login")}</Button>
            </NextLink>
          </NavbarItem>}
        <NavbarItem className="max-md:hidden">
          <Select aria-label="lang" classNames={{ value: "whitespace-normal overflow-visible text-clip", selectorIcon: "hidden" }} defaultSelectedKeys={[lang]} placeholder="Select" onChange={(e) => {
            setLanguage(e.target.value)
          }}>
            <SelectItem key="en"  textValue="English" className="text-[black]">English</SelectItem>
            <SelectItem key="de"  textValue="German" className="text-[black]">German</SelectItem>
          </Select>
        </NavbarItem>
        {user && (
          <NavbarItem className="hidden sm:flex">
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  size="sm"
                  name={user.email?.charAt(0).toUpperCase() || "U"}
                  showFallback
                />
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="User menu actions" 
                variant="flat"
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <DropdownItem 
                  key="profile" 
                  className="h-14 gap-2 cursor-default"
                  textValue="Profile info"
                >
                  <div className="flex flex-col">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Signed in as</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{user.email}</p>
                  </div>
                </DropdownItem>
                <DropdownItem 
                  key="settings" 
                  onClick={handleSettings}
                  className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  startContent={
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.5 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                >
                  {t("Settings")}
                </DropdownItem>
                <DropdownItem 
                  key="logout" 
                  color="danger" 
                  onClick={handleLogout}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                  startContent={
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  }
                >
                  {t("Logout")}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2 py-2">
          {user && (
            <NavbarMenuItem>
              <div className="flex items-center gap-3 py-2 border-b border-gray-200">
                <Avatar
                  size="sm"
                  name={user.email?.charAt(0).toUpperCase() || "U"}
                  showFallback
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-black">Signed in as</span>
                  <span className="text-xs text-gray-600">{user.email}</span>
                </div>
              </div>
            </NavbarMenuItem>
          )}
          <NavbarMenuItem>
            <Link
              className="text-black"
              href="/#"
              onClick={() => {
                const element = document.getElementById("home");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              size="lg"
            >
              {t("Home")}
            </Link>
          </NavbarMenuItem>
          {
            user && <NavbarMenuItem>
              <Link
                className="text-black"
                href="/chat"
                size="lg"
              >
                {t("Chat")}
              </Link>
            </NavbarMenuItem>
          }
          {
            user && <NavbarMenuItem>
              <Link
                className="text-black flex items-center gap-2"
                onClick={handleSettings}
                href="javascript:void(0)"
                size="lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t("Settings")}
              </Link>
            </NavbarMenuItem>
          }
          {
            !user ? <NavbarMenuItem>
              <Link
                className="text-black"
                href="/auth/login"
                size="lg"
              >
                {t("Login")}
              </Link>
            </NavbarMenuItem> :
              <NavbarMenuItem>
                <Link
                  className="text-black flex items-center gap-2"
                  onClick={handleLogout}
                  href="javascript:void(0)"
                  size="lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t("Logout")}
                </Link>
              </NavbarMenuItem>
          }
          <NavbarMenuItem>
            <Link
              className="text-black"
              href="/#how-to-work"
              onClick={() => {
                const element = document.getElementById("how-to-work");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              size="lg"
            >
              {t("How to work")}
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              className="text-black"
              href="/#pricing"
              size="lg"
            >
              {t("Pricing")}
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              className="text-black"
              href="/#contact"
              onClick={() => {
                const element = document.getElementById("contact");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              size="lg"
            >
              {t("Contact")}
            </Link>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
