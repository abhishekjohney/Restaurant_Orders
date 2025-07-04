"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const UrlTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    const previousPathname: any = localStorage.getItem("currentPathname");
    localStorage.setItem("previousPathname", previousPathname);
    localStorage.setItem("currentPathname", pathname);
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default UrlTracker;
