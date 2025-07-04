"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ListApi, UpdateAPI } from "@/app/utils/api";
import BackButton from "@/components/BackButton";
import { Spinner } from "@/components/Spinner";

const MonthlyOrders = async () => {
    const listAPI = new ListApi();
    const updateAPI = new UpdateAPI();
    const [loading, setLoading] = useState(true);
    const [monthlyList, setMonthlyList] = useState<MonthlyOrder[]>([]);
    const [filteredMonthlyList, setFilteredMonthlyList] = useState<MonthlyOrder[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const session = useSession();

    type MonthlyOrder = {
        DayMntName: string;
        DayMntid: string;
        OrderAmount: string;
        OrderCount: string;
        Rcdid: string;
        WeekDay: null; // Assuming WeekDay can be null
        YearName: string;
    };

    const fetchData = async () => {
        setLoading(true);
        if (session.data?.user.role === "admin") {
            try {
                const storedUserYear = localStorage.getItem("UserYear");
                if (storedUserYear) {
                    console.log("admin");
                    const parts = storedUserYear.split("_");
                    const year = parts[1];
                    const response = await listAPI.getMonthlyOder();

                    if (response) {
                        setMonthlyList(response);
                        setLoading(false);
                    }
                    setLoading(false);
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            try {
                const storedUserYear = localStorage.getItem("UserYear");
                if (storedUserYear) {
                    console.log("staff");
                    const parts = storedUserYear.split("_");
                    const year = parts[1];
                    const response = await fetch("/api/getmonthlyorder", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            title: "GetMonthlyOrderListJason",
                            description: "",
                            ReqYear: year,
                            ReqUserID: session.data?.user.name,
                            ReqUserTypeID: "",
                        }),
                    });

                    if (response.ok) {
                        const responseData = await response.json();
                        setMonthlyList(responseData.userdata);
                        setLoading(false);
                    }
                    setLoading(false);
                }
            } catch (error) {
                console.error(error);
            }
        }
    };
    useEffect(() => {
        fetchData();
    }, [session.data?.user.role]);

    useEffect(() => {
        const filteredPartyList = monthlyList.filter((item) =>
            item.DayMntName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filteredPartyList?.length > 0) {
            setFilteredMonthlyList(filteredPartyList);
        }
    }, [monthlyList, searchTerm]);

    return (
        <div className=" bg-slate-100 min-h-auto h-screen lg:pt-0 pt-24 shadow-md flex items-start justify-center">
            <div className="w-full lg:w-4/5 p-4 md:p-6">
                {loading && <Spinner />}
                <div className="flex flex-row  justify-between">
                    <BackButton />
                    <div>
                        <input
                            type="text"
                            placeholder="Search by Item Name"
                            className="w-full px-4 py-2 rounded-md input-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid md:hidden mt-6 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 max-h-[30rem] lg:max-h-96 overflow-y-auto ">
                    {/* Card representation for smaller screens */}
                    {filteredMonthlyList.length > 0 &&
                        filteredMonthlyList.map((item, index) => (
                            <div
                                key={item.DayMntName}
                                className="bg-blue-200 border border-blue-200 shadow-md rounded-lg overflow-hidden"
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
                                            className="text-sm text-white bg-info p-2 rounded"
                                            href={`/dashboard/currentMonth?month=${index + 1}`}
                                        >
                                            View
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        ))}
                </div>

                <div className="hidden md:block lg:block mt-6">
                    <div className="bg-white shadow  sm:rounded-lg overflow-auto max-h-[30rem] h-auto">
                        <table className="min-w-full table border-collapse border divide-y divide-gray-200">
                            <thead className="bg-primary sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-warning-content uppercase tracking-wider">
                                        Month
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-warning-content uppercase tracking-wider">
                                        Order Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-warning-content uppercase tracking-wider">
                                        Order Count
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-warning-content uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredMonthlyList.length > 0 &&
                                    filteredMonthlyList.map((item, index) => (
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
                                                    className="text-sm rounded-md btn btn-primary"
                                                    href={`/dashboard/currentMonth?month=${index + 1}`}
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
