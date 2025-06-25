"use client";
import React, { useContext, useState, useRef, useCallback, useEffect } from "react";
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
  const [position, setPosition] = useState({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 72 : 300, // Start from right side (window width - button width - margin)
    y: typeof window !== 'undefined' ? window.innerHeight - 72 : 300  // Start from bottom (window height - button height - margin)
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (lang: string) => {
    setCurrentLang(lang);
    setLanguage(lang);
    setIsOpen(false);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isOpen) return; // Don't drag when popover is open
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  }, [position, isOpen]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Keep within viewport bounds
    const maxX = window.innerWidth - 56; // 56px is button width
    const maxY = window.innerHeight - 56; // 56px is button height

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isOpen) return;
    
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
    e.preventDefault();
  }, [position, isOpen]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;

    const maxX = window.innerWidth - 56;
    const maxY = window.innerHeight - 56;

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
    e.preventDefault();
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div 
      ref={containerRef}
      className="fixed z-50 lg:hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
      role="button"
      tabIndex={0}
      aria-label="Drag to move language switcher"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen(!isOpen);
        }
      }}
    >
      <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <Button
            isIconOnly
            className="rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105"
            aria-label="Change language"
            style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
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