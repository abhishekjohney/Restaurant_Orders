"use client";
// import { useSession } from "next-auth/react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import React, { useEffect, useState, memo } from "react";
// import empImage from "../../public/images/EmployeeDetailsIcon.png";
// import guestImage from "../../public/images/guest-list.png";
// import monthImage from "../../public/images/month.png";
// import monthWiseImage from "../../public/images/monthwise.png";
// import OrganizationMasterImage from "../../public/images/OrganizatioMaster.png";
// import partyImage from "../../public/images/party.png";
// import stockImage from "../../public/images/stock.jpg";
// import accounting from "../../public/images/svg/account.svg";
// import cashcount from "../../public/images/svg/cashcount.svg";
// import cashCounter from "../../public/images/svg/cashCounter.svg";
// import expense from "../../public/images/svg/expense.svg";
// import location from "../../public/images/svg/location.svg";
// import orderItem from "../../public/images/svg/orderItem.svg";
// import outofstock from "../../public/images/svg/outOfStock.svg";
// import todayImage from "../../public/images/today.png";

// Types
// interface DashboardItem {
//   id: string;
//   name: string;
//   icon: any;
//   redirect: string;
//   description?: string;
//   category?: string;
// }

// Dashboard items configuration with categories
// const DASHBOARD_ITEMS: DashboardItem[] = [
//   {
//     id: "item-list",
//     name: "Item list",
//     icon: stockImage,
//     redirect: "/dashboard/stockList",
//     description: "Manage inventory and stock",
//     category: "inventory",
//   },
//   {
//     id: "party-list",
//     name: "Party List",
//     icon: partyImage,
//     redirect: "/dashboard/partyList",
//     description: "Customer and vendor management",
//     category: "customers",
//   },
//   {
//     id: "users-order",
//     name: "Users Order",
//     icon: guestImage,
//     redirect: "/dashboard/usersOrder",
//     description: "Customer order history",
//     category: "orders",
//   },
//   {
//     id: "monthly-orders",
//     name: "Order Monthwise list",
//     icon: monthWiseImage,
//     redirect: "/dashboard/monthlyOrders",
//     description: "Monthly order analytics",
//     category: "orders",
//   },
//   {
//     id: "current-month",
//     name: "Current Month orders",
//     icon: monthImage,
//     redirect: "/dashboard/currentMonth",
//     description: "This month's orders",
//     category: "orders",
//   },
//   {
//     id: "resto-order",
//     name: "Resto Order",
//     icon: location,
//     redirect: "/restaurants-bill/MC0t",
//     description: "Restaurant orders",
//     category: "orders",
//   },
//   {
//     id: "cash-counter",
//     name: "Cash Counter",
//     icon: cashCounter,
//     redirect: "/cash-counter",
//     description: "Point of sale system",
//     category: "sales",
//   },
//   {
//     id: "instant-bill",
//     name: "Instant Bill",
//     icon: cashCounter,
//     redirect: "/instant-bill",
//     description: "Quick billing system",
//     category: "sales",
//   },
//   {
//     id: "stock-out",
//     name: "Stock out settings",
//     icon: outofstock,
//     redirect: "/stockout",
//     description: "Manage out of stock items",
//     category: "inventory",
//   },
//   {
//     id: "currency-check",
//     name: "Currency Check",
//     icon: cashcount,
//     redirect: "/currencychecklist",
//     description: "Currency verification",
//     category: "finance",
//   },
//   {
//     id: "todays-payment",
//     name: "Todays Payment",
//     icon: todayImage,
//     redirect: "/todaysPayment",
//     description: "Daily payment tracking",
//     category: "finance",
//   },
//   {
//     id: "todays-expense",
//     name: "Todays Expense",
//     icon: expense,
//     redirect: "/todaysExpense",
//     description: "Daily expense management",
//     category: "finance",
//   },
//   {
//     id: "orderwise-itemlist",
//     name: "Orderwise Itemlist",
//     icon: orderItem,
//     redirect: "/todaysOrderwiseItemList",
//     description: "Order item analysis",
//     category: "orders",
//   },
//   {
//     id: "employee-master",
//     name: "Employee Master List View",
//     icon: partyImage,
//     redirect: "/dashboard/employeeMasterList",
//     description: "Employee management",
//     category: "hr",
//   },
//   {
//     id: "employee-details",
//     name: "Employee Details",
//     icon: empImage,
//     redirect: "/dashboard/employeeDetails",
//     description: "Staff information",
//     category: "hr",
//   },
//   {
//     id: "accounts",
//     name: "Accounts",
//     icon: accounting,
//     redirect: "/accounting",
//     description: "Financial accounting",
//     category: "finance",
//   },
//   {
//     id: "daily-attendance",
//     name: "Daily Attendence",
//     icon: monthWiseImage,
//     redirect: "/dashboard/dailyAttendence",
//     description: "Employee attendance tracking",
//     category: "hr",
//   },
//   {
//     id: "organization-master",
//     name: "Organization Master",
//     icon: OrganizationMasterImage,
//     redirect: "/dashboard/organisationMaster",
//     description: "Organization settings",
//     category: "settings",
//   },
// ];

// Category colors
// const CATEGORY_COLORS = {
//   inventory: "from-green-100 to-emerald-100",
//   customers: "from-blue-100 to-cyan-100",
//   orders: "from-purple-100 to-violet-100",
//   sales: "from-orange-100 to-yellow-100",
//   finance: "from-red-100 to-pink-100",
//   hr: "from-indigo-100 to-purple-100",
//   settings: "from-gray-100 to-slate-100",
// };

// Memoized dashboard card component
// const DashboardCard = memo(({ item, onClick }: { item: DashboardItem; onClick: () => void }) => {
//   const categoryColor = CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] || "from-gray-100 to-slate-100";
// 
//   return (
//     <button
//       onClick={onClick}
//       className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 border border-gray-100 overflow-hidden w-full"
//     >
//       {/* Gradient overlay */}
//       <div
//         className={`absolute inset-0 bg-gradient-to-br ${categoryColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
//       />
// 
//       {/* Card content */}
//       <div className="relative p-6 flex flex-col items-center text-center space-y-4">
//         {/* Icon container */}
//         <div
//           className={`relative w-16 h-16 bg-gradient-to-br ${categoryColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
//         >
//           <Image
//             src={item.icon}
//             alt={`${item.name} icon`}
//             width={40}
//             height={40}
//             className="w-10 h-10 object-contain rounded-lg"
//             loading="lazy"
//           />
//           {/* Glow effect */}
//           <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
//         </div>
// 
//         {/* Text content */}
//         <div className="space-y-2">
//           <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">{item.name}</h3>
//           {item.description && (
//             <p className="text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.description}</p>
//           )}
//         </div>
//       </div>
// 
//       {/* Animated border */}
//       <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-colors duration-300" />
//     </button>
//   );
// });
// 
// DashboardCard.displayName = "DashboardCard";
// 
// // Sales type modal component
// const SalesTypeModal = memo(
//   ({
//     isOpen,
//     onClose,
//     onSelectType,
//     redirectPath,
//   }: {
//     isOpen: boolean;
//     onClose: () => void;
//     onSelectType: (type: string) => void;
//     redirectPath: string;
//   }) => {
//     if (!isOpen) return null;
// 
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//         <div className="bg-white rounded-2xl p-8 text-center w-96 shadow-2xl">
//           <h2 className="text-2xl font-bold mb-6 text-gray-800">Select Sales Type</h2>
//           <div className="flex justify-between space-x-4 mb-6">
//             <button
//               className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl w-full hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 font-semibold"
//               onClick={() => onSelectType("R")}
//             >
//               Sales R
//             </button>
//             <button
//               className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl w-full hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 font-semibold"
//               onClick={() => onSelectType("S")}
//             >
//               Sales S
//             </button>
//           </div>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-sm transition-colors duration-200">
//             Cancel
//           </button>
//         </div>
//       </div>
//     );
//   }
// );
// 
// SalesTypeModal.displayName = "SalesTypeModal";
// 
// // Main component
// const SalesmanPage = () => {
//   // const { data: session, status } = useSession();
//   // const router = useRouter();
// 
//   const [showModal, setShowModal] = useState(false);
//   const [redirectPath, setRedirectPath] = useState("");
//   const [type, setType] = useState("");
//   const [storedUserYear, setStoredUserYear] = useState("");
//   const [userYearPart, setUserYearPart] = useState("");
// 
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const selected = localStorage.getItem("salesType") || "";
//       setType(selected);
// 
//       const stored = localStorage.getItem("UserYear") || "";
//       setStoredUserYear(stored);
//       const parts = stored.split("_") || [];
//       setUserYearPart(parts[4] || "");
//     }
//   }, []);
// 
//   const handleCardClick = (item: DashboardItem) => {
//     if (item.name === "Sales" && type === "") {
//       setRedirectPath(item.redirect);
//       setShowModal(true);
//     } else {
//       // router.push(item.redirect);
//     }
//   };
// 
//   const handleSalesTypeSelect = (selectedType: string) => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem("salesType", selectedType);
//     }
//     // router.push(redirectPath);
//     setShowModal(false);
//   };
// 
//   const listsToShow = DASHBOARD_ITEMS.filter((item) => {
//     // const isAdmin = session?.user?.role === "admin";
// 
//     if (item.name === "Users Order") return false;
//     if (userYearPart === "ALL" && item.name === "Cash Counter") return false;
// 
//     return true;
//   });
// 
//   if (/* status === "loading" */ false) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }
// 
//   // const isAdmin = session?.user?.role === "admin";
// 
//   return (
//     <div className="min-w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 lg:mt-10">
//       {/* Sales Type Modal */}
//       <SalesTypeModal
//         isOpen={showModal}
//         onClose={() => setShowModal(false)}
//         onSelectType={handleSalesTypeSelect}
//         redirectPath={redirectPath}
//       />
// 
//       {/* Main content */}
//       <div className="sm:max-w-7xl max-w-full mx-auto px-2 sm:px-6 lg:px-8 py-6">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
//           {listsToShow.map((item) => (
//             <DashboardCard key={item.id} item={item} onClick={() => handleCardClick(item)} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };
// 
// // END OF DASHBOARD CODE BLOCK

// NEW LANDING PAGE (inspired by shanbake.in)
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const backgroundUrl = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1500&q=80"; // Example food background

export default function CustomLandingPage() {
  const router = useRouter();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        menuDropdownRef.current &&
        !menuDropdownRef.current.contains(event.target as Node)
      ) {
        setMenuDropdownOpen(false);
      }
    }
    if (userDropdownOpen || menuDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen, menuDropdownOpen]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />
      {/* HEADER BAR */}
      <header className="fixed top-9 left-0 w-full flex flex-row items-center justify-between px-4 py-2 z-50 bg-transparent">
        {/* Left: Brand and Location Dropdown */}
        <div className="flex flex-row items-center gap-4 justify-start">
          <span className="text-4xl font-extrabold tracking-wide drop-shadow bg-gradient-to-r from-pink-500 via-pink-400 to-white bg-clip-text text-transparent font-montserrat scale-y-125 scale-x-90">Cloud Commerce</span>
          <select className="px-4 py-2 rounded-lg bg-white bg-opacity-90 text-gray-800 font-semibold shadow focus:outline-none">
            <option value="" disabled selected>Select Location</option>
            <option value="current">Use Current Location</option>
            <option value="location1">Location 1</option>
            <option value="location2">Location 2</option>
          </select>
        </div>
        {/* Right: Live Support, Hamburger, Offers, Cart, Profile, Login */}
        <div className="flex items-center gap-3">
          <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="flex items-center text-green-500 font-semibold hover:underline">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="currentColor" className="mr-1"><path d="M16.003 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.62 4.47 1.8 6.39l-1.89 6.91a1.6 1.6 0 0 0 1.96 1.96l6.91-1.89a12.77 12.77 0 0 0 6.39 1.8c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.8-12.8-12.8zm0 23.04c-2.01 0-3.99-.54-5.7-1.56a1.6 1.6 0 0 0-1.13-.18l-5.13 1.4 1.4-5.13a1.6 1.6 0 0 0-.18-1.13A10.23 10.23 0 0 1 5.76 16c0-5.65 4.59-10.24 10.24-10.24s10.24 4.59 10.24 10.24-4.59 10.24-10.24 10.24zm5.13-7.36c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.41-.83-.74-1.39-1.65-1.56-1.93-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.18-.28.28-.46.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.28-.96.94-.96 2.29s.98 2.66 1.12 2.85c.14.18 1.93 2.95 4.68 4.02.65.28 1.16.45 1.56.58.66.21 1.26.18 1.73.11.53-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32z"/></svg>
            Live Support
          </a>
          {/* Hamburger menu with dropdown */}
          <div className="relative" ref={menuDropdownRef}>
            <button className="text-white hover:text-pink-400 focus:outline-none" onClick={() => setMenuDropdownOpen(open => !open)} aria-label="Menu">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {menuDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 animate-fade-in">
                <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100" />
                <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-pink-100 hover:text-pink-600 font-semibold rounded-t-xl transition">Help Centre</a>
                <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-pink-100 hover:text-pink-600 font-semibold transition">Contact Us</a>
                <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-pink-100 hover:text-pink-600 font-semibold rounded-b-xl transition">About Us</a>
              </div>
            )}
          </div>
          {/* Offers button */}
          <button className="bg-gray-100 rounded-full px-6 py-2 text-gray-800 font-semibold shadow-sm hover:bg-pink-100 transition">Offers</button>
          {/* Cart button */}
          <button className="bg-gray-100 rounded-full p-2 flex items-center justify-center shadow-sm hover:bg-pink-100 transition" aria-label="Cart">
            <svg width="28" height="28" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="17" cy="20" r="1.5" />
              <path d="M5 6h2l1.68 9.39A2 2 0 0 0 10.64 17h6.72a2 2 0 0 0 1.96-1.61L21 8H7" />
            </svg>
          </button>
          {/* User Icon Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              className="bg-white bg-opacity-80 rounded-full p-2 shadow flex items-center justify-center hover:bg-pink-100 transition"
              onClick={() => setUserDropdownOpen((open) => !open)}
              aria-label="User menu"
            >
              {/* User SVG icon */}
              <svg width="28" height="28" fill="none" stroke="#444" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8.5" r="4" />
                <path d="M4 20c0-2.5 3.5-4.5 8-4.5s8 2 8 4.5" />
                <path d="M15.5 10.5l2-2" stroke="#888" strokeWidth="1.5" />
                <circle cx="17.5" cy="8.5" r=".7" fill="#888" />
              </svg>
            </button>
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 animate-fade-in">
                <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100" />
                <button
                  className="w-full text-left px-4 py-2 text-gray-800 hover:bg-pink-100 hover:text-pink-600 font-semibold rounded-t-xl transition"
                  onClick={() => { setUserDropdownOpen(false); router.push('/login'); }}
                >
                  Log In
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-gray-800 hover:bg-pink-100 hover:text-pink-600 font-semibold rounded-b-xl transition"
                  onClick={() => { setUserDropdownOpen(false); router.push('/signup'); }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
          {/* Login button */}
          <button
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition"
            onClick={() => router.push("/login")}
          >
            Login
          </button>
        </div>
      </header>
      {/* END HEADER BAR */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 text-center drop-shadow-lg">
          Welcome to Restaurant Orders
        </h1>
        <p className="text-lg md:text-xl text-white mb-8 text-center drop-shadow">
          Delicious food, fast delivery, and a seamless ordering experience.
        </p>
        <div className="w-full flex flex-col md:flex-row items-center gap-4 mb-8">
          <input
            type="text"
            placeholder="Search for dishes, cuisines, or restaurants..."
            className="w-full md:w-2/3 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 text-lg shadow"
          />
          <button
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition"
            onClick={() => {/* search logic here */}}
          >
            Search
          </button>
        </div>
        <div className="w-full flex flex-row items-center justify-center gap-6 mt-4">
          <button
            className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg transition"
            onClick={() => router.push("/restaurants-bill/MC0t")}
          >
            Order Now
          </button>
        </div>
      </div>
      </div>
    );
  }
