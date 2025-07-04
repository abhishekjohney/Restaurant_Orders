import { OrderDetailsInterface, OrderTransactionInterface } from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CartStoreInterface {
  orderDetails: OrderDetailsInterface | Partial<OrderDetailsInterface>;
  CartProductDetailsJsonArr: OrderTransactionInterface[];
  CurrentProductDetailsJson: OrderTransactionInterface | Partial<OrderTransactionInterface>;
  BlankProductDetailsJson: OrderTransactionInterface | Partial<OrderTransactionInterface>;
  setOrderDetails: (details: OrderDetailsInterface) => void;
  setCurrentProductDetailsJson: (transactions: OrderTransactionInterface | Partial<OrderTransactionInterface>) => void;
  setBlankProductDetailsJson: (transactions: OrderTransactionInterface) => void;
  setAddCartProductJson: (cart: OrderTransactionInterface[]) => void;
  removeAll: () => void;
}

const useOrderStore = create<CartStoreInterface>()(
  persist(
    (set) => ({
      orderDetails: {} as Partial<OrderDetailsInterface>,
      CurrentProductDetailsJson: {} as Partial<OrderTransactionInterface>,
      CartProductDetailsJsonArr: [],
      BlankProductDetailsJson: {} as Partial<OrderTransactionInterface>,
      setOrderDetails: (details) => set({ orderDetails: details }),
      setCurrentProductDetailsJson: (transactions) => set({ CurrentProductDetailsJson: transactions }),
      setBlankProductDetailsJson: (transactions) => set({ BlankProductDetailsJson: transactions }),
      setAddCartProductJson: (cart) => set({ CartProductDetailsJsonArr: cart }),
      removeAll: () => set({ orderDetails: {}, CurrentProductDetailsJson: {}, BlankProductDetailsJson: {}, CartProductDetailsJsonArr: [] }),
    }),
    {
      name: "order-storage", // Name of the localStorage key
    }
  )
);

export default useOrderStore;
