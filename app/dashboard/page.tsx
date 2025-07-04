"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, memo } from "react";
import empImage from "../../public/images/EmployeeDetailsIcon.png";
import guestImage from "../../public/images/guest-list.png";
import monthImage from "../../public/images/month.png";
import monthWiseImage from "../../public/images/monthwise.png";
import OrganizationMasterImage from "../../public/images/OrganizatioMaster.png";
import partyImage from "../../public/images/party.png";
import stockImage from "../../public/images/stock.jpg";
import accounting from "../../public/images/svg/account.svg";
import cashcount from "../../public/images/svg/cashcount.svg";
import cashCounter from "../../public/images/svg/cashCounter.svg";
import expense from "../../public/images/svg/expense.svg";
import location from "../../public/images/svg/location.svg";
import orderItem from "../../public/images/svg/orderItem.svg";
import outofstock from "../../public/images/svg/outOfStock.svg";
import todayImage from "../../public/images/today.png";

// Types
interface DashboardItem {
  id: string;
  name: string;
  icon: any;
  redirect: string;
  description?: string;
  category?: string;
}

// Dashboard items configuration with categories
const DASHBOARD_ITEMS: DashboardItem[] = [
  {
    id: "item-list",
    name: "Item list",
    icon: stockImage,
    redirect: "/dashboard/stockList",
    description: "Manage inventory and stock",
    category: "inventory",
  },
  {
    id: "party-list",
    name: "Party List",
    icon: partyImage,
    redirect: "/dashboard/partyList",
    description: "Customer and vendor management",
    category: "customers",
  },
  {
    id: "users-order",
    name: "Users Order",
    icon: guestImage,
    redirect: "/dashboard/usersOrder",
    description: "Customer order history",
    category: "orders",
  },
  {
    id: "monthly-orders",
    name: "Order Monthwise list",
    icon: monthWiseImage,
    redirect: "/dashboard/monthlyOrders",
    description: "Monthly order analytics",
    category: "orders",
  },
  {
    id: "current-month",
    name: "Current Month orders",
    icon: monthImage,
    redirect: "/dashboard/currentMonth",
    description: "This month's orders",
    category: "orders",
  },
  {
    id: "resto-order",
    name: "Resto Order",
    icon: location,
    redirect: "/restaurants-bill/MC0t",
    description: "Restaurant orders",
    category: "orders",
  },
  {
    id: "cash-counter",
    name: "Cash Counter",
    icon: cashCounter,
    redirect: "/cash-counter",
    description: "Point of sale system",
    category: "sales",
  },
  {
    id: "instant-bill",
    name: "Instant Bill",
    icon: cashCounter,
    redirect: "/instant-bill",
    description: "Quick billing system",
    category: "sales",
  },
  {
    id: "stock-out",
    name: "Stock out settings",
    icon: outofstock,
    redirect: "/stockout",
    description: "Manage out of stock items",
    category: "inventory",
  },
  {
    id: "currency-check",
    name: "Currency Check",
    icon: cashcount,
    redirect: "/currencychecklist",
    description: "Currency verification",
    category: "finance",
  },
  {
    id: "todays-payment",
    name: "Todays Payment",
    icon: todayImage,
    redirect: "/todaysPayment",
    description: "Daily payment tracking",
    category: "finance",
  },
  {
    id: "todays-expense",
    name: "Todays Expense",
    icon: expense,
    redirect: "/todaysExpense",
    description: "Daily expense management",
    category: "finance",
  },
  {
    id: "orderwise-itemlist",
    name: "Orderwise Itemlist",
    icon: orderItem,
    redirect: "/todaysOrderwiseItemList",
    description: "Order item analysis",
    category: "orders",
  },
  {
    id: "employee-master",
    name: "Employee Master List View",
    icon: partyImage,
    redirect: "/dashboard/employeeMasterList",
    description: "Employee management",
    category: "hr",
  },
  {
    id: "employee-details",
    name: "Employee Details",
    icon: empImage,
    redirect: "/dashboard/employeeDetails",
    description: "Staff information",
    category: "hr",
  },
  {
    id: "accounts",
    name: "Accounts",
    icon: accounting,
    redirect: "/accounting",
    description: "Financial accounting",
    category: "finance",
  },
  {
    id: "daily-attendance",
    name: "Daily Attendence",
    icon: monthWiseImage,
    redirect: "/dashboard/dailyAttendence",
    description: "Employee attendance tracking",
    category: "hr",
  },
  {
    id: "organization-master",
    name: "Organization Master",
    icon: OrganizationMasterImage,
    redirect: "/dashboard/organisationMaster",
    description: "Organization settings",
    category: "settings",
  },
];

// Category colors
const CATEGORY_COLORS = {
  inventory: "from-green-100 to-emerald-100",
  customers: "from-blue-100 to-cyan-100",
  orders: "from-purple-100 to-violet-100",
  sales: "from-orange-100 to-yellow-100",
  finance: "from-red-100 to-pink-100",
  hr: "from-indigo-100 to-purple-100",
  settings: "from-gray-100 to-slate-100",
};

// Memoized dashboard card component
const DashboardCard = memo(({ item, onClick }: { item: DashboardItem; onClick: () => void }) => {
  const categoryColor = CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] || "from-gray-100 to-slate-100";

  return (
    <button
      onClick={onClick}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 border border-gray-100 overflow-hidden w-full"
    >
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${categoryColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Card content */}
      <div className="relative p-6 flex flex-col items-center text-center space-y-4">
        {/* Icon container */}
        <div
          className={`relative w-16 h-16 bg-gradient-to-br ${categoryColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
        >
          <Image
            src={item.icon}
            alt={`${item.name} icon`}
            width={40}
            height={40}
            className="w-10 h-10 object-contain rounded-lg"
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
    </button>
  );
});

DashboardCard.displayName = "DashboardCard";

// Sales type modal component
const SalesTypeModal = memo(
  ({
    isOpen,
    onClose,
    onSelectType,
    redirectPath,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSelectType: (type: string) => void;
    redirectPath: string;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl p-8 text-center w-96 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Select Sales Type</h2>
          <div className="flex justify-between space-x-4 mb-6">
            <button
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl w-full hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 font-semibold"
              onClick={() => onSelectType("R")}
            >
              Sales R
            </button>
            <button
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl w-full hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 font-semibold"
              onClick={() => onSelectType("S")}
            >
              Sales S
            </button>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-sm transition-colors duration-200">
            Cancel
          </button>
        </div>
      </div>
    );
  }
);

SalesTypeModal.displayName = "SalesTypeModal";

// Main component
const SalesmanPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [redirectPath, setRedirectPath] = useState("");
  const [type, setType] = useState("");
  const [storedUserYear, setStoredUserYear] = useState("");
  const [userYearPart, setUserYearPart] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const selected = localStorage.getItem("salesType") || "";
      setType(selected);

      const stored = localStorage.getItem("UserYear") || "";
      setStoredUserYear(stored);
      const parts = stored.split("_") || [];
      setUserYearPart(parts[4] || "");
    }
  }, []);

  const handleCardClick = (item: DashboardItem) => {
    if (item.name === "Sales" && type === "") {
      setRedirectPath(item.redirect);
      setShowModal(true);
    } else {
      router.push(item.redirect);
    }
  };

  const handleSalesTypeSelect = (selectedType: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("salesType", selectedType);
    }
    router.push(redirectPath);
    setShowModal(false);
  };

  const listsToShow = DASHBOARD_ITEMS.filter((item) => {
    const isAdmin = session?.user?.role === "admin";

    if (isAdmin) return true;

    if (item.name === "Users Order") return false;
    if (userYearPart === "ALL" && item.name === "Cash Counter") return false;

    return true;
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="min-w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 lg:mt-10">
      {/* Sales Type Modal */}
      <SalesTypeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelectType={handleSalesTypeSelect}
        redirectPath={redirectPath}
      />

      {/* Main content */}
      <div className="sm:max-w-7xl max-w-full mx-auto px-2 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {listsToShow.map((item) => (
            <DashboardCard key={item.id} item={item} onClick={() => handleCardClick(item)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(SalesmanPage);
