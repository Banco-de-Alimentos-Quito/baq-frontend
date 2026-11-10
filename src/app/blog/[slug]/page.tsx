import { getPostBySlug } from "@/lib/blog";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import HuevosZenLandingPage from "@/components/mdx/HuevosZenLandingPage";
import Image from "next/image";
import { notFound } from "next/navigation";

// Posts with custom landing page experiences
const CUSTOM_PAGES: Record<string, React.ComponentType> = {
  "huevos-zen": HuevosZenLandingPage,
};

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  // Check if this slug has a custom landing page
  const CustomPage = CUSTOM_PAGES[slug];
  if (CustomPage) {
    return <CustomPage />;
  }

  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header con imagen de portada */}
        <div className="mb-8">
          <div className="relative h-64 sm:h-80 md:h-96 lg:h-[420px] w-full max-w-3xl mx-auto overflow-hidden rounded-2xl shadow-md mb-8 bg-white border border-gray-100 flex items-center justify-center">
            {/* Fondo sutil para rellenar bordes en imágenes verticales */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={post.coverImage}
                alt=""
                fill
                className="object-cover blur-2xl opacity-15 scale-125"
                aria-hidden="true"
                priority
              />
            </div>
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-contain relative z-10 p-2 sm:p-4"
              priority
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 bg-orange-100 text-orange-800 text-xs sm:text-sm font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Título */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Metadatos */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              {post.author.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">{post.author.name}</p>
                <p className="text-xs sm:text-sm text-gray-500">{post.author.bio}</p>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              <p>
                Publicado el{" "}
                {new Date(post.publishedAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p>⏱️ {post.readTime} minutos de lectura</p>
            </div>
          </div>
        </div>

        {/* Contenido del post con renderizado Markdown */}
        <article className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <MarkdownRenderer content={post.content} />
        </article>
      </div>
    </div>
  );
}

// Genera rutas estáticas para cada post
export async function generateStaticParams() {
  const { getAllSlugs } = await import("@/lib/blog");
  const slugs = getAllSlugs();

  // Also add custom page slugs
  const customSlugs = Object.keys(CUSTOM_PAGES);

  return [...new Set([...slugs, ...customSlugs])].map((slug) => ({
    slug,
  }));
}
