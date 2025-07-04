import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Providers from "./Providers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "leaflet/dist/leaflet.css";
import ModalProvider from "@/Provider";
import UrlTracker from "@/components/common/UrlTracker";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cloud Commerce",
  description: "Elevate business visibility",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Providers>
        <ModalProvider>
          <body className={inter.className} data-theme="cupcake">
            <UrlTracker />
            {children}
            <ToastContainer autoClose={2000} />
          </body>
        </ModalProvider>
      </Providers>
    </html>
  );
}
