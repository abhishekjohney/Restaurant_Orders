"use client";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

import BackButton from "@/components/BackButton";
import empImage from "../../public/images/EmployeeDetailsIcon.png";
import partyImage from "../../public/images/party.png";
import dateWise from "../../public/images/svg/dateWise.svg";

// Types
interface SubmenuItem {
  id: string;
  name: string;
  icon: any;
  redirect: string;
  description?: string;
}

// Submenu items configuration
const SUBMENU_ITEMS: SubmenuItem[] = [
  {
    id: "party-ledger",
    name: "Party Ledger Info",
    icon: partyImage,
    redirect: "/accounting/partyLedgerInfo",
    description: "View customer and vendor ledger details",
  },
  {
    id: "employee-info",
    name: "Employee Info",
    icon: empImage,
    redirect: "/accounting/employeeInfo",
    description: "Employee financial information",
  },
  {
    id: "date-wise-sales",
    name: "Date Wise Sales Report",
    icon: dateWise,
    redirect: "/accounting/dailyWiseSalesReport",
    description: "Daily sales analytics and reports",
  },
];

// Memoized submenu card component
const SubmenuCard = memo(({ item }: { item: SubmenuItem }) => (
  <Link
    href={item.redirect}
    className="group relative bg-white rounded-2xl w-fit min-w-80 mx-auto shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
  >
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    {/* Card content */}
    <div className="relative p-6 flex flex-col items-center text-center space-y-4">
      {/* Icon container */}
      <div className="relative w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Image
          src={item.icon}
          alt={`${item.name} icon`}
          width={50}
          height={50}
          className="w-12 h-12 object-contain rounded-lg"
          loading="lazy"
        />
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      </div>

      {/* Text content */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.description}</p>
        )}
      </div>
    </div>

    {/* Animated border */}
    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-colors duration-300" />
  </Link>
));

SubmenuCard.displayName = "SubmenuCard";

// Main component
const AccountsSubmenu = () => {
  return (
    <div className="min-w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 lg:mt-10">
      <div className="sm:max-w-7xl max-w-full mx-auto px-2 sm:px-6 lg:px-8">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <div className="flex items-center space-x-4">
            <BackButton path="Accounts" />
          </div>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center items-center">
          {SUBMENU_ITEMS.map((item) => (
            <SubmenuCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(AccountsSubmenu);
