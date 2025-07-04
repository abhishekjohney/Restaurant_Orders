"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ListApi } from "../utils/api";
import { Spinner } from "@/components/Spinner";
import BackButton from "@/components/BackButton";
import { useSession } from "next-auth/react";
import { formatDate, formatDate2, getNextDay } from "@/lib/helper-function";
import { StaffLocationInterfaceOnMap } from "@/types";
import { toast } from "react-toastify";

const Map = dynamic(() => import("./_components/MapComponent"), { ssr: false });

export default function Home() {
  const listAPI = new ListApi();
  const session = useSession();

  const [loading, setLoading] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [userData, setUserData] = useState({ EMPCODE: "", EmpName: "" });
  const [showSearchUser, setShowSearchUser] = useState(false);
  const [date, setDate] = useState<Date>(getNextDay());
  const [userTypes, setUserTypes] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<StaffLocationInterfaceOnMap[]>([]);

  const FetchData = async () => {
    try {
      const currentDate = formatDate2(getNextDay());
      const formattedDate = formatDate2(date) === currentDate ? currentDate : formatDate2(date);
      if (!selectedUserType) return toast.warn("Select a user");
      const response = await listAPI.GetDateWiseUserLocationList(formattedDate, selectedUserType);
      const action = response[0]?.ActionType;
      if (action > 0) {
        const JSONData1: StaffLocationInterfaceOnMap[] = JSON.parse(response[0]?.JSONData1);
        if (JSONData1.length > 0) {
          const filteredData = JSONData1.filter((item: StaffLocationInterfaceOnMap) => item.LocLatLong && item.LocLatLong !== "NA");
          const parting = filteredData.map((item: StaffLocationInterfaceOnMap) => {
            const [lat, long] = item.LocLatLong.split(",");
            return {
              ...item,
              lat: parseFloat(lat),
              long: parseFloat(long),
            };
          });
          setLocationData(parting);
        } else {
          setLocationData([]);
          toast.warn("No data found");
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const FetchEmployeeDetails = async () => {
    if (session?.data?.user?.name) {
      setLoading(false);
      try {
        const response = await listAPI.getEmployeeMasterListView();
        if (response) {
          if (response?.length > 0) {
            const uniqueTodayOrder = response?.map((item: any) => ({
              EMPCODE: item?.EMPCODE,
              EmpName: item?.EmployeeName,
            }));
            const uniqueTodayOrderArray: any[] = [{ EMPCODE: "", EmpName: "select All" }, ...uniqueTodayOrder];
            setUserTypes(uniqueTodayOrderArray);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (session?.data?.user?.name) {
      FetchEmployeeDetails();
      FetchData();
    }
  }, [session.data?.user.name]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const newDate = new Date(inputValue);
    setDate(newDate);
    if (session?.data?.user?.name) {
      setSelectedUserType("");
    }
  };

  const handleSelectUserType = (value: string) => {
    if (value === "null") {
      setSelectedUserType("");
    } else {
      setSelectedUserType(value);
    }
  };

  const handleUserCombo = async (value: string) => {
    if (value === "null") {
      setSelectedUserType("");
    } else {
      setSelectedUserType(value);
    }
    setShowSearchUser(!showSearchUser);
  };
  console.log(userData, "user");

  return (
    <div className=" bg-slate-100 min-h-screen mt-24 sm:mt-16 md:mt-20 lg:mt-0 shadow-md flex justify-center">
      {loading && <Spinner />}
      <div className="w-full md:p-6 lg:p-8 xl:p-10">
        <div className="bg-slate-100 shadow-md flex-col flex items-start justify-between mb-2 p-2 rounded-lg">
          <div className="flex w-full justify-between items-center">
            <BackButton />
            {/* {session?.data?.user.role === "admin" ? (
              <h3 className="md:text-3xl text-xl font-semibold">All Staff</h3>
            ) : (
              <h3 className="md:text-3xl text-xl font-semibold">{session?.data?.user?.name}</h3>
            )} */}
          </div>
          <div className="flex w-full justify-between flex-wrap items-center my-1 gap-2">
            <div className="flex gap-2 justify-between items-center flex-wrap">
              {session.data?.user.name ? (
                <>
                  <div className="flex justify-start items-center">
                    <label className="text-warning-content me-2 text-center md:block hidden whitespace-nowrap basis-1/5 text-sm font-semibold">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={formatDate(date)}
                      onChange={handleDateChange}
                      className="shadow appearance-none border input-info text-sm rounded w-fit py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                    />
                  </div>
                  <div className="flex justify-start items-center">
                    <label className="text-warning-content me-2 text-center md:block hidden whitespace-nowrap basis-1/5 text-sm font-semibold">
                      Select Employee
                    </label>

                    <div className="relative flex flex-col w-full">
                      <input
                        type="text"
                        onClick={() => setShowSearchUser(!showSearchUser)}
                        onChange={(e) => handleSelectUserType(e.target.value)}
                        className="shadow appearance-none border input-info text-sm rounded max-w-32 w-fit py-1 px-1.5 my-auto sm:py-2 sm:px-3  leading-tight "
                        placeholder="select"
                        value={selectedUserType}
                      />
                      <div
                        className={`max-w-48 ${showSearchUser ? "max-h-40 h-auto z-[300] overflow-auto w-[230px] absolute top-8" : ""} `}
                      >
                        {showSearchUser &&
                          userTypes &&
                          userTypes.map((item, ind) => (
                            <div key={ind} className="w-full bg-white p-0.5 rounded">
                              <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUserData(item);
                                    // setPartySelected("selectParty");
                                    handleUserCombo(item?.EMPCODE);
                                  }}
                                  className="text-sm font-medium whitespace-nowrap text-success-content cursor-pointer"
                                >
                                  {item.EmpName}
                                </button>
                                <div className="text-xs font-normal text-success-content">{item.EMPCODE}</div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex justify-start items-center">
                  <label className="text-warning-content me-2 text-center md:block hidden whitespace-nowrap basis-1/5 text-sm font-semibold">
                    Select Date
                  </label>
                  <input
                    type="date"
                    className="shadow appearance-none border input-info text-sm rounded w-fit py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                  />
                </div>
              )}
              <button
                onClick={FetchData}
                type="button"
                className="btn md:block hidden btn-primary md:text-base h-fit sm:text-sm text-xs btn-sm md:btn-md text-white font-semibold md:font-bold p-2 md:px-4  rounded"
              >
                Filter
              </button>
            </div>
            <div className="flex gap-1">
              <button
                onClick={FetchData}
                type="button"
                className="btn md:hidden block btn-primary md:text-base h-fit sm:text-sm text-xs btn-sm md:btn-md text-white font-semibold md:font-bold p-2 md:px-4  rounded"
              >
                Filter
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-start flex-col gap-1 p-5 border border-solid rounded-md">
          {userData?.EMPCODE && (
            <div className="flex flex-row gap-1 items-start justify-center">
              <div className="my-1 p-2 rounded-md bg-cyan-300/70 font-semibold sm:text-base text-xs md:text-lg text-black uppercase">
                <h2> {userData?.EmpName}</h2>
              </div>
              <div className="flex flex-wrap my-auto gap-2">
                <div className="flex flex-row gap-1 justify-start items-center align-middle">
                  <div className="size-2 border border-black bg-yellow-300"></div>
                  <p className="font-poppins text-sm font-normal">Order</p>
                </div>
                <div className="flex flex-row gap-1 justify-start items-center align-middle">
                  <div className="size-2 border border-black bg-blue-500"></div>
                  <p className="font-poppins text-sm font-normal">Default</p>
                </div>
                <div className="flex flex-row gap-1 justify-start items-center align-middle">
                  <div className="size-2 border border-black bg-green-500"></div>
                  <p className="font-poppins text-sm font-normal">Login/Logout</p>
                </div>
                <div className="flex flex-row gap-1 justify-start items-center align-middle">
                  <div className="size-2 border border-black bg-red-500"></div>
                  <p className="font-poppins text-sm font-normal">Online Check</p>
                </div>
              </div>
            </div>
          )}
          <Map locations={locationData} />
          {locationData?.length > 0 && (
            <div className="my-2">
              <div className="relative overflow-x-auto max-h-[500px] overflow-auto">
                <table className="w-full text-sm text-left rtl:text-right ">
                  <thead className="text-xs text-white uppercase bg-gray-500">
                    <tr>
                      {["Place", "Activity", "Date & Time", "Party"].map((item, ind) => {
                        return (
                          <th key={ind} scope="col" className="px-6 py-3">
                            {item}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {locationData?.map((item, ind) => {
                      return (
                        <tr key={ind} className="border border-gray-200">
                          <td className="px-3 md:px-6 md:py-4 py-2 text-black font-medium">{item.LocPlace}</td>
                          <td className="px-3 md:px-6 md:py-4 py-2 text-black font-medium">{item.Module}</td>
                          <td className="px-3 md:px-6 md:py-4 py-2 text-black font-medium">{item.CDate}</td>
                          <td className="px-3 md:px-6 md:py-4 py-2 text-black font-medium">{item.Reason}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
