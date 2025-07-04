"use client";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, memo } from "react";
import { ChevronDownIcon, UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

// Types
interface SalesTypeOption {
  id: string;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}

interface DashboardNavProps {
  username: string;
}

// Sales type options
const SALES_TYPE_OPTIONS: SalesTypeOption[] = [
  { id: "R", label: "Sales R", value: "R", color: "text-blue-600", bgColor: "bg-blue-500 hover:bg-blue-600" },
  { id: "S", label: "Sales S", value: "S", color: "text-green-600", bgColor: "bg-green-500 hover:bg-green-600" },
  { id: "A", label: "Sales A", value: "A", color: "text-purple-600", bgColor: "bg-purple-500 hover:bg-purple-600" },
];

// Memoized Modal Component
const SalesTypeModal = memo(({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect: (type: string) => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Select Sales Type</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
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

          {/* Footer */}
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

// Memoized User Dropdown
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
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      )}
    </div>
  )
);

UserDropdown.displayName = "UserDropdown";

// Main Navbar Component
export const DashboardNav = memo(({ username }: DashboardNavProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const router = useRouter();
  const { data: session } = useSession();

  // Get user from localStorage
  useEffect(() => {
    const localS = localStorage.getItem("UserYear");
    if (localS) {
      const parts = localS.split("_");
      const userSelected = parts[5];
      setUser(userSelected && userSelected !== "ALL" ? userSelected : username);
    } else {
      setUser(username);
    }
  }, [username]);

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

  const homeLink = session?.user?.role === "admin" ? "/dashboard" : "/userorderdashboard";

  return (
    <>
      {/* Sales Type Modal */}
      <SalesTypeModal isOpen={showModal} onClose={() => setShowModal(false)} onSelect={handleSalesTypeSelection} />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <label htmlFor="my-drawer-3" className="lg:hidden">
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
              {/* User Dropdown */}
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
    </>
  );
});

DashboardNav.displayName = "DashboardNav";
