"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/salesman/Sidebar";
import { signIn, signOut, useSession } from "next-auth/react";
import MonthWise from "../../../public/images/monthwise.png";
import CurrentMonth from "../../../public/images/month.png";
import TodaysOrder from "../../../public/images/today.png";
import expense from '../../../public/images/svg/expense.svg'
import todayImage from "../../../public/images/today.png";
import Image from "next/image";

const SalesmanPage = ({ params }: { params: { userid: string } }) => {
  const lists = [
    {
      name: "Order Monthwise list",
      icon: MonthWise,
      redirect: "/userorderdashboard/monthlyOrders",
    },
    {
      name: "Current Month orders",
      icon: CurrentMonth,
      redirect: "/userorderdashboard/currentMonth",
    },
    {
      name: "Todays Orders",
      icon: TodaysOrder,
      redirect: "/userorderdashboard/todaysOrders",
    },
    {
      name: "Todays Payment",
      icon: todayImage,
      redirect: "/userorderdashboard/todaysPayment",
  },
    {
      name: "Todays Expense",
      icon: expense,
      redirect: "/userorderdashboard/todaysExpense",
  },
  ];

  const session = useSession();

  const listsToShow = lists.filter(
    (item) =>
      session.data?.user.role === "salesman" || item.name !== "Users Order"
  );

  return (
    <div className=" flex min-h-screen ">
      {session.data?.user.role === "admin" ? (
        <h1 className="font-semibold text-xl  ml-16 mt-8 text-red-500  ">
          Admin Dashboard
        </h1>
      ) : (
        <h1 className="font-semibold text-center ml-16  mt-20 text-red-500 ">
          Salesman {session.data?.user.name} Dashboard
        </h1>
      )}
      {/*         
           <h3>{params.userid}</h3> */}

      <div className="w-full absolute right-0 top-24 md:w-3/5 lg:w-4/5 xl:w-4/5 p-4 md:p-6 lg:p-8 xl:p-10">
        <div className="w-full flex flex-row flex-wrap gap-5  justify-center">
          {listsToShow.map((item) => {
            return (
              <>
                <Link
                  href={`${item.redirect}/${params.userid}`}
                  className="card w-36 px-3 transition duration-300 ease-in-out transform hover:scale-105  py-6 flex flex-col justify-center items-center  md:w-48 bg-base-100 shadow-xl border"
                >
                  <Image
                    src={item.icon}
                    alt="list-icon"
                    className="rounded-xl h-20 w-20"
                  />

                  <div className="items-center text-center">
                    <h4 className="text-sm font-semibold mt-2">{item.name}</h4>

                    {/* <div className="card-actions">
                                  <button className="btn btn-primary">
                                      Buy Now
                                  </button>
                              </div> */}
                  </div>
                </Link>
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default SalesmanPage;
