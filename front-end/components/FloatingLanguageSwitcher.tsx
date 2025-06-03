"use client";
import { useContext, useState } from "react";
import { TranslateContext } from "@/app/TranslateProvider";
import { Button, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";

const LanguageIcon = ({ lang }: { lang: string }) => {
  return (
    <div className="w-6 h-6 rounded-full overflow-hidden">
      {lang === 'en' ? (
        <img src="/flags/en.svg" alt="English" className="w-full h-full object-cover" />
      ) : (
        <img src="/flags/de.svg" alt="German" className="w-full h-full object-cover" />
      )}
    </div>
  );
};

export const FloatingLanguageSwitcher = () => {
  const { setLanguage } = useContext(TranslateContext);
  const [currentLang, setCurrentLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang: string) => {
    setCurrentLang(lang);
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 lg:hidden">
      <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <Button
            isIconOnly
            className="rounded-full bg-primary text-white shadow-lg"
            aria-label="Change language"
          >
            <LanguageIcon lang={currentLang} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-2">
          <div className="flex flex-col gap-2">
            <Button
              isIconOnly
              variant="light"
              className="rounded-full"
              onClick={() => handleLanguageChange('en')}
            >
              <LanguageIcon lang="en" />
            </Button>
            <Button
              isIconOnly
              variant="light"
              className="rounded-full"
              onClick={() => handleLanguageChange('de')}
            >
              <LanguageIcon lang="de" />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};