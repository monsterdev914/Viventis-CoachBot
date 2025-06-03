import Image from "next/image";
import Link from "next/link";

export default function Blog() {
  return (
    <main className="flex flex-col items-center min-h-screen py-20">
      <div className="mx-auto px-4">
        {/* Hero Section */}
        <section className="mb-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Viventis CoachBot Blog</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Entdecken Sie die neuesten Erkenntnisse und Best Practices für persönliche Entwicklung und Führungskompetenz.
            </p>
          </div>
        </section>

        {/* Featured Articles */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8">Ausgewählte Artikel</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <article className="group rounded-lg bg-gradient-to-br from-white to-gray-50 shadow-lg overflow-hidden transition-all hover:shadow-xl">
              <div className="relative overflow-hidden">
                <Image
                  src="/images/blog/ai-coaching.jpg"
                  alt="AI Coaching"
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-blue-600">Wie KI das persönliche Coaching transformiert</h3>
                <p className="text-gray-600 mb-4">
                  Entdecken Sie, wie künstliche Intelligenz das Coaching-Erlebnis revolutioniert und personalisierte Unterstützung ermöglicht.
                </p>
                <Link href="/blog/ai-coaching" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold group-hover:translate-x-1 transition-transform">
                  Weiterlesen →
                </Link>
              </div>
            </article>
            <article className="group rounded-lg bg-gradient-to-br from-white to-gray-50 shadow-lg overflow-hidden transition-all hover:shadow-xl">
              <div className="relative overflow-hidden">
                <Image
                  src="/images/blog/inner-compass.jpg"
                  alt="Inner Compass"
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-purple-600">Der Innere Kompass: Ein Leitfaden für authentische Führung</h3>
                <p className="text-gray-600 mb-4">
                  Erfahren Sie, wie der Innere Kompass Ihnen hilft, authentisch zu führen und Ihre Ziele zu erreichen.
                </p>
                <Link href="/blog/inner-compass" className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold group-hover:translate-x-1 transition-transform">
                  Weiterlesen →
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-blue-600">Kategorien</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">Führungskompetenz</h3>
              <ul className="text-gray-600 space-y-2">
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
              </ul>
            </div>
            <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-green-600">Persönliches Wachstum</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">🎯</span>
                  Selbstführung
                </li>
                <li className="flex items-center">
                  <span className="mr-2">⚖️</span>
                  Work-Life-Balance
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🌱</span>
                  Persönliche Entwicklung
                </li>
              </ul>
            </div>
            <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-purple-600">Erfolgsgeschichten</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">📝</span>
                  Kundenberichte
                </li>
                <li className="flex items-center">
                  <span className="mr-2">📊</span>
                  Fallstudien
                </li>
                <li className="flex items-center">
                  <span className="mr-2">💡</span>
                  Best Practices
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Latest Posts */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Neueste Artikel</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <article className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">KI-gestütztes Coaching: Die Zukunft der persönlichen Entwicklung</h3>
              <p className="text-gray-600 mb-4">
                Wie künstliche Intelligenz das Coaching-Erlebnis revolutioniert und personalisierte Unterstützung ermöglicht.
              </p>
              <Link href="/blog/ai-coaching-future" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold group-hover:translate-x-1 transition-transform">
                Weiterlesen →
              </Link>
            </article>
            <article className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-green-600">Balance finden: Work-Life-Integration im digitalen Zeitalter</h3>
              <p className="text-gray-600 mb-4">
                Praktische Tipps für eine gesunde Work-Life-Balance in der modernen Arbeitswelt.
              </p>
              <Link href="/blog/work-life-balance" className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold group-hover:translate-x-1 transition-transform">
                Weiterlesen →
              </Link>
            </article>
            <article className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-purple-600">Erfolgreiche Teams führen: Der Innere Kompass in der Praxis</h3>
              <p className="text-gray-600 mb-4">
                Wie Sie mit dem Inneren Kompass Ihre Teamführung auf ein neues Level heben.
              </p>
              <Link href="/blog/team-leadership" className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold group-hover:translate-x-1 transition-transform">
                Weiterlesen →
              </Link>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
} 