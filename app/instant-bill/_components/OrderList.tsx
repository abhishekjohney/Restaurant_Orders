import { OrderItemTypeTodayOrder } from "@/types";
import React, { Dispatch, SetStateAction, useState } from "react";
import ElapsedTimeDisplay from "./ElapsedTimeDisplay";

interface Props {
  data: OrderItemTypeTodayOrder[];
  close: Dispatch<SetStateAction<boolean>>;
  setFormData: React.Dispatch<React.SetStateAction<{ orderId: string }>>;
  handleMOP?: (id: number, which: string) => void;
}

const OrderList: React.FC<Props> = ({ data, close, setFormData }) => {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "billed" | "cancelled">("pending");

  const handleOrderListEdit = (item: OrderItemTypeTodayOrder) => {
    setFormData({ orderId: item.OrderID.toString() });
    close(false);
  };

  const handleItem = (item: OrderItemTypeTodayOrder) => {
    setFormData({ orderId: item.OrderID.toString() });
    close(false);
  };

  const filteredData = data.filter((item) => {
    if (activeTab === "cancelled") return item.IsDropped === true;
    if (item.IsDropped === true) return false;
    if (activeTab === "pending") return item.SvrCode === 0;
    if (activeTab === "billed") return item.SvrCode > 0;
    return true; // for "all"
  });

  const sortedData = [...filteredData].sort((a, b) => b.OrderID - a.OrderID);

  return (
    <div>
      {/* Tabs */}
      {/* Tabs - Styled like the image */}
      <div className="">
        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          {["all", "pending", "billed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "all" | "pending" | "billed" | "cancelled")}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeTab === tab ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile View */}
      <div className="h-auto w-full flex justify-center">
        <div className="p-3">
          <div className="grid md:hidden grid-cols-1 gap-6 px-2 sm:grid-cols-2 max-h-[32rem] overflow-auto lg:grid-cols-1">
            {sortedData.map((item, ind) => {
              return (
                <div
                  key={ind}
                  className="bg-gradient-to-tr from-indigo-400 via-sky-300 to-blue-200 shadow-md rounded-lg overflow-hidden"
                  style={{ boxShadow: "5px 5px 0px 2px rgba(173, 216, 230, 0.9)" }}
                >
                  <div className="p-4">
                    <h4 className="text-lg font-semibold mb-2">Order No: {item.OrderNo}</h4>
                    <p className="text-warning-content mb-2">User Code: {item.UserCode}</p>
                    <p className="text-warning-content mb-2">
                      Date: {item.OrderDateStr}
                      {activeTab === "pending" && <ElapsedTimeDisplay entryTimeStr={item.EntryDateTimeStr} />}
                    </p>

                    <p className="text-warning-content mb-2">Seat Nos: {item.SeatNos}</p>
                    <p className="text-warning-content mb-2">Amount: {item.NetAmount}</p>

                    <div className="flex justify-between">
                      <button className="bg-error rounded px-3 py-2 mb-2" onClick={() => handleOrderListEdit(item)}>
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="bg-slate-100 w-full hidden md:block max-h-96 shadow overflow-auto sm:rounded-lg">
            <table className="divide-gray-200 table overflow-x-visible">
              <thead className="bg-sky-500 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Order No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Seat Nos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Select</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">MOP</th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((item, ind) => {
                  return (
                    <tr key={ind}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.OrderNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.UserCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.OrderDateStr}
                        {activeTab === "pending" && <ElapsedTimeDisplay entryTimeStr={item.EntryDateTimeStr} />}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.SeatNos}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.NetAmount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="mt-4 px-4 py-2 bg-error rounded" onClick={() => handleOrderListEdit(item)}>
                          View
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
