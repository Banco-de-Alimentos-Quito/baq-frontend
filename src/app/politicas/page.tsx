'use client';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export default function PoliticaPage() {
  const [md, setMd] = useState<string>('');
  useEffect(() => {
    fetch('/politica.md')
      .then(r => r.text())
      .then(setMd)
      .catch(console.error);
  }, []);
  return (
    <article className="prose max-w-3xl mx-auto py-16 px-4">
      {md ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]}
        >
          {md}
        </ReactMarkdown>
      ) : (
        <p>Cargando…</p>
      )}
    </article>
  );
}
