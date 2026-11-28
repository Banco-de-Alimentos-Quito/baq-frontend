import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import LoadingWrapper from "@/components/ui/LoadingWrapper";
import StoreInitializer from "./components/StoreInitializer";
import DonationRouteTracker from "@/components/analytics/DonationRouteTracker";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Banco de Alimentos Quito",
  description:
    "Con tu ayuda, llevamos alimento a quienes más lo necesitan en Quito. Dona alimentos o dinero y sé parte del cambio.",
};

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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
        className={`${montserrat.variable} font-sans antialiased min-h-screen flex flex-col overflow-x-hidden w-full max-w-full`}
      >
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}');
            `}
        </Script>


        <StoreInitializer />
        <DonationRouteTracker />

        <LoadingWrapper>
          <Header />
          <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
          <Footer />
          <Toaster />
        </LoadingWrapper>
      </body>
    </html>
  );
}
