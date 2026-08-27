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
      <div className="container mx-auto px-4 py-12">
        {/* Header con imagen de portada */}
        <div className="mb-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-lg mb-8">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Título */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {/* Metadatos */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              {post.author.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">{post.author.name}</p>
                <p className="text-sm text-gray-500">{post.author.bio}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
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
        <article className="bg-white rounded-xl shadow-lg p-6 md:p-10">
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
