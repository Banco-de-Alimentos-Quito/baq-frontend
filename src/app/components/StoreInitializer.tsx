"use client";
import { useEffect } from "react";
import { useFormStore } from "../store/formStore";

export default function StoreInitializer() {
  useEffect(() => {
    // Solo inicializa si está vacío
    if (!useFormStore.getState().userId) {
      useFormStore.getState().initUser();
    }
  }, []);
  return null;
}