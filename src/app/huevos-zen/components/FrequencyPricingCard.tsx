"use client";

import React from "react";
import { EggPresentation, DeliveryFrequency } from "../types/huevo-zen";
import { PRICING_MATRIX } from "../constants/pricing";
import { motion } from "framer-motion";
import { CalendarDays, TrendingDown, Check } from "lucide-react";

interface FrequencyPricingCardProps {
  presentation: EggPresentation;
  selectedFrequency: DeliveryFrequency;
  onChange: (frequency: DeliveryFrequency) => void;
}

export function FrequencyPricingCard({
  presentation,
  selectedFrequency,
  onChange,
}: FrequencyPricingCardProps) {
  const frequencies: DeliveryFrequency[] = [1, 2, 4];
  const options = frequencies.map((freq) => PRICING_MATRIX[presentation][freq]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-800">
          2. Frecuencia de Entrega y Descuento
        </label>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <CalendarDays className="w-3.5 h-3.5 text-orange-500" /> Entrega a domicilio programada
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {options.map((opt) => {
          const isSelected = selectedFrequency === opt.entregas_al_mes;
          const isBestValue = opt.entregas_al_mes === 4;

          return (
            <motion.button
              key={opt.entregas_al_mes}
              type="button"
              whileTap={{ scale: 0.99 }}
              onClick={() => onChange(opt.entregas_al_mes)}
              className="relative p-4 rounded-xl border border-gray-200 bg-white text-left transition-colors duration-150 cursor-pointer flex flex-col justify-between shadow-sm hover:border-gray-300"
            >
              {/* Badge de ahorro */}
              {opt.ahorroMensual > 0 && (
                <div className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" />
                  Ahorras ${opt.ahorroMensual.toFixed(2)}/mes
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900 text-base">
                    {opt.frecuenciaNombre}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      isSelected
                        ? "bg-[#ED6F1D] border-[#ED6F1D] text-white"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  {opt.frecuenciaDescripcion}
                </div>

                {/* Desglose precio */}
                <div className="bg-white/80 rounded-lg p-2.5 border border-gray-100 space-y-1 mb-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Precio cubeta:</span>
                    <span className="font-semibold text-gray-800">
                      ${opt.precioPorCubeta.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Huevos totales:</span>
                    <span className="font-semibold text-gray-800">
                      {opt.totalHuevosMes}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total mensual */}
              <div className="pt-2 border-t border-gray-100 mt-1 flex items-baseline justify-between">
                <span className="text-xs text-gray-500 font-medium">Total al mes:</span>
                <span className="text-xl font-extrabold text-[#ED6F1D]">
                  ${opt.totalMensual.toFixed(2)}
                  <span className="text-xs text-gray-500 font-normal ml-0.5">/mes</span>
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
