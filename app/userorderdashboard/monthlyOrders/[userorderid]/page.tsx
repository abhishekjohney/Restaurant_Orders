// @ts-nocheck
"use client";
import BackButton from "@/components/BackButton";
import { Sidebar } from "@/components/salesman/Sidebar";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import Link from "next/link";
import { useState, useEffect } from "react";

type MonthlyOrder = {
    DayMntName: string;
    DayMntid: string;
    OrderAmount: string;
    OrderCount: string;
    Rcdid: string;
    WeekDay: null; // Assuming WeekDay can be null
    YearName: string;
};
const MonthlyOrders = async ({ params }: { params: { userorderid: string } }) => {
    const [monthlyList, setMonthlyList] = useState<MonthlyOrder[]>([]);
    const [userdata, setUserData] = useState("");

    useEffect(() => {
        const decryptedUserOrderId = atob(params.userorderid);

        setUserData(decryptedUserOrderId);

        const fetchData = async () => {
            const storedUserYear = localStorage.getItem("UserYear");

            const parts = storedUserYear.split("_");

            // Extract the year part (assuming it's the second part)
            const year = parts[1];

            try {
                const response = await fetch("/api/getmonthlyorder", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title: "GetMonthlyOrderListJason",
                        description: "",
                        ReqYear: year,
                        ReqUserID: decryptedUserOrderId,
                        ReqUserTypeID: "",
                    }),
                });

                if (response.ok) {
                    const responseData = await response.json();

                    setMonthlyList(responseData.userdata);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [params.userorderid]);

    // console.log(data);
    return (
        <div className=" bg-slate-100 min-h-screen shadow-md flex items-center justify-center">
            <div className="w-full md:w-3/5 lg:w-4/5 xl:w-4/5 p-4 md:p-6 lg:p-8 xl:p-10">
                <BackButton />
                <div className="flex md:flex-row flex-col justify-between">
                    <h3 className="md:text-3xl mt-12 md:mt-8 text-xl font-semibold">Monthly Orders of {userdata}</h3>

                    <div className="md:mb-2">
                        <input
                            type="text"
                            placeholder="Search by Item Name"
                            className="w-full px-4 py-2 rounded-md mt-12 md:mt-16 border border-gray-300 focus:outline-none focus:border-blue-400"
                            // value={searchTerm}
                            // onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid md:hidden mt-6 grid-cols-1 gap-6 px-2 sm:grid-cols-2 max-h-[32rem] overflow-y-auto lg:grid-cols-1">
                    {/* Card representation for smaller screens */}
                    {monthlyList &&
                        monthlyList.map((item, index) => (
                            <div
                                key={item.DayMntName}
                                className="bg-blue-200  border border-blue-200 shadow-md rounded-lg overflow-hidden"
                                style={{
                                    boxShadow: "5px 5px 0px 2px rgba(173, 216, 230, 0.9)",
                                }}
                            >
                                <div className="p-4">
                                    <h4 className="text-lg font-semibold mb-2">{item.DayMntName}</h4>
                                    <p className="text-gray-700 mb-2">Order Amount: {item.OrderAmount}</p>
                                    <p className="text-gray-700 mb-2">Order Count: {item.OrderCount}</p>
                                    <p className="text-gray-700 mb-2">
                                        <Link
                                            className="text-sm text-white btn btn-primary rounded-md p-2"
                                            href={`/userorderdashboard/currentMonth/${params.userorderid}?month=${
                                                index + 1
                                            }`}
                                        >
                                            View
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        ))}
                </div>

                <div className="hidden md:block lg:block mt-6">
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <table className="min-w-full table border-collapse border divide-y divide-gray-200">
                            <thead className="bg-primary sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Month
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Order Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Order Count
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {monthlyList &&
                                    monthlyList.map((item, index) => (
                                        <tr key={item.DayMntName}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.DayMntName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.OrderAmount}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.OrderCount}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link
                                                    className="text-sm btn btn-primary p-2 rounded"
                                                    href={`/userorderdashboard/currentMonth/${params.userorderid}?month=${
                                                        index + 1
                                                    }`}
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyOrders;
