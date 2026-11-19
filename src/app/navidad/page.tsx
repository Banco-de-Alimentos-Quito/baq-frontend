import type { Metadata } from "next";
import ChristmasCampaign from "@/components/sections/ChristmasCampaign";

export const metadata: Metadata = {
  title: "Campaña de Navidad | Banco de Alimentos Quito",
  description:
    "Apoya la campaña navideña del Banco de Alimentos Quito. Cada aporte ayuda a alcanzar nuestra meta de recaudación.",
};

export default function ChristmasCampaignPage() {
  return (
    <div className="min-h-screen pt-16">
      <ChristmasCampaign />
    </div>
  );
}
