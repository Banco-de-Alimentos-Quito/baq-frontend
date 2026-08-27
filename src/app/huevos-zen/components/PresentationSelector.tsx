"use client";

import React from "react";
import { EggPresentation } from "../types/huevo-zen";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface PresentationSelectorProps {
  selected: EggPresentation;
  onChange: (presentation: EggPresentation) => void;
}

export function PresentationSelector({
  selected,
  onChange,
}: PresentationSelectorProps) {
  const options = [
    {
      value: 30 as EggPresentation,
      title: "Presentación de 30 unidades",
    },
    {
      value: 12 as EggPresentation,
      title: "Presentación de 12 unidades",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-800">
          1. Selecciona la Presentación
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <motion.button
              key={opt.value}
              type="button"
              whileTap={{ scale: 0.99 }}
              onClick={() => onChange(opt.value)}
              className="relative p-4 rounded-xl border border-gray-200 bg-white text-left transition-colors duration-150 cursor-pointer flex items-center justify-between shadow-sm hover:border-gray-300"
            >
              <div className="text-base font-bold text-gray-900">
                {opt.title}
              </div>
              {isSelected ? (
                <CheckCircle2 className="w-5 h-5 text-[#ED6F1D] fill-orange-100 shrink-0 ml-2" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0 ml-2" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
