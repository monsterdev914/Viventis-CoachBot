'use client'
import { useCallback, useContext, useState } from "react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const { t } = useTranslation();
  return (
    <HeroUINavbar 
      maxWidth="xl" 
      className="p-2 backdrop-blur-[10px] bg-color/95 border-b border-b-color bg-color" 
      classNames={{ 
        menu: "bg-[#FFFFFF] bg-opacity-95 backdrop-blur-[10px] border-t border-t-color shadow-lg" 
      }} 
      position="sticky"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
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
        <div className="mx-4 mt-4 flex flex-col gap-1 py-2">
          {user && (
            <NavbarMenuItem>
              <div className="flex items-center gap-3 py-4 px-2 mb-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Avatar
                  size="md"
                  name={user.email?.charAt(0).toUpperCase() || "U"}
                  showFallback
                  className="bg-primary text-white"
                />
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Signed in as</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{user.email}</span>
                </div>
              </div>
            </NavbarMenuItem>
          )}

          {/* Main Navigation Items */}
          <div className="space-y-2 mb-4">
            <NavbarMenuItem>
              <Link
                className="text-gray-900 dark:text-gray-100 font-medium flex items-center gap-3 py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors w-full"
                href="/#"
                onClick={() => {
                  handleMenuClose();
                  const element = document.getElementById("home");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                size="lg"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {t("Home")}
              </Link>
            </NavbarMenuItem>

            {user && (
              <NavbarMenuItem>
                <Link
                  className="text-gray-900 dark:text-gray-100 font-medium flex items-center gap-3 py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors w-full"
                  href="/chat"
                  onClick={handleMenuClose}
                  size="lg"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {t("Chat")}
                </Link>
              </NavbarMenuItem>
            )}

            <NavbarMenuItem>
              <Link
                className="text-gray-900 dark:text-gray-100 font-medium flex items-center gap-3 py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors w-full"
                href="/#how-to-work"
                onClick={() => {
                  handleMenuClose();
                  const element = document.getElementById("how-to-work");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                size="lg"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {t("How to work")}
              </Link>
            </NavbarMenuItem>

            <NavbarMenuItem>
              <Link
                className="text-gray-900 dark:text-gray-100 font-medium flex items-center gap-3 py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors w-full"
                href="/#pricing"
                onClick={handleMenuClose}
                size="lg"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                {t("Pricing")}
              </Link>
            </NavbarMenuItem>

            <NavbarMenuItem>
              <Link
                className="text-gray-900 dark:text-gray-100 font-medium flex items-center gap-3 py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors w-full"
                href="/#contact"
                onClick={() => {
                  handleMenuClose();
                  const element = document.getElementById("contact");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                size="lg"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t("Contact")}
              </Link>
            </NavbarMenuItem>
          </div>

          {/* Language Selector for Mobile */}
          <NavbarMenuItem>
            <div className="py-2 px-2 mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                {t("Language")}
              </label>
              <Select 
                aria-label="lang" 
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

          {/* User Actions */}
          {user && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
              <NavbarMenuItem>
                <Link
                  className="text-gray-900 dark:text-gray-100 font-medium flex items-center gap-3 py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSettings();
                    handleMenuClose();
                  }}
                  href="javascript:void(0)"
                  size="lg"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t("Settings")}
                </Link>
              </NavbarMenuItem>

              <NavbarMenuItem>
                <Link
                  className="text-red-600 dark:text-red-400 font-medium flex items-center gap-3 py-3 px-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                    handleMenuClose();
                  }}
                  href="javascript:void(0)"
                  size="lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t("Logout")}
                </Link>
              </NavbarMenuItem>
            </div>
          )}

          {/* Login Button for Non-Authenticated Users */}
          {!user && (
            <NavbarMenuItem>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <Link
                  className="text-white bg-primary hover:bg-primary-600 font-medium flex items-center justify-center gap-3 py-3 px-4 rounded-lg transition-colors w-full"
                  href="/auth/login"
                  onClick={handleMenuClose}
                  size="lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  {t("Login")}
                </Link>
              </div>
            </NavbarMenuItem>
          )}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
