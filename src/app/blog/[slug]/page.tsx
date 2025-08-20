import { getPostBySlug, getAllSlugs } from '@/lib/blog';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back to Blog Link */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
          >
            <svg
              className="mr-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver al blog
          </Link>
        </div>

        {/* Article */}
        <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-64 md:h-96 overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Article Header */}
          <div className="p-8">
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

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* Author and Date */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
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
                  <p className="text-lg font-medium text-gray-900">
                    {post.author.name}
                  </p>
                  {post.author.bio && (
                    <p className="text-sm text-gray-600">{post.author.bio}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Publicado el{' '}
                  {new Date(post.publishedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  ⏱️ {post.readTime} min de lectura
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div
                className="markdown-content"
                dangerouslySetInnerHTML={{
                  __html: post.content
                    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
                    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-3 mt-6">$1</h2>')
                    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mb-2 mt-4">$1</h3>')
                    .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-bold mb-2 mt-3">$1</h4>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-orange-500 pl-4 italic text-gray-700 my-4">$1</blockquote>')
                    .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
                    .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
                    .replace(/\n\n/g, '</p><p class="mb-4">')
                    .replace(/^([^<].*)/gim, '<p class="mb-4">$1</p>')
                    .replace(/<p class="mb-4"><\/p>/g, '')
                    .replace(/<p class="mb-4"><h/g, '<h')
                    .replace(/<\/h[1-6]><\/p>/g, '</h$1>')
                    .replace(/<p class="mb-4"><li/g, '<ul class="list-disc ml-6 mb-4"><li')
                    .replace(/<\/li><\/p>/g, '</li></ul>')
                    .replace(/<p class="mb-4"><blockquote/g, '<blockquote')
                    .replace(/<\/blockquote><\/p>/g, '</blockquote>'),
                }}
              />
            </div>
          </div>
        </article>

        {/* Related Posts or Back to Blog */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors duration-200"
          >
            Ver todos los artículos
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
