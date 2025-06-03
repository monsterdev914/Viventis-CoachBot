import Image from "next/image";
import Link from "next/link";

export default function Dashboard() {
    return (
        <main className="flex min-h-screen flex-col items-center py-20">
            <div className="container mx-auto px-4">
                {/* Hero Section */}
                <section className="mb-20">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">Ihr Coaching Dashboard</h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Willkommen zurück! Hier finden Sie alle wichtigen Informationen und Tools für Ihre persönliche Entwicklung.
                        </p>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold mb-8">Schnellzugriff</h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        <Link href="/chat" className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg transition-all hover:shadow-xl">
                            <div className="relative z-10">
                                <h3 className="text-xl font-semibold mb-4">Neue Session</h3>
                                <p className="text-blue-100">Starten Sie eine neue Coaching-Session</p>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 opacity-0 transition-opacity group-hover:opacity-100"></div>
                        </Link>
                        <Link href="/progress" className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg transition-all hover:shadow-xl">
                            <div className="relative z-10">
                                <h3 className="text-xl font-semibold mb-4">Fortschritt</h3>
                                <p className="text-green-100">Verfolgen Sie Ihre Entwicklung</p>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-700 opacity-0 transition-opacity group-hover:opacity-100"></div>
                        </Link>
                        <Link href="/resources" className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg transition-all hover:shadow-xl">
                            <div className="relative z-10">
                                <h3 className="text-xl font-semibold mb-4">Ressourcen</h3>
                                <p className="text-purple-100">Zugriff auf Tools und Materialien</p>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-700 opacity-0 transition-opacity group-hover:opacity-100"></div>
                        </Link>
                        <Link href="/schedule" className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg transition-all hover:shadow-xl">
                            <div className="relative z-10">
                                <h3 className="text-xl font-semibold mb-4">Termine</h3>
                                <p className="text-orange-100">Live-Sessions planen</p>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-orange-700 opacity-0 transition-opacity group-hover:opacity-100"></div>
                        </Link>
                    </div>
                </section>

                {/* Progress Overview */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold mb-8">Ihr Fortschritt</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg">
                            <h3 className="text-xl font-semibold mb-4">Aktuelle Ziele</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center justify-between">
                                    <span className="text-gray-600">Authentische Führung</span>
                                    <span className="text-green-600 font-semibold">75%</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-gray-600">Work-Life-Balance</span>
                                    <span className="text-yellow-600 font-semibold">60%</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-gray-600">Team-Entwicklung</span>
                                    <span className="text-blue-600 font-semibold">45%</span>
                                </li>
                            </ul>
                        </div>
                        <div className="rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg">
                            <h3 className="text-xl font-semibold mb-4">Letzte Erkenntnisse</h3>
                            <ul className="space-y-4">
                                <li className="text-gray-600 italic">
                                    &ldquo;Authentische Führung beginnt mit Selbstreflexion&rdquo;
                                </li>
                                <li className="text-gray-600 italic">
                                    &ldquo;Balance zwischen Effektivität und Menschlichkeit&rdquo;
                                </li>
                                <li className="text-gray-600 italic">
                                    &ldquo;Stärken-basierte Teamführung&rdquo;
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Resources */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold mb-8">Ressourcen</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-semibold mb-4">Innerer Kompass</h3>
                            <ul className="text-gray-600 space-y-2">
                                <li className="flex items-center">
                                    <span className="mr-2">📚</span>
                                    Methodik-Guide
                                </li>
                                <li className="flex items-center">
                                    <span className="mr-2">🎯</span>
                                    Praxisübungen
                                </li>
                                <li className="flex items-center">
                                    <span className="mr-2">💭</span>
                                    Reflexionsfragen
                                </li>
                            </ul>
                        </div>
                        <div className="rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-semibold mb-4">Führungskompetenz</h3>
                            <ul className="text-gray-600 space-y-2">
                                <li className="flex items-center">
                                    <span className="mr-2">⚡</span>
                                    Leadership-Tools
                                </li>
                                <li className="flex items-center">
                                    <span className="mr-2">👥</span>
                                    Team-Building
                                </li>
                                <li className="flex items-center">
                                    <span className="mr-2">📈</span>
                                    Strategie-Entwicklung
                                </li>
                            </ul>
                        </div>
                        <div className="rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-semibold mb-4">Persönliches Wachstum</h3>
                            <ul className="text-gray-600 space-y-2">
                                <li className="flex items-center">
                                    <span className="mr-2">🎯</span>
                                    Selbstführung
                                </li>
                                <li className="flex items-center">
                                    <span className="mr-2">🧘</span>
                                    Stressmanagement
                                </li>
                                <li className="flex items-center">
                                    <span className="mr-2">⚖️</span>
                                    Work-Life-Balance
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Next Steps */}
                <section>
                    <h2 className="text-3xl font-bold mb-8">Nächste Schritte</h2>
                    <div className="rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg">
                        <h3 className="text-xl font-semibold mb-4">Empfohlene Aktionen</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center justify-between group">
                                <span className="text-gray-600">Tägliche Reflexion</span>
                                <Link href="/reflection" className="text-blue-600 hover:text-blue-700 font-semibold group-hover:translate-x-1 transition-transform">
                                    Jetzt starten →
                                </Link>
                            </li>
                            <li className="flex items-center justify-between group">
                                <span className="text-gray-600">Wöchentliches Ziel-Review</span>
                                <Link href="/goals" className="text-blue-600 hover:text-blue-700 font-semibold group-hover:translate-x-1 transition-transform">
                                    Jetzt starten →
                                </Link>
                            </li>
                            <li className="flex items-center justify-between group">
                                <span className="text-gray-600">Live-Coaching Session</span>
                                <Link href="/schedule" className="text-blue-600 hover:text-blue-700 font-semibold group-hover:translate-x-1 transition-transform">
                                    Termin vereinbaren →
                                </Link>
                            </li>
                        </ul>
                    </div>
                </section>
            </div>
        </main>
    );
} 