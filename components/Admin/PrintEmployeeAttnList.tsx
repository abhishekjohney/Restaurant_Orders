// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { ListApi } from "@/app/utils/api";
import { useSession } from "next-auth/react";

function PrintEmployeeAttnList({ EmpAutoid, Month, updated, year }) {
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
              const response = await listAPI.getEmployeeAttListByCode(year, Month, EmpAutoid);

              if (response) {
                // Ensure responseData is an array before setting stockList
                setAttnList(response);
              }
            }
          } else {
            if (storedUserYear) {
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
  }, [session.data?.user.role, Month, updated]);

  return (
    <>
      <div className="overflow-x-auto">
        <div className=" h-full w-full overflow-x-auto  bg-gray-100">
          <table className="bg-white table rounded-lg shadow-md">
            <thead className="bg-transparent">
              <tr>
                <th className="py-2 px-4 text-left sticky text-warning-content">Date</th>
                <th className="py-2 px-4 text-left text-warning-content">Type</th>
                <th className="py-2 px-4 text-left text-warning-content">Amount</th>
                <th className="py-2 px-4 text-left text-warning-content">Balance</th>
                <th className="py-2 px-4 text-left text-warning-content">Days</th>
                <th className="py-2 px-4 text-left text-warning-content">Payment</th>
                <th className="py-2 px-4 text-left text-warning-content">Extra</th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody>
              {attnList &&
                attnList.slice(1).map((listItem, index) => {
                  const datestr = listItem.AttDateStr.split("-");
                  const dayDate = datestr[0];
                  let day;
                  let time;
                  if (listItem?.OTDay > 0) day = listItem?.OTDay;
                  if (listItem?.OTWHrs > 0 || listItem?.OTWMins > 0) time = `${listItem?.OTWHrs}:${listItem?.OTWMins}`;
                  return (
                    <tr key={index}>
                      <td className="py-2 px-4 sticky">{dayDate}</td>
                      <td className={`py-2 px-4 text-black`}>{listItem.AttType1}</td>
                      <td className="py-2 px-4">{listItem.AttAmt}</td>
                      <td className={`py-2 px-4 text-black`}>{listItem.BalAmt}</td>
                      <td className="py-2 px-4">{listItem.AttValue}</td>
                      <td className="py-2 px-4">{listItem.PayAdvAmt}</td>
                      <td className="flex flex-col">
                        <td className="py-2 px-4">{day ? `${day} Day` : ""}</td>
                        <td className="py-2 px-4">{time ? `${time} mnts` : ""}</td>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default PrintEmployeeAttnList;
