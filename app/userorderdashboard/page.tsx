"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { memo } from "react";

// Import images
import empImage from "../../public/images/EmployeeDetailsIcon.png";
import guestImage from "../../public/images/guest-list.png";
import CurrentMonth from "../../public/images/month.png";
import MonthWise from "../../public/images/monthwise.png";
import stockImage from "../../public/images/stock.jpg";
import location from "../../public/images/svg/location.svg";
import orderItem from "../../public/images/svg/orderItem.svg";

// Types
interface DashboardItem {
  id: string;
  name: string;
  icon: any;
  redirect: string;
  description?: string;
}

interface SalesmanPageProps {
  params: { userid: string };
}

// Dashboard items configuration
const DASHBOARD_ITEMS: DashboardItem[] = [
  {
    id: "item-wise",
    name: "Item wise List",
    icon: stockImage,
    redirect: "/userorderdashboard/stockList",
    description: "View items and stock details",
  },
  {
    id: "monthly-orders",
    name: "Order Monthwise list",
    icon: MonthWise,
    redirect: "/userorderdashboard/monthlyOrders",
    description: "Monthly order analytics",
  },
  {
    id: "current-month",
    name: "Current Month orders",
    icon: CurrentMonth,
    redirect: "/userorderdashboard/currentMonth",
    description: "This month's orders",
  },
  {
    id: "users-order",
    name: "Users Order",
    icon: guestImage,
    redirect: "/userorderdashboard/usersOrder",
    description: "Customer order history",
  },
  {
    id: "resto-order",
    name: "Resto Order",
    icon: location,
    redirect: "/restaurants-bill/MC0t",
    description: "Restaurant orders",
  },
  {
    id: "orderwise-sale",
    name: "Orderwise Sale",
    icon: orderItem,
    redirect: "/todaysOrderwiseItemList",
    description: "Sales by order analysis",
  },
  {
    id: "employee-details",
    name: "Employee Details",
    icon: empImage,
    redirect: "/userorderdashboard/employeeDetails",
    description: "Staff information",
  },
];

// Memoized dashboard card component
const DashboardCard = memo(({ item }: { item: DashboardItem }) => (
  <Link
    href={item.redirect}
    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
  >
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    {/* Card content */}
    <div className="relative p-6 flex flex-col items-center text-center space-y-4">
      {/* Icon container */}
      <div className="relative w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Image src={item.icon} alt={`${item.name} icon`} className="w-10 h-10 object-contain rounded-lg" loading="lazy" />
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

DashboardCard.displayName = "DashboardCard";

// Main component
const SalesmanPage = ({ params }: SalesmanPageProps) => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 lg:mt-10">
      {/* Main content */}
      <div className="sm:max-w-7xl max-w-full mx-auto px-2 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {DASHBOARD_ITEMS.map((item) => (
            <DashboardCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(SalesmanPage);
