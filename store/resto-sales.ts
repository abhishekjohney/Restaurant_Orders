import { SalesBlankItemInterface, SalesListInterface } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RestoSalesDetailsInterface {
  restoSalesDetails: SalesListInterface | Partial<SalesListInterface>;
  RestoSalesItemsDetailsData: SalesBlankItemInterface[];
  RestoCurrentSalesDetails: SalesBlankItemInterface | Partial<SalesBlankItemInterface>;
  RestoBlankSalesProductDetails: SalesBlankItemInterface | Partial<SalesBlankItemInterface>;
  setRestoSalesDetails: (details: SalesListInterface) => void;
  setRestoCurrentSalesDetails: (transactions: SalesBlankItemInterface | Partial<SalesBlankItemInterface>) => void;
  setRestoBlankSalesProductDetails: (transactions: SalesBlankItemInterface) => void;
  setRestoSalesItemsDetailsData: (itemsData: SalesBlankItemInterface[]) => void;
  removeAll: () => void;
}

const useRestoSalesStore = create<RestoSalesDetailsInterface>()(
  persist(
    (set) => ({
      restoSalesDetails: {} as Partial<SalesListInterface>,
      RestoCurrentSalesDetails: {} as Partial<SalesBlankItemInterface>,
      RestoSalesItemsDetailsData: [],
      RestoBlankSalesProductDetails: {} as Partial<SalesBlankItemInterface>,
      setRestoSalesDetails: (details) => set({ restoSalesDetails: details }),
      setRestoCurrentSalesDetails: (transactions) => set({ RestoCurrentSalesDetails: transactions }),
      setRestoBlankSalesProductDetails: (transactions) => set({ RestoBlankSalesProductDetails: transactions }),
      setRestoSalesItemsDetailsData: (itemsData) => set({ RestoSalesItemsDetailsData: itemsData }),
      removeAll: () =>
        set({ restoSalesDetails: {}, RestoCurrentSalesDetails: {}, RestoBlankSalesProductDetails: {}, RestoSalesItemsDetailsData: [] }),
    }),
    {
      name: "resto-sales-storage", // Name of the localStorage key
    }
  )
);

export default useRestoSalesStore;
