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

  const handleDownload = () => {
    // Crear un enlace temporal para descargar el PDF
    const link = document.createElement('a');
    link.href = '/Politicas_Privacidad_BAQ.pdf'; // Ruta al PDF en public
    link.download = 'Politicas_Privacidad_BAQ.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <div className="mb-8 flex justify-center">
        <button
          onClick={handleDownload}
          disabled={!md}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          Descargar Políticas (PDF)
        </button>
      </div>
      
      <article className="prose max-w-none">
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
    </div>
  );
}
