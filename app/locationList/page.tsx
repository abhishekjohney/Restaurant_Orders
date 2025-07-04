"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ListApi } from "@/app/utils/api";
import { Spinner } from "@/components/Spinner";
import BackButton from "@/components/BackButton";
import { getNextDay, formatDate, formatDate2 } from "@/lib/helper-function";

export interface StaffLocation {
  AccAutoID: number;
  AprUser: string;
  CDate: string;
  EntLocID: number;
  LocLatLong: string;
  LocPlace: string;
  LocationString: string;
  Module: string;
  Reason: string;
  Remarks: string;
  SaveDate: string | null;
  AccAutoID1: number;
  Byr_Cd: string;
  Byr_nam: string;
  AccAddress: string;
  AccAddress1: string;
  AccAddress2: string;
  AccCity: string;
  AccState: string;
  PhoneNo: string;
  PinCode: string;
}

const TodayOrders = () => {
  const listAPI = new ListApi();
  const [todayOrders, setTodayOrders] = useState<StaffLocation[]>([]);
  const [filteredOrderList, setFilteredOrderList] = useState<StaffLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>(getNextDay());
  const [userTypes, setUserTypes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestion, setSuggestion] = useState<StaffLocation[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const router = useRouter();
  const session = useSession();
  const searchParams = useSearchParams();

  const [selectedUserType, setSelectedUserType] = useState<any>(session?.data?.user?.name);
  useEffect(() => {
    if (session?.data?.user?.role === "admin") {
      setSelectedUserType("");
    } else {
      setSelectedUserType(session?.data?.user?.name);
    }
  }, [session?.data?.user?.role]);

  const fetchData = async () => {
    setLoading(true);
    const currentDate = formatDate2(getNextDay());
    const formattedDate = formatDate2(date) === currentDate ? currentDate : formatDate2(date);

    if (selectedUserType || session?.data?.user?.role === "admin") {
      setLoading(true);
      const data = await listAPI.getDailyPartyLocationList(formattedDate, selectedUserType);
      if (data && data[0]) {
        const jsonData1Array: StaffLocation[] = JSON.parse(data[0]?.JSONData1);
        if (jsonData1Array?.length > 0) {
          const filterArr = jsonData1Array.filter((item: any) => item.AprUser);
          console.log(filterArr.length, "filtered", filterArr[0]);
          setTodayOrders(filterArr);
        } else {
          setTodayOrders([]);
        }
        setLoading(false);
      }
    }
    setLoading(false);
  };

  const FetchEmployeeDetails = async () => {
    // if (session?.data?.user?.role === "admin") {
    setLoading(true);
    try {
      const response = await listAPI.getEmployeeMasterListView();
      if (response) {
        if (response?.length > 0) {
          const uniqueTodayOrder: Set<string> = new Set(response?.map((item: any) => item?.EMPCODE));
          const uniqueTodayOrderArray: any[] = [...uniqueTodayOrder];
          setUserTypes(uniqueTodayOrderArray);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
    // }
  };

  useEffect(() => {
    fetchData();
  }, [selectedUserType]);

  useEffect(() => {
    fetchData();
    FetchEmployeeDetails();
  }, [session.data?.user.name, searchParams]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const newDate = new Date(inputValue);
    setDate(newDate);
    if (session?.data?.user?.role === "admin") {
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

  useEffect(() => {
    const filteredList: StaffLocation[] = todayOrders?.filter(
      (item: any) =>
        item?.AccAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.Module?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.LocationString?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.LocPlace?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.Byr_nam?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredOrderList(filteredList);
  }, [searchQuery, todayOrders]);

  return (
    <>
      <div className=" bg-slate-100 min-h-screen mt-24 sm:mt-16 md:mt-20 lg:mt-0 shadow-md flex justify-center">
        {loading && <Spinner />}
        <div className="w-full md:p-6 lg:p-8 xl:p-10">
          <div className="bg-slate-100 shadow-md flex-col flex items-start justify-between mb-2 p-2 rounded-lg">
            <div className="flex w-full justify-between items-center">
              <BackButton />
              {session?.data?.user.role === "admin" ? (
                <h3 className="md:text-3xl text-xl font-semibold">All Staff</h3>
              ) : (
                <h3 className="md:text-3xl text-xl font-semibold">{session?.data?.user?.name}</h3>
              )}
            </div>
            <div className="flex w-full justify-between items-center my-1 gap-2">
              <div className="flex gap-2 justify-between items-center">
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
                    Select UserCode
                  </label>
                  <select
                    value={selectedUserType}
                    onChange={(e) => handleSelectUserType(e.target.value)}
                    name=""
                    className="shadow appearance-none border input-info text-sm rounded w-fit py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                    id=""
                  >
                    <option value="null">--select--</option>
                    {userTypes &&
                      userTypes?.map((data, index) => (
                        <option key={index} value={data}>
                          {data}
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  onClick={fetchData}
                  className="btn btn-primary md:text-base h-fit sm:text-sm text-xs btn-sm md:btn-md text-white font-semibold md:font-bold p-2 md:px-4  rounded"
                >
                  Filter
                </button>
              </div>
            </div>
          </div>
          <div className="w-full flex gap-2">
            <div className="bg-slate-100 shadow-md w-full flex items-center gap-2 justify-between mb-4 p-2 rounded-lg">
              <div className="flex justify-start relative basis-1/2 items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onClick={() => setShowSearch(!showSearch)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search here"
                  className="shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight"
                />
              </div>
            </div>
          </div>

          <div className="grid md:hidden mt-6 grid-cols-1 gap-6 px-2 sm:grid-cols-2 max-h-[32rem] overflow-y-auto lg:grid-cols-1">
            {/* Card representation for smaller screens */}
            {filteredOrderList &&
              filteredOrderList?.map((item: any, ind) => (
                <div
                  key={ind}
                  className="bg-primary shadow-md rounded-lg overflow-hidden"
                  style={{
                    boxShadow: "5px 5px 0px 2px rgba(173, 216, 230, 0.9)",
                  }}
                >
                  <div className="p-4">
                    <h4 className="text-lg font-medium mb-2">Order No: {ind}</h4>
                    <p className=" text-warning-content mb-2">User Code: {item.AprUser}</p>
                    <p className="text-warning-content mb-2">Party: {item.Byr_nam}</p>
                    <p className="text-warning-content mb-2">Module: {item.Module}</p>
                    <p className=" text-warning-content mb-2">Lat, Long: {item.LocLatLong}</p>
                    <p className=" text-warning-content mb-2">Place: {item.LocPlace}</p>
                    <p className=" text-warning-content mb-2">Party Add: {item.AccAddress}</p>
                    <p className=" text-warning-content mb-2">Address: {item.LocationString}</p>
                  </div>
                </div>
              ))}
          </div>

          <div className="bg-slate-100 w-full hidden md:block max-h-96  shadow overflow-auto  sm:rounded-lg">
            <table className=" divide-gray-200 table overflow-x-visible">
              <thead className="bg-primary sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Order No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">User Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Party</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Module</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Lat, Long</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Place</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Party Add</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Address</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrderList &&
                  filteredOrderList?.map((item: any, ind) => (
                    <tr key={ind}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{ind}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.AprUser}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.Byr_nam}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.Module}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.LocLatLong}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.LocPlace}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.AccAddress}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{item.LocationString}</div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default TodayOrders;
