import { createContext, useContext, useState } from "react"

type ThemeContextType = {
    bgColor: string
    setBgColor: (bgColor: string) => void
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [bgColor, setBgColor] = useState<string>("#164038")
    return <ThemeContext.Provider value={{ bgColor, setBgColor }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
}
