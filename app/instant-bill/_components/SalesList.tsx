import { SalesListInterface } from "@/types";
import { useSession } from "next-auth/react";
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

interface Props {
  data: SalesListInterface[];
  close: Dispatch<SetStateAction<boolean>>;
  setPrintInvoiceId: React.Dispatch<React.SetStateAction<number>>;
  handleMOP: (id: number, which: string) => void;
  fetchDataCurrSales: () => void;
  startDate: string;
  endDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
  handleView: (id: string) => void;
}

const SaleList: React.FC<Props> = ({
  data,
  close,
  setPrintInvoiceId,
  handleMOP,
  fetchDataCurrSales,
  startDate,
  endDate,
  setEndDate,
  setStartDate,
  handleView,
}) => {
  const session = useSession();
  const [activeTab, setActiveTab] = useState<"Pending" | "Paid" | "All" | "Credit">("Pending");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = (item: SalesListInterface) => {
    setPrintInvoiceId(item.SvrCode);
    close(false);
  };

  const handleFilter = () => {
    fetchDataCurrSales();
  };

  // Filter based on tab
  const filteredData = data.filter((item) => {
    if (activeTab === "Pending") return item.PaymentStatus === "Pending";
    if (activeTab === "Paid") return item.PaymentStatus === "Paid";
    if (activeTab === "Credit") return item.PaymentStatus === "Credit";
    return true; // All
  });

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
  }, [filteredData]);

  const summary = filteredData.reduce(
    (acc, item) => {
      const amount = item.BillEstimateAmount || 0;
      const CashPay = item.CashPay || 0;
      const UPIPay = item.UPIPay || 0;
      const CreditPay = item.CreditPay || 0;

      if (item.PaymentStatus === "Pending") {
        acc.pending += amount;
      } else if (item.PaymentStatus === "Paid") {
        acc.cash += CashPay;
        acc.upi += UPIPay;
        acc.paid += amount;
      } else if (item.PaymentStatus === "Credit") {
        acc.credit += CreditPay;
        acc.cash += CashPay;
        acc.upi += UPIPay;
      }

      acc.total += amount;
      return acc;
    },
    { pending: 0, paid: 0, cash: 0, upi: 0, credit: 0, total: 0 }
  );

  return (
    <div>
      {/* Tabs */}
      <div className="flex justify-center mb-2">
        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          {["All", "Pending", "Paid", "Credit"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "Pending" | "Paid" | "All" | "Credit")}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeTab === tab ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Date Filters */}
      <div className="h-auto w-full flex justify-center flex-col gap-1">
        <div className="flex items-center gap-4 p-4 bg-white shadow-md rounded-xl max-w-md mx-auto">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm w-full"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm w-full"
          />
          <button onClick={handleFilter} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition">
            Filter
          </button>
        </div>

        <div className="mt-1">
          <table className="min-w-full mb-2 border border-gray-300 text-sm text-gray-900">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Pending</th>
                <th className="px-4 py-2 border">Cash Pay</th>
                <th className="px-4 py-2 border">UPI Pay</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border">₹{summary.pending.toFixed(2)}</td>
                <td className="px-4 py-2 border">₹{summary.cash.toFixed(2)}</td>
                <td className="px-4 py-2 border">₹{summary.upi.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="p-2">
          <div ref={scrollContainerRef} className="grid md:hidden grid-cols-1 sm:grid-cols-2 gap-6 p-3 max-h-[30rem] overflow-y-auto">
            {filteredData?.map((item, ind) => (
              <div
                key={ind}
                className="bg-gradient-to-tr from-indigo-100 via-sky-200 to-blue-300 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between"
              >
                <div className="p-5">
                  {session?.data?.user?.role === "admin" && (
                    <>
                      <h4 className="text-xl font-bold text-gray-800">Bill No: {item.billno}</h4>
                      <h5 className="text-lg font-semibold text-gray-700">Order No: {item.OrderNO}</h5>
                    </>
                  )}
                  <p className="text-gray-600 mt-1">👥 CMPRefNo: {item.CMPRefNo}</p>
                  <p className="text-gray-600 mt-1">👥 Party: {item.PartyName}</p>
                  <p className="text-gray-600">📅 Date: {item.BillDate.split("T")[0]}</p>
                  {item.ModeofTax !== "Estimate" && <p className="text-gray-600">💵 Tax: {item.ModeofTax}</p>}
                  <p className="text-gray-600">💳 Amount: ₹{item.BillEstimateAmount}</p>
                  <p className="text-gray-600">📋 Status: {item.PaymentStatus}</p>
                </div>

                <div className="flex flex-wrap justify-evenly items-center gap-2 p-4 bg-gray-50 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => handlePrint(item)}
                    className="bg-sky-500 hover:bg-sky-600 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center"
                  >
                    🖨️ Print
                  </button>
                  <button
                    type="button"
                    onClick={() => handleView(item.SvrCode.toString())}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center"
                  >
                    👁️ View
                  </button>
                  {item.PaymentStatus === "Pending" ? (
                    <button
                      type="button"
                      onClick={() => {
                        close(false);
                        handleMOP(item.SvrCode, "sale");
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center"
                    >
                      💳 MOP
                    </button>
                  ) : (
                    <span className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center">
                      ✅ Paid
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div ref={scrollContainerRef} className="bg-slate-100 w-full hidden md:block max-h-96  shadow overflow-auto  sm:rounded-lg">
            <table className=" divide-gray-200 table overflow-x-visible">
              <thead className="bg-sky-500 sticky top-0">
                <tr>
                  {session?.data?.user?.role === "admin" && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Bill No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Order No</th>
                    </>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">CMPRefNo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Party</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Tax</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Print</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">View</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">MOP</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData &&
                  filteredData?.map((item, ind) => {
                    return (
                      <tr key={ind}>
                        {session?.data?.user?.role === "admin" && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.billno}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.OrderNO}</div>
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.CMPRefNo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.PartyName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.BillDate.split("T")[0]}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.ModeofTax !== "Estimate" && <div className="text-sm text-gray-900">{item.ModeofTax}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.BillEstimateAmount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.PaymentStatus}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap ">
                          <button type="button" onClick={() => handlePrint(item)} className="px-4 py-2 bg-blue-500 rounded-md">
                            Print
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap ">
                          <button
                            onClick={() => {
                              handleView(item.SvrCode.toString());
                            }}
                            className="px-4 py-2 bg-blue-500 rounded-md"
                            type="button"
                          >
                            View
                          </button>
                        </td>
                        <td className="px-6 py-4  ">
                          {item.PaymentStatus === "Pending" ? (
                            <button
                              onClick={() => {
                                close(false);
                                handleMOP(item.SvrCode, "sale");
                              }}
                              className="px-4 py-2 bg-blue-500 text-white rounded-md"
                              type="button"
                            >
                              MOP
                            </button>
                          ) : (
                            <span className="flex justify-center items-center font-montserrat font-medium tracking-wide text-sm text-white bg-green-600 px-3 py-1 rounded cursor-default">
                              Paid
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        <table className="min-w-full border border-gray-300 text-sm text-gray-900">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Paid</th>
              <th className="px-4 py-2 border">Credit</th>
              <th className="px-4 py-2 border">Grand Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border">₹{summary.paid.toFixed(2)}</td>
              <td className="px-4 py-2 border">₹{summary.credit.toFixed(2)}</td>
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
    </div>
  );
};

export default SaleList;
