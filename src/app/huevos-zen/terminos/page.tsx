'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { Download, ShieldCheck } from 'lucide-react';

export default function TerminosHuevosZenPage() {
  const [md, setMd] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/terminos-huevos-zen.md')
      .then((r) => r.text())
      .then((text) => {
        setMd(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error cargando los términos de Huevos Zen:', err);
        setLoading(false);
      });
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/Contrato_Membresia_Huevos_ZEN_BAQ.pdf';
    link.download = 'Contrato_Membresia_Huevos_ZEN_BAQ.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Tarjeta de Contenido */}
        <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-gray-200/70">
          {/* Encabezado informativo */}
          <div className="mb-8 flex items-center gap-3 bg-orange-50/80 border border-orange-200/60 rounded-2xl p-4 text-orange-950">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#ED6F1D] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                Documento de Adhesión y Términos de Servicio
              </h1>
              <p className="text-xs text-gray-600">
                Banco de Alimentos Quito · Programa Huevo Zen · Vigencia 2026
              </p>
            </div>
          </div>

          {/* Contenido Markdown */}
          <article className="prose prose-orange max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-[#ED6F1D] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500 font-medium">Cargando términos y condiciones...</p>
              </div>
            ) : md ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]}
              >
                {md}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-500">No se pudieron cargar los términos.</p>
            )}
          </article>

          {/* Botón de Descarga Centrado Abajo */}
          <div className="mt-12 pt-8 border-t border-gray-200/70 flex flex-col items-center justify-center text-center">
            <p className="text-xs sm:text-sm text-gray-500 mb-4 font-medium max-w-md">
              Puedes descargar una copia oficial de este contrato en formato PDF para tu respaldo o revisión:
            </p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#ED6F1D] hover:bg-orange-600 text-white text-sm sm:text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-98"
            >
              <Download className="w-5 h-5" />
              <span>Descargar Contrato Oficial (PDF)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          Banco de Alimentos Quito (BAQ) · Todos los derechos reservados · www.baq.ec
        </div>
      </div>
    </div>
  );
}
