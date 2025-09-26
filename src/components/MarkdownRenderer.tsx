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
    <div className="max-w-4xl mx-auto px-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // Títulos principales estilizados modernos y amigables
          h1: ({ node, ...props }) => (
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-8 mt-12 font-sans">
              {props.children}
            </h1>
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6 mt-12 border-l-4 border-orange-500 pl-6 bg-orange-50 py-4 rounded-r-lg font-sans">
              {props.children}
            </h2>
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight mb-5 mt-10 font-sans">
              {props.children}
            </h3>
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xl md:text-2xl font-semibold text-orange-600 leading-tight mb-4 mt-8 font-sans">
              {props.children}
            </h4>
          ),
          h5: ({ node, ...props }) => (
            <h5 className="text-lg md:text-xl font-semibold text-gray-700 leading-tight mb-3 mt-6 font-sans">
              {props.children}
            </h5>
          ),
          h6: ({ node, ...props }) => (
            <h6 className="text-base md:text-lg font-semibold text-gray-700 leading-tight mb-3 mt-6 font-sans">
              {props.children}
            </h6>
          ),
          // Párrafos con tipografía moderna y amigable
          p: ({ node, children, ...props }) => (
            <p className="text-xl leading-relaxed text-gray-700 mb-6 font-normal font-sans">
              {children}
            </p>
          ),
          // Listas mejoradas
          ul: ({ node, ...props }) => (
            <ul className="space-y-3 mb-6 ml-6">
              {props.children}
            </ul>
          ),
          ol: ({ node, ...props }) => (
            <ol className="space-y-3 mb-6 ml-6 list-decimal">
              {props.children}
            </ol>
          ),
          li: ({ node, ...props }) => (
            <li className="text-xl text-gray-700 leading-relaxed flex items-start font-sans">
              <span className="text-orange-500 mr-3 mt-1">•</span>
              <span>{props.children}</span>
            </li>
          ),
          // Citas destacadas con estilo moderno
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-orange-500 bg-orange-50 p-6 my-8 rounded-r-lg">
              <div className="text-xl font-medium text-gray-800 leading-relaxed font-sans">
                {props.children}
              </div>
            </blockquote>
          ),
          // Imágenes mejoradas
          img: ({ node, ...props }) => {
            const { src, alt } = props;
            if (!src || typeof src !== 'string') return null;
            
            const isExternalImage = src.startsWith("http");
            
            if (isExternalImage) {
              return (
                <div className="my-10 text-center">
                  <img 
                    src={src} 
                    alt={alt || ''} 
                    className="rounded-xl shadow-lg object-cover w-full max-w-4xl mx-auto"
                    style={{ maxHeight: '500px' }}
                    onError={(e) => {
                      console.error('Error loading image:', src);
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0NTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI0MDAiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+';
                    }}
                  />
                  {alt && (
                    <p className="text-sm text-gray-500 mt-3 italic">{alt}</p>
                  )}
                </div>
              );
            }
            
            return (
              <div className="my-10 text-center">
                <Image 
                  src={src} 
                  alt={alt || ''} 
                  width={800} 
                  height={500} 
                  className="rounded-xl shadow-lg object-cover mx-auto"
                />
                {alt && (
                  <p className="text-sm text-gray-500 mt-3 italic">{alt}</p>
                )}
              </div>
            );
          },
          // Enlaces destacados
          a: ({ node, ...props }) => (
            <Link
              href={props.href || "#"}
              className="text-orange-600 hover:text-orange-800 font-medium underline decoration-2 underline-offset-2 transition-colors duration-200"
            >
              {props.children}
            </Link>
          ),
          // Tablas profesionales
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-8 shadow-lg rounded-lg">
              <table className="min-w-full bg-white">
                {props.children}
              </table>
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gradient-to-r from-orange-500 to-orange-600">
              {props.children}
            </thead>
          ),
          th: ({ node, ...props }) => (
            <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider font-sans">
              {props.children}
            </th>
          ),
          td: ({ node, ...props }) => (
            <td className="px-6 py-4 text-base text-gray-700 border-b border-gray-200 font-sans">
              {props.children}
            </td>
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-gray-200">
              {props.children}
            </tbody>
          ),
          // Código mejorado
          code: ({ node, className, children, ...props }) => {
            const isInline = !className || !className.startsWith('language-');
            return isInline ? (
              <code className="px-2 py-1 bg-orange-100 text-orange-800 rounded font-mono text-sm">
                {children}
              </code>
            ) : (
              <pre className="p-6 bg-gray-900 text-white rounded-xl overflow-x-auto my-6 shadow-lg">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          // Elementos strong/bold destacados con estilo moderno
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-gray-900 font-sans">
              {props.children}
            </strong>
          ),
          // Elementos em/italic con estilo amigable
          em: ({ node, ...props }) => (
            <em className="font-medium text-orange-600 font-sans">
              {props.children}
            </em>
          ),
          // Divisores
          hr: ({ node, ...props }) => (
            <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
