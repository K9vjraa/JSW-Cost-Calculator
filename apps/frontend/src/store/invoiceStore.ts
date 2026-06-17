import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface InvoiceState {
  invoiceNumber: string;
  billingDate: string;
  regenerateInvoiceNumber: () => void;
}

const generateInvoiceNum = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `JSW-INV-${new Date().getFullYear()}-${random}`;
};

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set) => ({
      invoiceNumber: generateInvoiceNum(),
      billingDate: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      
      regenerateInvoiceNumber: () => set({
        invoiceNumber: generateInvoiceNum()
      })
    }),
    {
      name: "mcms-invoice-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        invoiceNumber: state.invoiceNumber,
        billingDate: state.billingDate
      })
    }
  )
);

export default useInvoiceStore;
