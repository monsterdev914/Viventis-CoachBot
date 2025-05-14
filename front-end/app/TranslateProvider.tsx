"use client"
import { useEffect, useState, createContext } from "react";
import "@/i18n"
import { useTranslation } from "react-i18next";
interface TranSlateProviderPropsType {
    children: React.ReactNode
}


interface TranslateContextType {
    setLanguage: (lang: string) => void
}
export const TranslateContext = createContext<TranslateContextType>({
    setLanguage: () => { }
});
const TranSlateProvider: React.FC<TranSlateProviderPropsType> = (props) => {
    const { i18n } = useTranslation();
    const [ready, setReady] = useState(false);
    const [lang, setLang] = useState("en");

    useEffect(() => {
        i18n.changeLanguage(lang).then(() => setReady(true));
    }, [i18n, lang]);

    if (!ready) return null;

    return (
        <TranslateContext.Provider value={{ setLanguage: setLang }}>
            {props.children}
        </TranslateContext.Provider>
    )
}

export default TranSlateProvider