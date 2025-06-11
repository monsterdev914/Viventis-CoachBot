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
import { Button, Select, SelectItem } from "@heroui/react";
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
  const { setLanguage } = useContext(TranslateContext);
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
  const { t } = useTranslation();
  return (
    <HeroUINavbar maxWidth="xl" className="p-2 backdrop-blur-[10px] bg-color/95 border-b border-b-color bg-color" classNames={{ menu: "bg-[#FFFFFF] bg-opacity-15 backdrop-blur-[10px] border-t border-t-color" }} position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">{t("Viventis")}</p>
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
          <>
            <NavbarItem>
              <NextLink href="/chat">
                <Button variant="solid" color="primary">{t("Chat")}</Button>
              </NextLink>
            </NavbarItem>
            <NavbarItem>
              <Button variant="bordered" color="primary" onClick={handleLogout}>{t("Logout")}</Button>
            </NavbarItem>
          </>
          : <NavbarItem>
            <NextLink href="/auth/login">
              <Button variant="bordered" color="primary">{t("Login")}</Button>
            </NextLink>
          </NavbarItem>}
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
        <div className="mx-4 mt-2 flex flex-col gap-2 py-2">
          <NavbarMenuItem>
            <Link
              color={
                "primary"
              }
              href="/"
              size="lg"
            >
              {t("Home")}
            </Link>
          </NavbarMenuItem>
          {
            user && <NavbarMenuItem>
              <Link
                color={
                  "primary"
                }
                href="/chat"
                size="lg"
              >
                {t("Chat")}
              </Link>
            </NavbarMenuItem>
          }
          {
            !user ? <NavbarMenuItem>
              <Link
                color={
                  "primary"
                }
                href="/auth/login"
                size="lg"
              >
                {t("Login")}
              </Link>
            </NavbarMenuItem> :
              <NavbarMenuItem>
                <Link
                  color={
                    "primary"
                  }
                  onClick={handleLogout}
                  href="javascript:void(0)"
                  size="lg"
                >
                  {t("Logout")}
                </Link>
              </NavbarMenuItem>
          }
          <NavbarMenuItem>
            <Link
              color={
                "primary"
              }
              href="/"
              size="lg"
            >
              {t("Pricing")}
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              color={
                "primary"
              }
              href="/"
              size="lg"
            >
              {t("Blog")}
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              color={
                "primary"
              }
              href="/"
              size="lg"
            >
              {t("About")}
            </Link>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
