import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Lexend_Deca } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import LoadingWrapper from "@/components/ui/LoadingWrapper";
import StoreInitializer from "./components/StoreInitializer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const lexend = Lexend_Deca({
  subsets: ["latin"],
  variable: "--font-lexend",
});

// Usando Playfair Display como alternativa elegante similar a Queens
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-queens",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Banco de Alimentos Quito",
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <Script
          src="https://code.jquery.com/jquery-3.4.1.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://sandbox-paybox.pagoplux.com/paybox/index_angular.js"
          strategy="beforeInteractive"
        />
      </head>

      <body
        suppressHydrationWarning
        className={`${inter.variable} ${lexend.variable} ${playfair.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
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
          <main className="flex-1 w-full">{children}</main>
          <Footer />
          <Toaster />
        </LoadingWrapper>
      </body>
    </html>
  );
}
