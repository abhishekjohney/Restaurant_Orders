"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export const MainNav = () => {
    const [show, setShow] = useState(false);

    const session = useSession();

    return (
        <>
            <div className="navbar bg-base-100 md:px-16 px-6  shadow-md mx-auto lg:relative fixed top-0 w-full z-20">
                <div className="flex-none lg:hidden">
                    <label htmlFor="my-drawer-3" aria-label="open sidebar" className="btn btn-square btn-ghost">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="inline-block w-6 h-6 stroke-current"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            ></path>
                        </svg>
                    </label>
                </div>
                <div className="navbar-start cursor-pointer">
                    <img
                        src="https://www.360webdesigns.com/wp-content/uploads/2016/07/Services_ECommerce_v2-01.png"
                        className="h-16 w-16 p-1 md:block hidden bg-white"
                    />
                    {session?.data?.user?.role === "admin" ? (
                        <>
                            <a href={`/dashboard`} className="btn btn-ghost md:text-xl text-md">
                                Cloud Commerce
                            </a>
                        </>
                    ) : (
                        <>
                            <a href={`/userorderdashboard`} className="btn btn-ghost md:text-xl text-md">
                                Cloud Commerce
                            </a>
                        </>
                    )}
                </div>
                <div className="navbar-center hidden lg:flex">
                    <ul className="menu menu-horizontal px-1">
                        <li>
                            <a>Home</a>
                        </li>
                        <li>
                            <a>About</a>
                        </li>
                        <li>
                            <a>Products</a>
                        </li>
                    </ul>
                </div>
                <div className="navbar-end">
                    {session.data?.user ? (
                        <div className="md:flex items-center space-x-4">
                            <div>
                                <p className="text-xs md:text-base">{session.data?.user.name}</p>
                                <p className="text-xs md:text-base">Salesman</p>
                            </div>
                            <div onClick={() => setShow(!show)} className="avatar">
                                <div className="w-10 rounded-full">
                                    <img src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button className="bg-blue-500 px-3 py-2 rounded-md  text-white" onClick={() => signIn()}>
                            Login
                        </button>
                    )}
                </div>

                {show && (
                    <div className="fixed rounded-md right-8 top-14  items-center justify-center  px-5 py-3 text-white  bg-slate-700 shadow-md ">
                        <ul className="flex  items-center flex-col">
                            <button className="text-sm hover:bg-white hover:text-black p-1.5 rounded-md ">Profile</button>
                            <button
                                className="text-sm hover:bg-white hover:text-black p-1.5 rounded-md"
                                onClick={() => signOut()}
                            >
                                Logout
                            </button>
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
};
