"use client";
import React, { createContext, useContext, useState } from "react";

interface LoadingContextProps {
  setLoading: (value: boolean) => void;
}

const LoadingContext = createContext<LoadingContextProps | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error("useLoading must be used within LoadingProvider");
  return context;
};

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <LoadingContext.Provider value={{ setLoading: () => {} }}>
      {children}
    </LoadingContext.Provider>
  );
};
