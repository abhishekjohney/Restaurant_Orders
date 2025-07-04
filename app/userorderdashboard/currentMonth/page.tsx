"use client";
import { Sidebar } from "@/components/salesman/Sidebar";
import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ListApi } from "@/app/utils/api";
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
const CurrentMonth = async () => {
    const listAPI = new ListApi();
    const [currentMonthList, setCurrentMonthList] = useState<DailyData[]>([]);

    const session = useSession();
    const searchParams = useSearchParams();

    const MonthVal = searchParams.get("month");

    useEffect(() => {
        const fetchData = async () => {
            const month = MonthVal !== undefined && MonthVal !== null ? `${MonthVal}` : "CURMNTH";
            if (session?.data?.user?.role === "admin") {
                const data = await listAPI.getMonthyOrders(month,"");
                setCurrentMonthList(data);
            } else {
                const data = await listAPI.getMonthyOrders(month, session?.data?.user?.name as string);
                setCurrentMonthList(data);
            }
        };

        fetchData();
    }, [session.data?.user.name, searchParams, MonthVal]);

    return (
        <div className=" bg-slate-100 min-h-screen shadow-md flex items-start justify-center">
            <div className="w-full md:mt-20 mt-24 lg:mt-0 lg:w-4/5 p-4 md:p-6">
                <BackButton />
                {session.data?.user?.name === "SADMIN" ? (
                    <h3 className="md:text-3xl text-xl font-semibold">Current Month Orders of All Staff</h3>
                ) : (
                    <h3 className="md:text-3xl text-xl font-semibold">
                        Current Month Orders of {session?.data?.user?.name}
                    </h3>
                )}

                <div className="grid md:hidden mt-12 grid-cols-1 gap-6  sm:grid-cols-2 lg:grid-cols-1 px-2 max-h-[30rem] overflow-y-auto">
                    {/* Card representation for smaller screens */}
                    {currentMonthList &&
                        currentMonthList.map((item, index) => (
                            <div
                                key={item.DayMntid}
                                className=" bg-blue-200 border border-blue-200 shadow-md rounded-lg overflow-hidden"
                                style={{
                                    boxShadow: "5px 5px 0px 2px rgba(173, 216, 230, 0.9)",
                                }}
                            >
                                <div className="p-4">
                                    <h4 className="text-lg font-semibold mb-2">{item.DayMntName}</h4>
                                    <p className=" text-warning-content mb-2">Date: {item.WeekDay}</p>
                                    <p className=" text-warning-content mb-2">Order Amount: {item.OrderAmount}</p>
                                    <p className="text-warning-content mb-2">Order Count: {item.OrderCount}</p>
                                    <p className=" text-warning-content mb-2">
                                        <Link
                                            className="text-sm bg-success p-2 rounded"
                                            href={`/userorderdashboard/todaysOrders?date=${
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
                <div className=" hidden md:block bg-white shadow  sm:rounded-lg mt-6 overflow-auto customHeight">
                    <table className="min-w-full table divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                    #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                    Month
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                    Date
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
                                                className="text-sm bg-info p-2 rounded"
                                                href={`/userorderdashboard/todaysOrders?date=${
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
