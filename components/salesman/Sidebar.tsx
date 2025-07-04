"use client";

import Link from "next/link";
import { AiOutlineStock, AiOutlineUser, AiOutlineCalendar, AiOutlineOrderedList } from "react-icons/ai";
import { useSession } from "next-auth/react";
import { RxDashboard } from "react-icons/rx";
import { FaRoute } from "react-icons/fa";

export const Sidebar = () => {
    const session = useSession();

    return (
        <>
            <div className="flex-none">
                <label htmlFor="my-drawer-3" aria-label="open sidebar" className="btn btn-square btn-ghost ">
                    <svg
                        width="45"
                        height="45"
                        viewBox="0 0 48 48"
                        fill="#fff"
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline-block w-6 h-6 stroke-current text-white"
                    >
                        <path d="M14 14L34 34" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 34L34 14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </label>
            </div>

            {session?.data?.user?.role === "admin" ? (
                <Link className="text-white p-2 duration-100 transition relative right-15 my-2" href={`/dashboard`}>
                    <div className="flex items-center  py-2 rounded-md  ">
                        <RxDashboard className="inline-block mr-2 text-3xl" />
                        <span className="ml-2 text-md">Dashboard</span>
                    </div>
                </Link>
            ) : (
                <Link
                    className="text-white p-2 duration-100 transition relative right-15 my-2"
                    href={`/userorderdashboard`}
                >
                    <div className="flex items-center  py-2 rounded-md  ">
                        <RxDashboard className="inline-block mr-2 text-3xl" />
                        <span className="ml-2 text-md">Dashboard</span>
                    </div>
                </Link>
            )}

            <Link href={`/dashboard/currentMonth`} className="space-x-5 py-2 px-2">
                <div className="flex items-center  py-2 rounded-md  transition duration-300">
                    <AiOutlineCalendar className="inline-block mr-2 text-3xl" />
                    <span className="ml-2 text-md">Current Month</span>
                </div>
            </Link>

            <Link href={`/todaysOrders`} className="space-x-5 py-2 px-2 mt-2">
                <div className="flex items-center  py-2 rounded-md  transition duration-300">
                    <AiOutlineOrderedList className="inline-block mr-2 text-3xl" />
                    <span className="ml-2 text-md">Today's Orders</span>
                </div>
            </Link>

            <Link href={`/dashboard/monthlyOrders`} className="space-x-5 py-2 px-2 mt-2">
                <div className="flex items-center  py-2 rounded-md  transition duration-300">
                    <AiOutlineCalendar className="inline-block mr-2 text-3xl" />
                    <span className="ml-2 text-md">Monthly Orders</span>
                </div>
            </Link>
            {session?.data?.user?.role === "admin" && (
                <Link href={`/dashboard/usersOrder`} className="space-x-5 py-2 px-2 mt-2">
                    <div className="flex items-center  py-2 rounded-md  transition duration-300">
                        <AiOutlineCalendar className="inline-block mr-2 text-3xl" />
                        <span className="ml-2 text-md">User's Orders</span>
                    </div>
                </Link>
            )}

            <Link href={`/dashboard/stockList`} className="space-x-5 py-2 px-2 mt-2">
                <div className="flex items-center  py-2 rounded-md  transition duration-300">
                    <AiOutlineStock className="inline-block mr-2 text-3xl" />
                    <span className="ml-2 text-md">Stock List</span>
                </div>
            </Link>

            {/* {isOpen && <CustomModal children={<RouteChangeForm />} title="Update Route"></CustomModal>} */}
            {/* <Link href={`/changeRoute`} className="space-x-5 py-2 px-2 mt-2">
                <div className="flex items-center  py-2 rounded-md  transition duration-300">
                    <FaRoute className="inline-block mr-2 text-3xl" />
                    <span className="ml-2 text-md">Change route</span>
                </div>
            </Link> */}

            <Link href={`/dashboard/partyList`} className="space-x-5 py-2 px-2 mt-2">
                <div className="flex items-center  py-2 rounded-md  transition duration-300">
                    <AiOutlineUser className="inline-block mr-2 text-3xl" />
                    <span className="ml-2 text-md">Party List</span>
                </div>
            </Link>
        </>
    );
};
