"use client";
import { ListApi } from "@/app/utils/api";
import BackButton from "@/components/BackButton";
import { Spinner } from "@/components/Spinner";
import { usePreviousRoute } from "@/hook/usePreviousRoute";
import { formatDate, formatDate2, getNextDay } from "@/lib/helper-function";
import { OrderItemTypeTodayOrder } from "@/types";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RiLoader2Fill } from "react-icons/ri";
import { toast } from "react-toastify";

const RestaurantList = () => {
  const listAPI = new ListApi();
  const [todayOrders, setTodayOrders] = useState<OrderItemTypeTodayOrder[]>([]);
  const [filteredOrderList, setFilteredOrderList] = useState<OrderItemTypeTodayOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>(getNextDay());
  const [userTypes, setUserTypes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [totalSum, setTotalSum] = useState("0");
  const [suggestion, setSuggestion] = useState<OrderItemTypeTodayOrder[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSearchUser, setShowSearchUser] = useState(false);
  const [fromAdd, setFromAdd] = useState(false);

  const router = useRouter();
  const session = useSession();
  const searchParams = useSearchParams();
  const { getPreviousPathname } = usePreviousRoute();

  const fetchData = async () => {
    setLoading(true);
    const currentDate = formatDate2(getNextDay());
    const formattedDate = formatDate2(date) === currentDate ? currentDate : formatDate2(date);

    if (session.data?.user.role === "admin") {
      const data = await listAPI.GetStockOrderMasterListJason(formattedDate, selectedUserType);
      if (data?.length > 0) {
        setTodayOrders(data);
        setLoading(false);
      } else {
        setTodayOrders([]);
        toast.info("No data found");
        setLoading(false);
      }
      setLoading(false);
    } else {
      const data = await listAPI.GetStockOrderMasterListJason(formattedDate, session?.data?.user?.name);
      if (data?.length > 0) {
        setTodayOrders(data);
        setLoading(false);
      } else {
        toast.info("No data found");
        setTodayOrders([]);
        setLoading(false);
      }
      setLoading(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    const prevPathname = getPreviousPathname();
    if (prevPathname && prevPathname.startsWith("/additem")) {
      const storedDate = localStorage.getItem("selectedDate");
      if (storedDate) {
        const formatDate = new Date(storedDate);
        setDate(formatDate);
        setFromAdd(true);
      }
    }
  }, []);

  const FetchEmployeeDetails = async () => {
    if (session?.data?.user?.role === "admin") {
      setLoading(true);
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
    if (fromAdd) fetchData();
  }, [fromAdd]);

  useEffect(() => {
    if (searchQuery?.length > 0) {
      if (searchQuery?.length === 0) setSuggestion([]);
      setShowSearch(true);
      const filteredList: OrderItemTypeTodayOrder[] = filteredOrderList?.filter(
        (item) =>
          item?.AccPartyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item?.PartyName.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSuggestion(filteredList);
    }
  }, [searchQuery, filteredOrderList]);

  useEffect(() => {
    fetchData();
    if (session?.data?.user?.role === "admin") {
      FetchEmployeeDetails();
    }
  }, [session.data?.user.name, searchParams]);

  const handleItem = (item: OrderItemTypeTodayOrder) => {
    localStorage.setItem("selectedDate", date.toISOString());
    setSubmitted(true);
    const combinedInfo = `${item.OrderID}--`;
    const base64Encoded = btoa(combinedInfo);
    setSubmitted(false);
    // router.push(`/additem/${base64Encoded}`);
    router.push(`/restaurants-bill/${base64Encoded}`);
  };

  const handleOrderListEdit = (item: OrderItemTypeTodayOrder) => {
    localStorage.setItem("selectedDate", date.toISOString());
    setSubmitted(true);
    const combinedInfo = `${item.OrderID}--`;
    const base64Encoded = btoa(combinedInfo);
    setSubmitted(false);
    // router.push(`/additem/${base64Encoded}`);
    router.push(`/restaurants-bill/${base64Encoded}`);
  };

  const handleCreateOrder = () => {
    const combinedInfo = `${0}--`;
    const base64Encoded = btoa(combinedInfo);
    router.push(`/restaurants-bill/${base64Encoded}`);
  };

  const handleEditOrder = (item: OrderItemTypeTodayOrder) => {
    const combinedInfo = `${item.OrderID}--`;
    const base64Encoded = btoa(combinedInfo);
    router.push(`/restaurants-bill/${base64Encoded}`);
  };

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

  const handleUserCombo = async (value: string) => {
    if (value === "null") {
      setSelectedUserType("");
    } else {
      setSelectedUserType(value);
    }
    setShowSearchUser(!showSearchUser);
  };

  useEffect(() => {
    const filteredList = todayOrders?.filter((item) => item?.PartyName.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredOrderList(filteredList);
  }, [searchQuery, todayOrders]);

  const generateSums = (filterlist: any) => {
    let advanceSum = 0;

    filterlist?.forEach((item: any) => {
      const balance = parseFloat(item?.NetAmount);
      advanceSum += balance;
    });

    const totalSum = advanceSum;
    return totalSum.toFixed(2).toString();
  };

  useEffect(() => {
    if (filteredOrderList?.length > 0) {
      const response = generateSums(filteredOrderList);
      setTotalSum(response);
    }
  }, [filteredOrderList]);

  return (
    <>
      <div className=" bg-slate-100 min-h-[91vh] mt-24 sm:mt-16 md:mt-20 lg:mt-0 shadow-md flex justify-center">
        {loading && <Spinner />}
        <div className="w-full md:p-6 lg:p-8 xl:p-10">
          <div className="bg-slate-100 shadow-md flex-col flex items-start justify-between mb-2 p-2 rounded-lg">
            <div className="flex w-full justify-between items-center">
              <BackButton path="Order" />
              {session?.data?.user.role === "admin" ? (
                <h3 className="md:text-3xl text-xl font-semibold">All Staff</h3>
              ) : (
                <h3 className="md:text-3xl text-xl font-semibold">{session?.data?.user?.name}</h3>
              )}
            </div>
            <div className="flex w-full justify-between flex-wrap items-center my-1 gap-2">
              <div className="flex gap-2 justify-between items-center flex-wrap">
                {session.data?.user.role === "admin" ? (
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
                                  <div
                                    className="text-sm font-medium whitespace-nowrap text-success-content cursor-pointer"
                                    onClick={() => {
                                      handleUserCombo(item?.EMPCODE);
                                    }}
                                  >
                                    {item.EmpName}
                                  </div>
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
                      value={formatDate(date)}
                      onChange={handleDateChange}
                      className="shadow appearance-none border input-info text-sm rounded w-fit py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                    />
                  </div>
                )}
                <button
                  onClick={fetchData}
                  className="btn md:block hidden btn-primary md:text-base h-fit sm:text-sm text-xs btn-sm md:btn-md text-white font-semibold md:font-bold p-2 md:px-4  rounded"
                >
                  Filter
                </button>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={fetchData}
                  className="btn md:hidden block btn-primary md:text-base h-fit sm:text-sm text-xs btn-sm md:btn-md text-white font-semibold md:font-bold p-2 md:px-4  rounded"
                >
                  Filter
                </button>
                <button
                  onClick={handleCreateOrder}
                  type="button"
                  className="btn btn-primary md:text-base h-fit sm:text-sm text-xs btn-sm md:btn-md text-white font-semibold md:font-bold p-2 md:px-4  rounded"
                >
                  New Order
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
                <div className="absolute top-10 max-h-40 h-auto z-40 overflow-auto left-0 mx-auto">
                  {showSearch &&
                    suggestion.length > 0 &&
                    suggestion.map((item, index) => (
                      <div key={index} className="w-full bg-white p-0.5 rounded">
                        <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                          <div className="text-md font-semibold text-success-content cursor-pointer" onClick={() => handleItem(item)}>
                            {item.PartyName}
                          </div>
                          <div className="text-sm font-medium text-success-content">{item.AccPartyName}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="flex justify-end basis-1/2 w-full items-center">
                <span className="w-fit font-medium text-base border-black p-0.5 border border-solid bg-[#f0f0f0]">
                  {filteredOrderList?.length} / {totalSum}
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:hidden mt-6 grid-cols-1 gap-6 px-2 sm:grid-cols-2 max-h-[32rem] overflow-y-auto lg:grid-cols-1">
            {filteredOrderList &&
              filteredOrderList?.map((item, ind) => (
                <div
                  key={ind}
                  className="bg-gradient-to-tr from-indigo-400 via-sky-300 to-blue-200 shadow-md rounded-lg overflow-hidden"
                  style={{
                    boxShadow: "5px 5px 0px 2px rgba(173, 216, 230, 0.9)",
                  }}
                >
                  <div className="p-4">
                    <h4 className="text-lg font-semibold mb-2">Order No: {item.OrderNo}</h4>
                    <p className=" text-warning-content mb-2"> User Code: {item.UserCode}</p>
                    {/* <p className="text-warning-content mb-2">Party: {item.PartyName}</p> */}
                    {/* {item?.AccPartyID === "0" ? (
                      <>
                        <p onClick={() => handleEditOrder(item)} className="cursor-pointer text-warning-content mb-2">
                          Acc:
                          <button className="text-sm text-center font-semibold text-gray-900 w-10">0</button>
                        </p>
                      </>
                    ) : (
                      <>
                        <p onClick={() => handleEdit(item)} className="cursor-pointer text-warning-content mb-2">
                          Acc:
                          <button className="text-sm text-center font-semibold text-white w-10">1</button>
                        </p>
                      </>
                    )} */}
                    <p className=" text-warning-content mb-2">Date: {item.OrderDate}</p>
                    <p className=" text-warning-content mb-2">Seat Nos: {item.SeatNos}</p>
                    <p className=" text-warning-content mb-2">Amount: {item.NetAmount}</p>

                    <button className=" bg-error rounded px-3 py-2 mb-2" type="button" onClick={() => handleOrderListEdit(item)}>
                      View
                    </button>
                  </div>
                </div>
              ))}
          </div>

          <div className="bg-slate-100 w-full hidden md:block max-h-96  shadow overflow-auto  sm:rounded-lg">
            <table className=" divide-gray-200 table overflow-x-visible">
              <thead className="bg-sky-500 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Order No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">User</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Party</th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Seat Nos</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">ACC</th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Select</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrderList &&
                  filteredOrderList?.map((item, ind) => {
                    return (
                      <tr key={ind}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 justify-center items-center">
                            {/* <button
                              // onClick={() => handleEditOrder(item)}
                              type="button"
                              className="mx-3 p-[1px] border rounded"
                            >
                              <FcEditImage size={30} />
                            </button> */}
                            {item.OrderNo}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.UserCode}</div>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.PartyName}</div>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.OrderDate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.SeatNos}</div>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          {item?.AccPartyID === "0" ? (
                            <>
                              <button onClick={() => handleEditOrder(item)} className="text-sm text-gray-900">
                                0
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="text-sm text-gray-900" onClick={() => handleEdit(item)}>
                                1
                              </button>
                            </>
                          )}
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.NetAmount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <>
                            <button className="mt-4 px-4 py-2 bg-error rounded" type="button" onClick={() => handleOrderListEdit(item)}>
                              View
                            </button>
                          </>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default RestaurantList;
