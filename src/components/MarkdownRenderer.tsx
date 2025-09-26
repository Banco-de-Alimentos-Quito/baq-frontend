'use client';

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import Image from "next/image";
import Link from "next/link";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-orange max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} // Soporte para tablas, listas de tareas, etc.
        rehypePlugins={[rehypeRaw, rehypeSanitize]} // Permite HTML pero lo sanitiza
        components={{
          // Personaliza la renderización de imágenes
          img: ({ node, ...props }) => {
            const { src, alt } = props;
            if (!src || typeof src !== 'string') return null;
            
            // Para imágenes externas, usar img regular
            const isExternalImage = src.startsWith("http");
            
            if (isExternalImage) {
              return (
                <img 
                  src={src} 
                  alt={alt || ''} 
                  className="rounded-lg object-cover my-6 w-full max-w-3xl mx-auto"
                  style={{ maxHeight: '450px' }}
                  onError={(e) => {
                    console.error('Error loading image:', src);
                    // Imagen de fallback simple
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0NTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI0MDAiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+';
                    target.alt = 'Imagen no disponible';
                  }}
                />
              );
            }
            
            // Para imágenes internas, usar Next.js Image
            return (
              <Image 
                src={src} 
                alt={alt || ''} 
                width={800} 
                height={450} 
                className="rounded-lg object-cover my-6"
              />
            );
          },
          // Personaliza los enlaces
          a: ({ node, ...props }) => (
            <Link
              href={props.href || "#"}
              className="text-orange-600 hover:text-orange-800"
            >
              {props.children}
            </Link>
          ),
          // Personaliza las tablas
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full divide-y divide-gray-300 border-collapse">
                {props.children}
              </table>
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-orange-50">{props.children}</thead>
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
              {props.children}
            </th>
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-3 text-sm text-gray-500">
              {props.children}
            </td>
          ),
          // Personaliza los bloques de código
          code: ({ node, className, children, ...props }) => {
            const isInline = !className || !className.startsWith('language-');
            return isInline ? (
              <code className="px-1 py-0.5 bg-gray-100 rounded text-orange-700 text-sm">
                {children}
              </code>
            ) : (
              <pre className="p-4 bg-gray-800 text-white rounded-lg overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          // Asegurar que los párrafos no intenten renderizar elementos no válidos
          p: ({ node, children, ...props }) => {
            // Verificar si hay hijos que sean objetos y no texto simple
            const hasComplexChildren = React.Children.toArray(children).some(
              child => typeof child === 'object'
            );
            
            return (
              <p {...props} className="my-4">
                {children}
              </p>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
