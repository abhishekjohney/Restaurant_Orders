import { RestoBlankItemInterface, RestoOrderDetailsInterface } from "@/app/restaurants-bill/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RestoStoreInterface {
  restoDetails: RestoOrderDetailsInterface | Partial<RestoOrderDetailsInterface>;
  restoProductContainer: RestoBlankItemInterface[];
  restoCurrentProduct: RestoBlankItemInterface | Partial<RestoBlankItemInterface>;
  blankRestoProduct: RestoBlankItemInterface | Partial<RestoBlankItemInterface>;
  setRestoDetails: (details: RestoOrderDetailsInterface) => void;
  setRestoCurrentProduct: (transactions: RestoBlankItemInterface | Partial<RestoBlankItemInterface>) => void;
  setBlankRestoProduct: (transactions: RestoBlankItemInterface) => void;
  setRestoProductContainer: (cart: RestoBlankItemInterface[]) => void;
  removeAll: () => void;
}

const useRestoStore = create<RestoStoreInterface>()(
  persist(
    (set) => ({
      restoDetails: {} as Partial<RestoOrderDetailsInterface>,
      restoCurrentProduct: {} as Partial<RestoBlankItemInterface>,
      restoProductContainer: [],
      blankRestoProduct: {} as Partial<RestoBlankItemInterface>,
      setRestoDetails: (details) => set({ restoDetails: details }),
      setRestoCurrentProduct: (transactions) => set({ restoCurrentProduct: transactions }),
      setBlankRestoProduct: (transactions) => set({ blankRestoProduct: transactions }),
      setRestoProductContainer: (cart) => set({ restoProductContainer: cart }),
      removeAll: () => set({ restoDetails: {}, restoCurrentProduct: {}, blankRestoProduct: {}, restoProductContainer: [] }),
    }),
    {
      name: "resto-storage", // Name of the localStorage key
    }
  )
);

export default useRestoStore;
