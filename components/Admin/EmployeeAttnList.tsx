// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { ListApi } from "@/app/utils/api";
import { useSession } from "next-auth/react";

function EmployeeAttnList({ EmpAutoid, Month }) {
    const listAPI = new ListApi();
    const [attnList, setAttnList] = useState([]);

    const session = useSession();

    const currentDate = new Date();
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const currentMonthName = monthNames[currentDate.getMonth()];

    useEffect(() => {
        const fetchData = async () => {
            if (session.data?.user.role === "admin") {
                try {
                    const storedUserYear = localStorage.getItem("UserYear");

                    if (Month) {
                        if (storedUserYear) {
                            const parts = storedUserYear.split("_");
                            const year = parts[1];

                            const response = await listAPI.getEmployeeAttListByCode(year, Month, EmpAutoid);

                            if (response) {
                                // Ensure responseData is an array before setting stockList
                                setAttnList(response);
                            }
                        }
                    } else {
                        if (storedUserYear) {
                            const parts = storedUserYear.split("_");
                            const year = parts[1];

                            const response = await listAPI.getEmployeeAttListByCode(year, currentMonthName, EmpAutoid);

                            if (response) {
                                // Ensure responseData is an array before setting stockList
                                setAttnList(response);
                            }
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        };
        fetchData();
    }, [session.data?.user.role, Month]);

    return (
        <>
            <div className="grid md:hidden mt-6 grid-cols-1 gap-6 px-2 max-h-96 overflow-y-auto sm:grid-cols-2 lg:grid-cols-1">
                {attnList &&
                    attnList.slice(1).map((listItem, index) => (
                        <div
                            key={index}
                            className="bg-blue-200 border border-blue-200 rounded-lg overflow-hidden"
                            style={{
                                boxShadow: "5px 5px 15px 10px rgba(173, 216, 230, 0.9)",
                            }}
                        >
                            <div className="p-4">
                                <p className="text-gray-700 text-lg font-bold mb-2">Date: {listItem.AttDateStr}</p>
                                <p
                                    className={`py-2 px-4 text-lg font-bold mb-2 text-white ${
                                        listItem.AttType1 === "P"
                                            ? "bg-green-500"
                                            : listItem.AttType1 === "Ab"
                                            ? "bg-red-500"
                                            : ""
                                    }`}
                                >
                                    {listItem.AttType1}
                                </p>
                                <p className="text-gray-700 text-lg font-bold mb-2">Days: {listItem.AttValue}</p>
                                <p className="text-gray-700 text-lg font-bold mb-2">Amount: {listItem.AttAmt}</p>
                                <p className="text-gray-700 text-lg font-bold mb-2">Payment: {listItem.PayAdvAmt}</p>
                                <p
                                    className={`py-2 px-4 text-white ${
                                        listItem.BalAmt > 0 ? "bg-green-500" : "bg-red-500"
                                    }`}
                                >
                                    Balance:{listItem.BalAmt}{" "}
                                </p>
                                <p className="text-gray-700 text-lg font-bold mb-2">PayRemarks :{listItem.PayRemarks}</p>
                            </div>
                        </div>
                    ))}
            </div>
            <div className="hidden md:block lg:block overflow-x-auto ">
                <div className=" h-96 w-full overflow-scroll  bg-gray-100">
                    <table className="bg-white table rounded-lg shadow-md">
                        <thead className="bg-primary">
                            <tr>
                                <th className="py-2 px-4 text-left text-warning-content">Date</th>
                                <th className="py-2 px-4 text-left text-warning-content">Type</th>
                                <th className="py-2 px-4 text-left text-warning-content">Days</th>
                                <th className="py-2 px-4 text-left text-warning-content">Amount</th>
                                <th className="py-2 px-4 text-left text-warning-content">Payment</th>
                                <th className="py-2 px-4 text-left text-warning-content">Balance</th>
                                <th className="py-2 px-4 text-left text-warning-content">PayRemarks</th>
                            </tr>
                        </thead>
                        {/* Table body */}
                        <tbody>
                            {attnList &&
                                attnList.slice(1).map((listItem, index) => (
                                    <tr key={index}>
                                        <td className="py-2 px-4">{listItem.AttDateStr}</td>
                                        <td
                                            className={`py-2 px-4 text-white ${
                                                listItem.AttType1 === "P"
                                                    ? "bg-green-500"
                                                    : listItem.AttType1 === "Ab"
                                                    ? "bg-red-500"
                                                    : ""
                                            }`}
                                        >
                                            {listItem.AttType1}
                                        </td>
                                        <td className="py-2 px-4">{listItem.AttValue}</td>
                                        <td className="py-2 px-4">{listItem.AttAmt}</td>
                                        <td className="py-2 px-4">{listItem.PayAdvAmt}</td>
                                        <td
                                            className={`py-2 px-4 text-white ${
                                                listItem.BalAmt > 0 ? "bg-green-500" : "bg-red-500"
                                            }`}
                                        >
                                            {listItem.BalAmt}
                                        </td>
                                        <td className="py-2 px-4">{listItem.PayRemarks}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default EmployeeAttnList;
