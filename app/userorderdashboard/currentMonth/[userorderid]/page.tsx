"use client";
import { Sidebar } from "@/components/salesman/Sidebar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/BackButton";
type DailyData = {
    DayMntName: string;
    DayMntid: string;
    OrderAmount: string;
    OrderCount: string;
    Rcdid: string;
    WeekDay: string | null; // Update type to string or null
    YearName: string;
};
const CurrentMonth = async ({ params }: { params: { userorderid: string } }) => {
    const router = useRouter();

    const [currentMonthList, setCurrentMonthList] = useState<DailyData[]>([]);
    const [userdata, setUserData] = useState("");

    const searchParams = useSearchParams();

    const MonthVal = searchParams.get("month");

    useEffect(() => {
        const decryptedUserOrderId = atob(params.userorderid);

        setUserData(decryptedUserOrderId);

        const fetchData = async () => {
            try {
                const storedUserYear = localStorage.getItem("UserYear");
                if (storedUserYear) {
                    const parts = storedUserYear.split("_");
                    const year = parts[1];
                    const response = await fetch("/api/getcurrentmonth", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            title: "GetMonthlyDailyOrderListJason",
                            description: "Monthwise Order Status admin",
                            ReqMntid: MonthVal !== undefined && MonthVal !== null ? `${MonthVal}` : "CURMNTH",
                            ReqUserID: decryptedUserOrderId,
                            ReqUserTypeID: "",
                            ReqYear: year,
                        }),
                    });

                    if (response.ok) {
                        // Handle the response data here
                        const responseData = await response.json();
                        // Ensure responseData is an array before setting stockList
                        setCurrentMonthList(responseData.userdata);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [params.userorderid, searchParams, MonthVal]);

    return (
        <div className=" bg-slate-100 min-h-screen mt-28  lg:mt-0  shadow-md flex items-center justify-center">
            <div className="w-full md:w-3/5 lg:w-4/5 xl:w-4/5 p-4 md:p-6 lg:p-8 xl:p-10">
                <BackButton />
                <h3 className="text-3xl font-semibold mb-6">Current Month Orders of {userdata}</h3>

                <div className="grid md:hidden mt-6 grid-cols-1 gap-6 sm:grid-cols-2 px-2 max-h-[40rem] overflow-y-auto lg:grid-cols-1">
                    {/* Card representation for smaller screens */}
                    {currentMonthList &&
                        currentMonthList.map((item, index) => (
                            <div
                                key={item.DayMntid}
                                className="bg-blue-200  border border-blue-200 shadow-md rounded-lg overflow-hidden"
                                style={{
                                    boxShadow: "5px 5px 0px 2px rgba(173, 216, 230, 0.9)",
                                }}
                            >
                                <div className="p-4">
                                    <h4 className="text-lg font-semibold mb-2">{item.DayMntName}</h4>
                                    <p className="text-gray-700 mb-2">Date: {item.WeekDay}</p>
                                    <p className="text-gray-700 mb-2">Order Amount: {item.OrderAmount}</p>
                                    <p className="text-gray-700 mb-2">Order Count: {item.OrderCount}</p>
                                    <p className="text-gray-700 mb-2">
                                        <Link
                                            className="text-sm text-white btn btn-primary p-2 rounded"
                                            href={`/userorderdashboard/todaysOrders/${params.userorderid}?date=${
                                                item.WeekDay ? item.WeekDay.split(" ")[0] : ""
                                            }`}
                                        >
                                            View
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        ))}
                </div>

                <div className="hidden md:block  bg-white shadow sm:rounded-lg overflow-auto customHeight">
                    <table className="min-w-full table divide-y divide-gray-200">
                        <thead className="bg-primary">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-primary-content uppercase tracking-wider">
                                    #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-primary-content uppercase tracking-wider">
                                    Month
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-primary-content uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-primary-content uppercase tracking-wider">
                                    Order Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-primary-content uppercase tracking-wider">
                                    Order Count
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-primary-content uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentMonthList &&
                                currentMonthList.map((day, index) => (
                                    <tr key={day.DayMntid}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{index + 1}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{day.DayMntName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{day.WeekDay}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{day.OrderAmount}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{day.OrderCount}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                className="text-sm text-white btn btn-primary p-2 rounded"
                                                href={`/userorderdashboard/todaysOrders/${params.userorderid}?date=${
                                                    day.WeekDay ? day.WeekDay.split(" ")[0] : ""
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
    );
};

export default CurrentMonth;
