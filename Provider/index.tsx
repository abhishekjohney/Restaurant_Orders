"use client";
import { createContext, useContext, useState } from "react";

interface ModalProviderProps {
    children: React.ReactNode;
}

type ModalContextType = {
    isOpen: boolean;
    setClose: () => void;
    setOpen: () => void;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ModalContext = createContext<ModalContextType>({
    isOpen: false,
    setClose: () => {},
    setOpen: () => {},
    setIsOpen: () => {},
});

const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const setClose = () => {
        setIsOpen(false);
    };
    const setOpen = () => {
        setIsOpen(true);
    };

    return <ModalContext.Provider value={{ setClose, isOpen, setOpen, setIsOpen }}>{children}</ModalContext.Provider>;
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within the modal provider");
    }
    return context;
};

export default ModalProvider;
