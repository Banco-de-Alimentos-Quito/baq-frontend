import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import LoadingWrapper from "@/components/ui/LoadingWrapper";
import { useEffect } from "react";
import { useFormStore } from "./store/formStore";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

function StoreInitializer() {
  useEffect(() => {
    // Inicializa el userId al cargar la aplicación
    useFormStore.getState().initUser();
  }, []);

  return null;
}

export const metadata: Metadata = {
  title: "Banco de Alimentos de Quito",
  description:
    "Con tu ayuda, llevamos alimento a quienes más lo necesitan en Quito. Dona alimentos o dinero y sé parte del cambio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <Script
          src="https://code.jquery.com/jquery-3.4.1.min.js"
          strategy="beforeInteractive"
        />
        {/* Usar la versión de sandbox o producción según corresponda */}
        <Script
          src="https://sandbox-paybox.pagoplux.com/paybox/index_angular.js"
          strategy="beforeInteractive"
        />
        {/* Para producción, descomenta esta línea y comenta la anterior
        <Script
          src="https://paybox.pagoplux.com/paybox/index_angular.js"
          strategy="beforeInteractive"
        />
        */}
      </head>

      <body
        suppressHydrationWarning
        className={`${inter.variable} font-sans antialiased`}
      >
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XJNTP3SK76"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XJNTP3SK76');
            `}
        </Script>

        <StoreInitializer />
        <LoadingWrapper>
          <Header />
          <main>{children}</main>
          <Footer />
          <Toaster />
        </LoadingWrapper>
      </body>
    </html>
  );
}
