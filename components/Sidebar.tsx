"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { memo } from "react";
import {
  ChartBarIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  MapIcon,
  UserGroupIcon,
  XMarkIcon,
  HomeIcon,
  BuildingStorefrontIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Types
interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  adminOnly?: boolean;
  badge?: string;
  color?: string;
}

interface SidebarProps {
  className?: string;
}

// Sidebar navigation items
const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard", // Will be dynamic based on role
    icon: HomeIcon,
    color: "text-blue-600",
  },
  {
    id: "current-month",
    label: "Current Month",
    href: "/dashboard/currentMonth",
    icon: CalendarDaysIcon,
    color: "text-green-600",
  },
  {
    id: "todays-orders",
    label: "Today's Orders",
    href: "/todaysOrders",
    icon: ClockIcon,
    color: "text-orange-600",
    badge: "New",
  },
  {
    id: "monthly-orders",
    label: "Monthly Orders",
    href: "/dashboard/monthlyOrders",
    icon: ChartBarIcon,
    color: "text-purple-600",
  },
  {
    id: "users-orders",
    label: "User's Orders",
    href: "/dashboard/usersOrder",
    icon: UserGroupIcon,
    adminOnly: true,
    color: "text-indigo-600",
  },
  {
    id: "stock-list",
    label: "Stock List",
    href: "/dashboard/stockList",
    icon: CubeIcon,
    color: "text-emerald-600",
  },
  {
    id: "change-route",
    label: "Change Route",
    href: "/changeRoute",
    icon: MapIcon,
    color: "text-red-600",
  },
  {
    id: "party-list",
    label: "Party List",
    href: "/dashboard/partyList",
    icon: BuildingStorefrontIcon,
    color: "text-pink-600",
  },
];

// Memoized sidebar item component
const SidebarItem = memo(({ item, isActive, isAdmin }: { item: SidebarItem; isActive: boolean; isAdmin: boolean }) => {
  // Skip admin-only items for non-admins
  if (item.adminOnly && !isAdmin) return null;

  // Dynamic dashboard href based on role
  const href = item.id === "dashboard" ? (isAdmin ? "/dashboard" : "/userorderdashboard") : item.href;

  const Icon = item.icon;

  return (
    <Link
      href={href}
      className={`group relative flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-gray-100 ${
        isActive ? "bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 shadow-sm" : "hover:shadow-sm"
      }`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-6 h-6 ${isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"}`}>
        <Icon className="w-full h-full" />
      </div>

      {/* Label */}
      <span className={`flex-1 text-sm font-medium ${isActive ? "text-blue-900" : "text-gray-700 group-hover:text-gray-900"}`}>
        {item.label}
      </span>

      {/* Badge */}
      {item.badge && (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">{item.badge}</span>
      )}

      {/* Active indicator */}
      {isActive && <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full"></div>}
    </Link>
  );
});

SidebarItem.displayName = "SidebarItem";

// Main Sidebar Component
export const Sidebar = memo(({ className = "" }: SidebarProps) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "admin";

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Close button for mobile */}
      <div className="flex items-center justify-between p-4 lg:hidden">
        <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
        <label htmlFor="my-drawer-3" className="btn btn-sm btn-circle btn-ghost">
          <XMarkIcon className="w-5 h-5 text-gray-600" />
        </label>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-2 space-y-1">
        {/* Main Navigation */}
        <div className="space-y-1">
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main Navigation</h3>
          </div>

          {SIDEBAR_ITEMS.slice(0, 2).map((item) => (
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

          {SIDEBAR_ITEMS.slice(2, 5).map((item) => (
            <SidebarItem key={item.id} item={item} isActive={pathname === item.href} isAdmin={isAdmin} />
          ))}
        </div>

        {/* Management Section */}
        <div className="space-y-1 pt-4">
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Management</h3>
          </div>

          {SIDEBAR_ITEMS.slice(5).map((item) => (
            <SidebarItem key={item.id} item={item} isActive={pathname === item.href} isAdmin={isAdmin} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 mt-auto">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-xs">{session?.user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{session?.user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

Sidebar.displayName = "Sidebar";
