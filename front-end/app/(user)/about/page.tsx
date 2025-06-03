import Image from "next/image";

export default function About() {
  return (
    <main className="flex min-h-screen flex-col items-center py-20">
      <div className="container mx-auto px-4">
        {/* Mission Section */}
        <section className="mb-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Über Viventis CoachBot</h1>
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-gray-600 mb-8">
                Viventis CoachBot ist ein innovatives KI-gestütztes Coaching-Tool, das die bewährte Innerer Kompass Methodik von Viventis mit modernster Technologie verbindet.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Unser Team</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="group flex flex-col items-center">
              <div className="relative mb-6 overflow-hidden rounded-full shadow-lg transition-transform group-hover:scale-105">
                <Image
                  src="/images/adrian-muller.jpg"
                  alt="Adrian Müller"
                  width={200}
                  height={200}
                  className="rounded-full"
                />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-blue-600">Adrian Müller</h3>
              <p className="text-gray-600 text-center">
                Coach und Mentor für Menschen, die Klarheit und Authentizität suchen. Mit über 30 Jahren Erfahrung in der Begleitung von Menschen in Umbruchsituationen.
              </p>
            </div>
            <div className="group flex flex-col items-center">
              <div className="relative mb-6 overflow-hidden rounded-full shadow-lg transition-transform group-hover:scale-105">
                <Image
                  src="/images/ai-team.jpg"
                  alt="AI Team"
                  width={200}
                  height={200}
                  className="rounded-full"
                />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-purple-600">Unser KI-Team</h3>
              <p className="text-gray-600 text-center">
                Experten für künstliche Intelligenz und maschinelles Lernen, die die Innerer Kompass Methodik in die digitale Welt übertragen.
              </p>
            </div>
          </div>
        </section>

        {/* Approach Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-12">Unser Ansatz</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">Ganzheitlich</h3>
              <p className="text-gray-600">
                Wir verbinden persönliche Entwicklung mit Klarheit im Alltag und helfen dir, deine Werte im Einklang mit deinen Entscheidungen zu bringen.
              </p>
            </div>
            <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-green-600">Authentisch</h3>
              <p className="text-gray-600">
                Mit innerer Klarheit und Empathie kannst du Beziehungen stärken und andere durch dein authentisches Handeln inspirieren.
              </p>
            </div>
            <div className="group rounded-lg bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-purple-600">Proaktiv</h3>
              <p className="text-gray-600">
                Unser System hilft dir, innere Gelassenheit zu entwickeln und Herausforderungen als Chancen zu nutzen.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-12">Kontakt</h2>
          <div className="max-w-2xl mx-auto text-center">
            <div className="rounded-lg bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-blue-600">Adresse</h3>
                  <p className="text-gray-600">
                    Tigelbergstrasse 3<br />
                    9442 Berneck CH
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-green-600">Kontakt</h3>
                  <p className="text-gray-600">
                    Telefon: +41 79 250 10 40<br />
                    E-Mail: info@viventis.net
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-purple-600">Öffnungszeiten</h3>
                  <p className="text-gray-600">
                    Mo - Fr: 9 - 17 Uhr
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
} 