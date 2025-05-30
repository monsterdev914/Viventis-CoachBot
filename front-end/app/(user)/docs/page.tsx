import Link from "next/link";

export default function Docs() {
  return (
    <main className="flex min-h-screen flex-col items-center py-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="mb-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Viventis CoachBot Dokumentation</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Erfahren Sie alles über die Funktionsweise und Nutzung des Viventis CoachBots für Ihre persönliche Entwicklung.
            </p>
          </div>
        </section>

        {/* Getting Started Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8">Erste Schritte</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">Einführung</h3>
              <p className="text-gray-600 mb-4">
                Viventis CoachBot ist Ihr KI-gestützter Begleiter für persönliche Entwicklung und Führungskompetenz.
              </p>
              <Link href="/docs/introduction" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold group-hover:translate-x-1 transition-transform">
                Mehr erfahren →
              </Link>
            </div>
            <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-green-600">Konto einrichten</h3>
              <p className="text-gray-600 mb-4">
                Erfahren Sie, wie Sie Ihr Konto einrichten und mit dem CoachBot beginnen können.
              </p>
              <Link href="/docs/setup" className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold group-hover:translate-x-1 transition-transform">
                Mehr erfahren →
              </Link>
            </div>
          </div>
        </section>

        {/* Inner Compass System */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8">Der Innere Kompass</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">Methodik</h3>
              <p className="text-gray-600">
                Die bewährte Viventis-Methodik für persönliche Entwicklung und Führungskompetenz.
              </p>
            </div>
            <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-purple-600">Tools</h3>
              <p className="text-gray-600">
                Praktische Werkzeuge für die Umsetzung des Inneren Kompass in Ihrem Alltag.
              </p>
            </div>
            <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-green-600">Integration</h3>
              <p className="text-gray-600">
                Wie der CoachBot die Innerer Kompass Methodik in die digitale Welt überträgt.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8">Funktionen</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">Persönliches Coaching</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">💬</span>
                  Individuelle Gespräche
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🎯</span>
                  Zielsetzung und Tracking
                </li>
                <li className="flex items-center">
                  <span className="mr-2">📊</span>
                  Fortschrittsanalyse
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🌱</span>
                  Persönliche Entwicklung
                </li>
              </ul>
            </div>
            <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-purple-600">Führungskompetenz</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">👥</span>
                  Authentische Führung
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🚀</span>
                  Team-Entwicklung
                </li>
                <li className="flex items-center">
                  <span className="mr-2">📈</span>
                  Strategische Planung
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🤝</span>
                  Konfliktmanagement
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Technical Guide */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Technischer Leitfaden</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">Sicherheit</h3>
              <p className="text-gray-600">
                Erfahren Sie mehr über unsere Sicherheitsmaßnahmen und Datenschutzrichtlinien.
              </p>
            </div>
            <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-purple-600">API-Dokumentation</h3>
              <p className="text-gray-600">
                Technische Details zur Integration des CoachBots in Ihre Systeme.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
} 