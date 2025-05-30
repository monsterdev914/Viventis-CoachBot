import Image from "next/image";
import Link from "next/link";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center">
            {/* Hero Section */}
            <section className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex items-center gap-2 mb-8">
                            <Image alt="Viventis Logo" className="rounded-lg shadow-lg" height={54} src="/images/logo.png" width={54} />
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Viventis CoachBot</h1>
                        </div>
                        <h2 className="text-3xl font-semibold mb-6 max-w-3xl">
                            Dein wahres Ich wartet auf dich – Bist du bereit für den ersten Schritt?
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                            &ldquo;Weisst du, was passiert, wenn du aufhörst, anderen zu folgen, und anfängst, deinem eigenen Weg zu vertrauen?&rdquo;
                        </p>
                        <Link
                            href="/chat"
                            className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-white shadow-lg transition-all hover:shadow-xl"
                        >
                            <span className="relative z-10 text-lg font-semibold">Jetzt starten</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 transition-opacity group-hover:opacity-100"></div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="w-full py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Deine Mehrwerte auf einem Blick</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
                            <h3 className="text-xl font-semibold mb-4 text-blue-600">Klarheit</h3>
                            <p className="text-gray-600">Mit dem Inneren Kompass triffst du bewusste und sichere Entscheidungen, die zu dir und deinen Werten passen.</p>
                        </div>
                        <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
                            <h3 className="text-xl font-semibold mb-4 text-green-600">Effektivität</h3>
                            <p className="text-gray-600">Erreiche deine persönlichen Ziele mit innerer Stärke und einem klaren Fokus auf das Wesentliche.</p>
                        </div>
                        <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
                            <h3 className="text-xl font-semibold mb-4 text-purple-600">Selbstführung</h3>
                            <p className="text-gray-600">Der Kompass ist dein Werkzeug, um deine Fähigkeiten zu stärken und authentisch deinen eigenen Weg zu gehen.</p>
                        </div>
                        <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
                            <h3 className="text-xl font-semibold mb-4 text-orange-600">Balance & Energie</h3>
                            <p className="text-gray-600">Finde die richtige Balance, um Veränderungen mit Leichtigkeit zu meistern und neue Energie in deinen Alltag zu bringen.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div className="group">
                            <h3 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">400+</h3>
                            <p className="text-gray-600">Zufriedene Kunden</p>
                        </div>
                        <div className="group">
                            <h3 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">100%</h3>
                            <p className="text-gray-600">Weiterempfehlung</p>
                        </div>
                        <div className="group">
                            <h3 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">1000+</h3>
                            <p className="text-gray-600">Beratungen pro Jahr</p>
                        </div>
                        <div className="group">
                            <h3 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">30+</h3>
                            <p className="text-gray-600">Jahre Erfahrung</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">Bereit zu wachsen?</h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Der Schritt zu einem selbstbestimmten und erfüllten Leben beginnt hier!
                    </p>
                    <Link
                        href="/chat"
                        className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-white shadow-lg transition-all hover:shadow-xl"
                    >
                        <span className="relative z-10 text-lg font-semibold">Kostenloses Erstgespräch vereinbaren</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 transition-opacity group-hover:opacity-100"></div>
                    </Link>
                </div>
            </section>
        </main>
    );
}
