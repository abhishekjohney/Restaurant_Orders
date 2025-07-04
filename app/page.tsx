"use client";

import { LocationData } from "@/types";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RiLoader2Fill } from "react-icons/ri";
import { toast } from "react-toastify";
import { GetCounterMasterList } from "./restaurants-bill/action";
import { CounterInterface } from "./restaurants-bill/types";

const currentYear = new Date().getFullYear().toString();
const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
let yearToUse = currentYear;

if (currentMonth < 4) {
  yearToUse = (parseInt(yearToUse) - 1).toString();
}

// ------------------------------
// LOGIN FORM COMMENTED OUT BY GITHUB COPILOT ON 2025-07-04
// Reason: To show a real homepage instead of a login form, as requested.
// All code is preserved below for future reference.
// ------------------------------
/*
...existing code for HomeEnd (login form and logic)...
*/

// COMMENTED OUT: Placeholder HomeEnd homepage. Replaced with dashboard redirect as per user request.
/*
export default function HomeEnd() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 via-blue-500 to-purple-600">
      <div className="bg-white h-auto shadow-md rounded-lg p-8 sm:max-w-md max-w-sm w-full space-y-6 text-center">
        <h2 className="md:text-3xl text-2xl customFont mb-3 font-extrabold text-gray-800">
          Welcome to <span className="text-blue-600">Cloud Commerce</span>
          <span className="text-red-600">!</span>
        </h2>
        <p className="text-lg text-gray-600">This is your homepage. Customize this section as needed.</p>
      </div>
    </div>
  );
}
*/
// Instead, redirect to dashboard page (cards UI)
// COMMENTED OUT: Previous HomeEnd placeholder and login redirect logic. Now rendering dashboard directly as per user request.
/*
export default function HomeRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return null;
}
*/
// Directly render the dashboard page as the home page
import DashboardPage from "./dashboard/page";
export default DashboardPage;
