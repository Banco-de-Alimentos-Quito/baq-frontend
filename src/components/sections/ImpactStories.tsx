import Link from "next/link";

export default function ImpactStories() {
  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Historias de Impacto
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre las historias detrás de nuestro trabajo y cómo estamos
            transformando vidas
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200"
          >
            Ver Blog
          </Link>
        </div>
      </div>
    </section>
  );
}
