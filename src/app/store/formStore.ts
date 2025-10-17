import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getOrCreateUserId } from "../utils/utils";

interface FormState {
  // Datos comunes del formulario
  userId: string;
  identificacion: string;
  direccion: string;
  ciudad: string;
  tipoIdentificacion: string;
  email: string;
  phone: string;
  monto: string;
  gestorDonacion: string;

  // Estado de procesamiento
  paymentProcessed: boolean;

  // Historial de transacciones
  processedTransactions: Record<
    string,
    {
      timestamp: string;
      amount: number;
    }
  >;

  // Acciones
  setFormField: (field: string, value: string) => void;
  setPaymentProcessed: (value: boolean) => void;
  setEmail: (email: string) => void;
  addProcessedTransaction: (
    id: string,
    clientTransactionId: string,
    amount: number
  ) => void;
  isTransactionProcessed: (id: string, clientTransactionId: string) => boolean;
  clearFormData: () => void;
  initUser: () => void;
}

export const useFormStore = create<FormState>()(
  // Usar middleware persist para mantener datos entre recargas
  persist(
    (set, get) => ({
      userId: "",
      identificacion: "",
      direccion: "",
      ciudad: "",
      tipoIdentificacion: "cedula",
      email: "",
      phone: "",
      monto: "",
      gestorDonacion: "DonaYa",
      paymentProcessed: false,
      processedTransactions: {},

      // Inicializar userId al cargar
      initUser: () => {
        const userId = getOrCreateUserId();
        set({ userId });
      },


      setEmail: (email: string) => set({ email }),

      // Acciones
      setFormField: (field, value) =>
        set((state) => ({ ...state, [field]: value })),

      setPaymentProcessed: (value) => set({ paymentProcessed: value }),

      addProcessedTransaction: (id, clientTransactionId, amount) =>
        set((state) => {
          const transactionKey = `${id}-${clientTransactionId}`;
          return {
            processedTransactions: {
              ...state.processedTransactions,
              [transactionKey]: {
                timestamp: new Date().toISOString(),
                amount,
              },
            },
          };
        }),

      isTransactionProcessed: (id, clientTransactionId) => {
        const transactionKey = `${id}-${clientTransactionId}`;
        return !!get().processedTransactions[transactionKey];
      },

      clearFormData: () =>
        set({
          identificacion: "",
          direccion: "",
          ciudad: "",
          email: "",
          phone: "",
          gestorDonacion: "BAQ",
        }),
    }),
    {
      name: "baq-form-storage", // nombre único para el almacenamiento
      storage: createJSONStorage(() => sessionStorage), // opcional: persistir en sessionStorage
    }
  )
);
