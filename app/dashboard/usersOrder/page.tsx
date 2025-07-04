"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ListApi } from "@/app/utils/api";
import BackButton from "@/components/BackButton";

const UsersOrderpage = () => {
    type DayMntData = {
        DayMntName: string;
        DayMntid: string;
        OrderAmount: string;
        OrderCount: string;
        Rcdid: string;
        WeekDay: string | null;
        YearName: string;
    };

    const userData = [
        { userType: "SADMIN", orders: 10, totalAmount: 1500 },
        { userType: "SM001", orders: 5, totalAmount: 800 },
        { userType: "SM002", orders: 8, totalAmount: 1200 },
        { userType: "SM003", orders: 12, totalAmount: 1800 },
        { userType: "SM001", orders: 5, totalAmount: 800 },
        { userType: "SM002", orders: 8, totalAmount: 1200 },
        { userType: "SM003", orders: 12, totalAmount: 1800 },
    ];

    const listAPI = new ListApi();
    const session = useSession();
    const [userDataList, setUserDataList] = useState<DayMntData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const storedUserYear = localStorage.getItem("UserYear") ?? "2023";
            const parts = storedUserYear.split("_");

            // Extract the year part (assuming it's the second part)
            const year = parts[1];

            try {
                const response = await listAPI.getusersorder(session.data?.user.role, year);

                if (response) {
                    console.log("RESPONSE DATA", response);
                    setUserDataList(response);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    const encryptValue = (value: string) => {
        // Encode the value using btoa
        const base64Encoded = btoa(value);

        // Ensure it is a valid base64-encoded string
        const urlSafeEncoded = base64Encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

        return urlSafeEncoded;
    };

    // "title":'GetUsewiseOrderListJason',
    // "description":'User Wise Order Status',
    // "ReqUserID": "",
    // "ReqUserTypeID":globals.ActiveUserTypeID,
    // "ReqYear":globals.ActiveAcastart,

    const indexColors = ["#ff0000", "#00ff00", "#0000ff", "#ff00ff"];

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto py-6 md:px-6 lg:px-8 xl:px-10 md:mt-3 mt-28 lg:mt-12">
                <BackButton />
                <div className="flex md:flex-row flex-col justify-between items-center">
                    <h1 className="text-xl md:text-xl  lg:text-2xl font-bold text-gray-800">Users Order</h1>
                    <div className="md:mb-2">
                        <input
                            type="text"
                            placeholder="Search by Item Name"
                            className="w-full px-4 py-2 rounded-md border mt-3 border-gray-300 focus:outline-none focus:border-blue-400"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-8 lg:grid-cols-4 gap-4  place-items-center">
                    {userDataList &&
                        userDataList.map((user, index) => (
                            <Link
                                href={`/userorderdashboard/${encryptValue(user.DayMntName)}`}
                                key={index}
                                className="flex transition duration-300 ease-in-out transform hover:scale-105 bg-white p-4 rounded-lg items-center shadow-md"
                            >
                                <div
                                    className="w-4 h-4 rounded-full mr-2"
                                    style={{ backgroundColor: indexColors[index % indexColors.length] }}
                                />
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 text-indigo-700">{user.DayMntName}</h3>
                                    <p className="text-gray-600">No. of Orders: {user.OrderCount}</p>
                                    <p className="text-gray-600">Total Amount: {user.OrderAmount}</p>
                                </div>
                            </Link>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default UsersOrderpage;
