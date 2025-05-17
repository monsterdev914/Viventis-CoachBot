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
import { Button, Select, SelectItem, user } from "@heroui/react";
import NextLink from "next/link";
import clsx from "clsx";
import { siteConfig } from "@/config/site";
import {
  GithubIcon,
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
    <HeroUINavbar maxWidth="xl" className="p-2 bg-[transparent] border-b border-b-color" position="sticky">
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
        <Link isExternal aria-label="Github" href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link>
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
  );
};
