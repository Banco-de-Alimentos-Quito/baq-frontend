"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  CreditCard,
  Building,
  Banknote,
  ShieldCheck,
} from "lucide-react";

import { DebitoBancarioSection } from "./components/DebitoBancarioSection";
import { NuveiRecurrenteSection } from "./components/NuveiRecurrenteSection";
import { TransferenciaSection } from "./components/TransferenciaSection";
import { EfectivoSection } from "./components/EfectivoSection";

type DonationTab = "debito" | "nuvei" | "transferencia" | "efectivo";

const TABS: {
  id: DonationTab;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge?: string;
  color: string;
}[] = [
  {
    id: "debito",
    title: "1. Débito Bancario",
    subtitle: "Cuenta Corriente o Ahorros",
    icon: Building2,
    badge: "Recurrente",
    color: "#FF6B35",
  },
  {
    id: "nuvei",
    title: "2. Tarjeta Nuvei",
    subtitle: "Suscripción Recurrente",
    icon: CreditCard,
    badge: "Automático",
    color: "#C800A1",
  },
  {
    id: "transferencia",
    title: "3. Transferencia",
    subtitle: "Subida de Comprobante",
    icon: Building,
    badge: "Bco. Pichincha",
    color: "#059669",
  },
  {
    id: "efectivo",
    title: "4. Efectivo",
    subtitle: "Registro en efectivo",
    icon: Banknote,
    badge: "Presencial",
    color: "#D97706",
  },
];

function QuickDonate4Content() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = (searchParams.get("tab") as DonationTab) || "debito";
  const [activeTab, setActiveTab] = useState<DonationTab>(initialTab);

  // Sync tab with URL search params without full page reload
  const handleTabChange = (tabId: DonationTab) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const initialMonto = parseFloat(searchParams.get("monto") || "10");

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-orange-200/25 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-pink-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-emerald-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">

        {/* Top Segmented Navigation Bar (Barrita Superior para desplazarse entre las 4 secciones) */}
        <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all duration-200 flex flex-col justify-between overflow-hidden group ${
                    isActive
                      ? "bg-gray-900 text-white shadow-lg shadow-gray-900/15"
                      : "bg-gray-50/70 hover:bg-gray-100 text-gray-700 border border-gray-100"
                  }`}
                >
                  {/* Active highlight pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBadge"
                      className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}

                  <div className="flex items-center justify-between w-full mb-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        isActive
                          ? "bg-white/15 text-white"
                          : "bg-white text-gray-700 shadow-xs border border-gray-200"
                      }`}
                      style={{ color: isActive ? "#ffffff" : tab.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {tab.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-gray-200/80 text-gray-700"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3
                      className={`font-black text-sm tracking-tight truncate ${
                        isActive ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {tab.title}
                    </h3>
                    <p
                      className={`text-[11px] truncate mt-0.5 font-medium ${
                        isActive ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {tab.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display Area */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white shadow-xl relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "debito" && (
                <DebitoBancarioSection initialMonto={initialMonto} />
              )}
              {activeTab === "nuvei" && (
                <NuveiRecurrenteSection initialMonto={initialMonto} />
              )}
              {activeTab === "transferencia" && <TransferenciaSection />}
              {activeTab === "efectivo" && <EfectivoSection />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Guarantee */}
        <div className="text-center py-4 text-xs text-gray-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>
            Banco de Alimentos Quito — Transparencia, Seguridad y Solidaridad en cada Donación.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function QuickDonate4Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      }
    >
      <QuickDonate4Content />
    </Suspense>
  );
}
