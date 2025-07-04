import { OrderItemTypeTodayOrder } from "@/types";
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import ElapsedTimeDisplay from "./ElapsedTimeDisplay";
import { ListApi } from "@/app/utils/api";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  data: OrderItemTypeTodayOrder[];
  close: Dispatch<SetStateAction<boolean>>;
  setFormData: React.Dispatch<React.SetStateAction<{ orderId: string }>>;
  handleMOP?: (id: number, which: string) => void;
  handlePrintOrder: (id: string) => void;
  handleView: (id: number) => void;
  handleRefresh: () => void;
}

type EmployeeOrder = {
  EMPCODE: string;
  EmpName: string;
};

const OrderList: React.FC<Props> = ({ data, close, setFormData, handlePrintOrder, handleView, handleRefresh }) => {
  const listAPI = new ListApi();
  const session = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<"all" | "pending" | "billed" | "cancelled">("pending");
  const [userTypes, setUserTypes] = useState<EmployeeOrder[]>([]);
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState<string>("");
  const [buttonSubmit, setButtonSubmit] = useState(false);

  const FetchEmployeeDetails = async () => {
    try {
      const response = await listAPI.getEmployeeMasterListView();
      if (response?.length > 0) {
        const uniqueTodayOrder = response?.map((item: any) => ({
          EMPCODE: item?.EMPCODE,
          EmpName: item?.EmployeeName,
        }));
        const uniqueTodayOrderArray: EmployeeOrder[] = [{ EMPCODE: "", EmpName: "All" }, ...uniqueTodayOrder];
        setUserTypes(uniqueTodayOrderArray);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    FetchEmployeeDetails();
  }, []);

  const handleOrderListEdit = (item: OrderItemTypeTodayOrder) => {
    console.log("item", item.OrderID);
    setFormData({ orderId: item.OrderID.toString() });
    close(false);
  };

  const handleEditinInstant = (item: OrderItemTypeTodayOrder) => {
    sessionStorage.setItem("svrCode", item.OrderID.toString());
    const payload = {
      svrCode: item.SvrCode,
      orderID: item.OrderID,
    };
    sessionStorage.setItem("checkoutData", JSON.stringify(payload));
    router.push("/instant-bill");
    setButtonSubmit(true);
  };

  const filteredData = data
    .filter((item) => {
      if (activeTab === "cancelled") return item.IsDropped === true;
      if (item.IsDropped === true) return false;
      if (activeTab === "pending") return item.SvrCode === 0;
      if (activeTab === "billed") return item.SvrCode > 0;

      return true;
    })
    .filter((item) => {
      // Additional filter for employee
      return session.data?.user.role === "admin" ? selectedEmployeeCode === "" || item.UserCode === selectedEmployeeCode : true;
    });

  const sortedData = [...filteredData].sort((a, b) => b.OrderID - a.OrderID);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [sortedData]);

  const summary = data.reduce(
    (acc, item) => {
      const amt = item.NetAmount || 0;

      if (item.IsDropped) acc.cancelled += amt;
      else if (item.SvrCode === 0) acc.pending += amt;
      else if (item.SvrCode > 0) acc.billed += amt;

      acc.total += amt;
      return acc;
    },
    { cancelled: 0, pending: 0, billed: 0, total: 0 }
  );

  return (
    <div>
      <div className="flex w-full flex-col md:flex-row justify-center items-center gap-4 mt-2">
        {/* Tabs */}
        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          {["all", "pending", "billed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                handleRefresh();
                setActiveTab(tab as "all" | "pending" | "billed" | "cancelled");
              }}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeTab === tab ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Admin-only employee dropdown */}
        {session.data?.user.role === "admin" && (
          <select
            value={selectedEmployeeCode}
            onChange={(e) => setSelectedEmployeeCode(e.target.value)}
            className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm shadow"
          >
            {userTypes.map((emp) => (
              <option key={emp.EMPCODE} value={emp.EMPCODE}>
                {emp.EmpName}-<small>{emp.EMPCODE}</small>
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="h-full min-w-full w-full flex justify-center">
        <div className="p-3 w-full">
          <div ref={scrollContainerRef} className="grid md:hidden grid-cols-1 gap-3 max-h-[30rem] overflow-auto w-full">
            {sortedData.map((item, ind) => (
              <div
                key={ind}
                className="bg-gradient-to-tr from-amber-100 via-orange-100 to-yellow-100 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="p-4">
                  <h4 className="text-xl font-bold text-gray-800">Order No: {item.OrderNo}</h4>
                  <p className="text-gray-600 mt-1">👤 Cust Name: {item.PartyName}</p>
                  <p className="text-gray-600">👔 User Code: {item.UserCode}</p>
                  <p className="text-gray-600">
                    📅 Date: {item.OrderDateStr}
                    {activeTab === "pending" && (
                      <span className="text-gray-500">
                        &nbsp;
                        <ElapsedTimeDisplay entryTimeStr={item.EntryDateTimeStr} />
                      </span>
                    )}
                  </p>
                  <p className="text-gray-600">💺 Seats: {item.SeatNos}</p>
                  <p className="text-gray-600">📍 Counter: {item.Counter}</p>
                  <p className="text-gray-800 font-bold">💵 Amount: {item.NetAmount}</p>

                  <div className="flex justify-evenly mt-3">
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-2 text-sm font-medium"
                      onClick={() => handleView(item.OrderID)}
                    >
                      👁️ View
                    </button>
                    <button
                      className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-3 py-2 text-sm font-medium"
                      onClick={() => (pathname === "/cash-counter" ? handleEditinInstant(item) : handleOrderListEdit(item))}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-3 py-2 text-sm font-medium"
                      onClick={() => handlePrintOrder(item.OrderID.toString())}
                    >
                      🖨️ Print
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="bg-slate-100 w-full hidden md:block max-h-96 shadow overflow-auto sm:rounded-lg">
            <table className="divide-gray-200 table overflow-x-visible">
              <thead className="bg-sky-500 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Order No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Seat Nos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Counter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Select</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">View</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Print</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((item, ind) => {
                  return (
                    <tr key={ind}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.OrderNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.PartyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.UserCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.OrderDateStr}
                        {activeTab === "pending" && <ElapsedTimeDisplay entryTimeStr={item.EntryDateTimeStr} />}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.SeatNos}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Counter}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.NetAmount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="mt-4 px-4 py-2 bg-error rounded"
                          onClick={() => {
                            if (pathname === "/cash-counter") {
                              handleEditinInstant(item);
                            } else {
                              handleOrderListEdit(item);
                            }
                          }}
                        >
                          {pathname === "/cash-counter" ? "Make Bill" : "Edit"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="mt-4 px-4 py-2 bg-error rounded"
                          onClick={() => {
                            handleView(item.OrderID);
                          }}
                        >
                          View
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="mt-4 px-4 py-2 bg-error rounded"
                          onClick={() => {
                            handlePrintOrder(item.OrderID.toString());
                          }}
                        >
                          Print
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <table className="min-w-full mt-4 border border-gray-300 text-sm text-gray-900">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Cancelled</th>
            <th className="px-4 py-2 border">Pending</th>
            <th className="px-4 py-2 border">Billed</th>
            <th className="px-4 py-2 border">Grand Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-2 border">₹{summary.cancelled.toFixed(2)}</td>
            <td className="px-4 py-2 border">₹{summary.pending.toFixed(2)}</td>
            <td className="px-4 py-2 border">₹{summary.billed.toFixed(2)}</td>
            <td className="px-4 py-2 border font-semibold">₹{summary.total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {/* Close Button */}
      <div className="flex justify-end mt-4">
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" onClick={() => close(false)}>
          Close
        </button>
      </div>
    </div>
  );
};

export default OrderList;
