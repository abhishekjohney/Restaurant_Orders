import { SalesBlankItemInterface, SalesDetailsDataInterface, SalesListInterface } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SalesDetailsInterface {
  salesDetails: SalesListInterface | Partial<SalesListInterface>;
  SalesItemsDetailsData: SalesBlankItemInterface[];
  CurrentSalesDetails: SalesBlankItemInterface | Partial<SalesBlankItemInterface>;
  BlankSalesProductDetails: SalesBlankItemInterface | Partial<SalesBlankItemInterface>;
  setSalesDetails: (details: SalesListInterface) => void;
  setCurrentSalesDetails: (transactions: SalesBlankItemInterface | Partial<SalesBlankItemInterface>) => void;
  setBlankSalesProductDetails: (transactions: SalesBlankItemInterface) => void;
  setSalesItemsDetailsData: (itemsData: SalesBlankItemInterface[]) => void;
  removeAll: () => void;
}

const useSalesStore = create<SalesDetailsInterface>()(
  persist(
    (set) => ({
      salesDetails: {} as Partial<SalesListInterface>,
      CurrentSalesDetails: {} as Partial<SalesBlankItemInterface>,
      SalesItemsDetailsData: [],
      BlankSalesProductDetails: {} as Partial<SalesBlankItemInterface>,
      setSalesDetails: (details) => set({ salesDetails: details }),
      setCurrentSalesDetails: (transactions) => set({ CurrentSalesDetails: transactions }),
      setBlankSalesProductDetails: (transactions) => set({ BlankSalesProductDetails: transactions }),
      setSalesItemsDetailsData: (itemsData) => set({ SalesItemsDetailsData: itemsData }),
      removeAll: () => set({ salesDetails: {}, CurrentSalesDetails: {}, BlankSalesProductDetails: {}, SalesItemsDetailsData: [] }),
    }),
    {
      name: "sales-storage", // Name of the localStorage key
    }
  )
);

export default useSalesStore;
