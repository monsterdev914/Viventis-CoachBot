export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "CoachBot",
  description: "Welcome to CoachBot, your personal assistant for all your needs.",
  navItems: [
    {
      label: "Home",
      href: "/#",
    },
    {
      label: "Pricing",
      href: "/#pricing",
    },
    {
      label: "How to work",
      href: "/#how-to-work",
    },
    {
      label: "Contact",
      href: "/#contact",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/#",
    },
    {
      label: "Chat",
      href: "/chat",
    },
    {
      label: "Logout",
      href: "/logout",
    },
    {
      label: "Login",
      href: "/login",
    },
    {
      label: "Pricing",
      href: "/#pricing",
    },
    {
      label: "How to work",
      href: "/#how-to-work",
    },
    {
      label: "Contact",
      href: "/#contact",
    },
  ],
};
