"use client";

import { adminSidebarItems } from "@/data/adminSidebarItems";
import { staffSidebarItems } from "@/data/staffSidebarItems";
import { ArrowRightEndOnRectangleIcon, Bars3Icon, ChevronDownIcon, Cog6ToothIcon, UserIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";
import Banner from "../../public/images/banner.png";
import Image from "next/image";

// Types
interface SalesTypeOption {
  id: string;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  adminOnly?: boolean;
  badge?: string;
  color?: string;
}

interface SessionData {
  user: {
    name: string;
    role: string;
  };
}

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  session: {
    user: {
      id: string;
      role: "admin" | "salesman" | "multi-user" | "counter";
      systemDate: string;
      ClientCode: string;
      UserType: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  };
}

// Configuration
const SALES_TYPE_OPTIONS: SalesTypeOption[] = [
  { id: "R", label: "Sales R", value: "R", color: "text-blue-600", bgColor: "bg-blue-500 hover:bg-blue-600" },
  { id: "S", label: "Sales S", value: "S", color: "text-green-600", bgColor: "bg-green-500 hover:bg-green-600" },
  { id: "A", label: "Sales A", value: "A", color: "text-purple-600", bgColor: "bg-purple-500 hover:bg-purple-600" },
];

// ===== MODAL COMPONENT =====
const SalesTypeModal = memo(({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect: (type: string) => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Select Sales Type</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-3">
            {SALES_TYPE_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => onSelect(option.value)}
                className={`w-full ${option.bgColor} text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 px-6 py-4">
            <button onClick={onClose} className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

SalesTypeModal.displayName = "SalesTypeModal";

// ===== USER DROPDOWN COMPONENT =====
const UserDropdown = memo(
  ({
    isOpen,
    onToggle,
    onProfile,
    onSalesType,
    onLogout,
    user,
    role,
  }: {
    isOpen: boolean;
    onToggle: () => void;
    onProfile: () => void;
    onSalesType: () => void;
    onLogout: () => void;
    user: string;
    role: string;
  }) => (
    <div className="relative">
      <button onClick={onToggle} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors group">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-gray-700">{user}</span>
          <span className="text-xs text-gray-500 capitalize">{role}</span>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-semibold text-sm">{user?.charAt(0).toUpperCase()}</span>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-40">
          <button
            onClick={onProfile}
            className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <UserIcon className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </button>
          <button
            onClick={onSalesType}
            className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Cog6ToothIcon className="w-5 h-5" />
            <span className="font-medium">Sales Type</span>
          </button>
          <hr className="my-2 border-gray-100" />
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
          >
            <ArrowRightEndOnRectangleIcon className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      )}
    </div>
  )
);

UserDropdown.displayName = "UserDropdown";

// ===== SIDEBAR ITEM COMPONENT =====
const SidebarItem = memo(({ item, isActive, isAdmin }: { item: SidebarItem; isActive: boolean; isAdmin: boolean }) => {
  if (item.adminOnly && !isAdmin) return null;

  const href = item.id === "dashboard" ? (isAdmin ? "/dashboard" : "/userorderdashboard") : item.href;

  const Icon = item.icon;

  return (
    <a
      href={href}
      className={`group relative flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-gray-100 ${
        isActive ? "bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 shadow-sm" : "hover:shadow-sm"
      }`}
    >
      <div className={`flex-shrink-0 w-6 h-6 ${isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"}`}>
        <Icon className="w-full h-full" />
      </div>

      <span className={`flex-1 text-sm font-medium ${isActive ? "text-blue-900" : "text-gray-700 group-hover:text-gray-900"}`}>
        {item.label}
      </span>

      {item.badge && (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">{item.badge}</span>
      )}

      {isActive && <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full"></div>}
    </a>
  );
});

SidebarItem.displayName = "SidebarItem";

// ===== MAIN LAYOUT COMPONENT =====
export const DashboardLayoutClient = memo(({ children, session }: DashboardLayoutClientProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<string>("");

  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "admin";
  const role = session.user.role;
  const sidebarItems = role === "admin" || role === "counter" ? adminSidebarItems : staffSidebarItems;
  const homeLink = role === "admin" || role === "counter" ? "/dashboard" : "/userorderdashboard";

  // Get user from localStorage
  useEffect(() => {
    let userName = session?.user?.name || "";
    setUser(userName);
  }, [session.user.name]);

  // Handle profile navigation
  const handleProfile = useCallback(() => {
    router.push("/profile");
    setShowDropdown(false);
  }, [router]);

  // Handle sales type selection
  const handleSalesTypeSelection = useCallback((type: string) => {
    localStorage.setItem("salesType", type);
    setShowModal(false);
    window.location.reload();
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.clear();
    signOut();
  }, []);

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    setShowDropdown((prev) => !prev);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && !(event.target as Element).closest(".user-dropdown")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Sales Type Modal */}
      <SalesTypeModal isOpen={showModal} onClose={() => setShowModal(false)} onSelect={handleSalesTypeSelection} />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <label htmlFor="my-drawer-3" className="">
                <Bars3Icon className="w-6 h-6 text-gray-700 cursor-pointer hover:text-gray-900" />
              </label>

              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <a href={homeLink} className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
                  Cloud Commerce
                </a>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <div className="user-dropdown">
                <UserDropdown
                  isOpen={showDropdown}
                  onToggle={toggleDropdown}
                  onProfile={handleProfile}
                  onSalesType={() => {
                    setShowModal(true);
                    setShowDropdown(false);
                  }}
                  onLogout={handleLogout}
                  user={user}
                  role={session?.user?.role || "user"}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="drawer ">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

        {/* Main Content */}
        <div className="drawer-content flex flex-col">
          <main className="flex-1 lg:ml-0 transition-all duration-300">
            <div className="pt-20 lg:pt-10">{children}</div>
          </main>
        </div>

        {/* Sidebar */}
        <div className="drawer-side z-30">
          <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay lg:hidden"></label>
          <aside className="w-80 min-h-full bg-white/95 backdrop-blur-md shadow-2xl border-r border-gray-200/50">
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md p-4 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{session.user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{session.user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{session.user.role}</p>
                  </div>
                </div>
                <label htmlFor="my-drawer-3" className="lg:hidden">
                  <XMarkIcon className="w-5 h-5 text-gray-600 cursor-pointer" />
                </label>              
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex flex-col h-full">
              <nav className="flex-1 px-2 py-2 space-y-1">
                {/* Main Navigation */}
                <div className="w-full h-10 flex justify-center">
                  <Image alt="chypherinfo solution" src={Banner} height={100} width={200} className="w-fit h-10" />
                </div>
                <div className="space-y-1">
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main Navigation</h3>
                  </div>

                  {sidebarItems.slice(0, 1).map((item) => (
                    <SidebarItem
                      key={item.id}
                      item={item}
                      isActive={pathname === (item.id === "dashboard" ? (isAdmin ? "/dashboard" : "/userorderdashboard") : item.href)}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>

                {/* Orders Section */}
                <div className="space-y-1 pt-4">
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders & Analytics</h3>
                  </div>

                  {sidebarItems.slice(2, 5).map((item) => (
                    <SidebarItem key={item.id} item={item} isActive={pathname === item.href} isAdmin={isAdmin} />
                  ))}
                </div>

                {/* Management Section */}
                <div className="space-y-1 pt-4">
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Management</h3>
                  </div>

                  {sidebarItems.slice(5).map((item) => (
                    <SidebarItem key={item.id} item={item} isActive={pathname === item.href} isAdmin={isAdmin} />
                  ))}
                </div>
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
});

DashboardLayoutClient.displayName = "DashboardLayoutClient";
