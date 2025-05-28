"use client"
import type { ThemeProviderProps } from "next-themes";
import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import TranSlateProvider from "./TranslateProvider";
import { ToastProvider } from "@heroui/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  return (
    <HeroUIProvider navigate={router.push}>
      <ToastProvider />
      <NextThemesProvider {...themeProps}>
        <ThemeProvider>
          <TranSlateProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </TranSlateProvider>
        </ThemeProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}

export default Providers;
