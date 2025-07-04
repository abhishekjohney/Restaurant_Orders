import {
  HomeIcon,
  CubeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  MapIcon,
  ClipboardDocumentListIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export const staffSidebarItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/userorderdashboard",
    icon: HomeIcon,
  },
  {
    id: "item-wise",
    label: "Item wise List",
    href: "/userorderdashboard/stockList",
    icon: CubeIcon,
  },
  {
    id: "monthly-orders",
    label: "Monthly Orders",
    href: "/userorderdashboard/monthlyOrders",
    icon: ChartBarIcon,
  },
  {
    id: "current-month",
    label: "Current Month Orders",
    href: "/userorderdashboard/currentMonth",
    icon: CalendarDaysIcon,
  },
  {
    id: "users-order",
    label: "Users Order",
    href: "/userorderdashboard/usersOrder",
    icon: UserGroupIcon,
  },
  {
    id: "resto-order",
    label: "Resto Order",
    href: "/restaurants-bill/MC0t",
    icon: MapIcon,
  },
  {
    id: "orderwise-sale",
    label: "Orderwise Sale",
    href: "/todaysOrderwiseItemList",
    icon: ClipboardDocumentListIcon,
  },
  {
    id: "employee-details",
    label: "Employee Details",
    href: "/userorderdashboard/employeeDetails",
    icon: UserIcon,
  },
];
