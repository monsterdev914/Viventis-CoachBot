"use client"
import Image from "next/image";
import { Button } from "@heroui/react";
import { FloatingLanguageSwitcher } from "@/components/FloatingLanguageSwitcher";
import ContactUs from "@/components/contacUS";
import HowToWork from "@/components/HowToWork";
import ProcessWork from "@/components/ProcessWork";
import PricingPreview from "@/components/PricingPreview";

export default function Home() {
    return (
        <div className="flex flex-col items-center w-full">
            <div className="relative w-full max-w-7xl mx-auto px-4 text-white py-20 overflow-hidden" style={{}}>
                {/* Background image with opacity */}
                <div
                    className="absolute inset-0 z-1"
                    style={{
                        backgroundImage: "url(/images/bg-img.png)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: 0.1, // Set your desired opacity here
                        pointerEvents: "none", // So it doesn't block clicks
                    }}
                />
                {/* Content */}
                <div className="relative z-10">
                    <div className="flex flex-col gap-4 w-full items-center justify-center">
                        <div className="text-[16px] bg-[#3bcc9130] border border-[#3bcc91] px-4 py-2 text-center items-center justify-center rounded-full w-fit">Viventis Online Coaching</div>
                        <div className="flex flex-col gap-2">
                            <h1 className="md:text-[48px] text-[32px] font-bold">Viventis CoachBot</h1>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-[100px] w-full">
                        <div className="flex flex-col gap-4 w-full">
                            <h2 className="md:text-[32px] text-[24px] font-bold">
                                Dein innerer Nordstern - Immer erreichbar
                            </h2>
                            <p className="text-[18px] text-white">
                            Der Viventis CoachBot hilft dir, Entscheidungen zu klären und deinen Weg zu finden. Ohne Warten. Ohne Termin. Ohne Umwege.
                            </p>
                            <p className="text-[18px] text-white">
                                Fühlst du dich oft zerrissen zwischen Erwartungen, To-do-Listen und der Frage: Was ist jetzt wirklich wichtig?
                            </p>
                            <p className="text-[18px] text-white">
                                Der Viventis CoachBot bringt dich zurück zu dir. Er hilft dir, Entscheidungen zu klären, innere Ruhe zu finden und Schritt für Schritt deinen Weg zu gehen – bewusst, fokussiert und frei.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 w-full text-center items-center">
                            <h2 className="md:text-[32px] text-[24px] font-bold">
                                Klarheit beginnt genau hier.
                            </h2>
                            <p className="text-[18px] text-white">
                                Kein Termin – Keine App – Kein Coach nötig.
                                Nur du, dein Weg – und ein Bot, der wirklich versteht.
                            </p>
                            <p className="text-[18px] text-white">
                                <span><Image src="https://s.w.org/images/core/emoji/15.1.0/svg/1f449.svg" alt="Star" width={20} height={20} className="inline-block"/></span> Starte jetzt kostenlos<br />
                                Du erhältst 7 Tage vollen Zugriff – ohne Verpflichtung.
                            </p>
                            <p className="text-[18px] text-white">
                                The Viventis CoachBot is your digital reflection partner - inspired by the &quot;Inner Compass&quot; system, developed from over 20 years of coaching experience. It thinks along with you, asks questions, and gets you to the point.
                            </p>
                            <Button 
                                variant="solid" 
                                color="primary" 
                                className="w-fit rounded-full text-[18px] text-black font-bold py-8 px-8"
                                onClick={() => window.location.href = '/pricing'}
                            >
                                Starte jetzt kostenlos
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <FloatingLanguageSwitcher />
            <HowToWork />
            <PricingPreview />
            <ProcessWork />
            <ContactUs />
        </div>
    );
}
