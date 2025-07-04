"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ListApi } from "@/app/utils/api";
import { Spinner } from "@/components/Spinner";
import BackButton from "@/components/BackButton";
import { getNextDay, formatDate, formatDate2 } from "@/lib/helper-function";
import { useModal } from "@/Provider";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const todaysOrderwiseItemList = () => {
  const listAPI = new ListApi();
  const { setClose, isOpen, setOpen } = useModal();
  const router = useRouter();
  const session = useSession();
  const searchParams = useSearchParams();

  const [year, setYear] = useState("");
  const [route, setRoute] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [userCode, setUserCode] = useState("");
  const [userId, setUserId] = useState("");

  const [todayExpense, setTodayExpense] = useState([]);
  const [filteredExpenseList, setFilteredExpenseList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>(getNextDay());
  const [userTypes, setUserTypes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [totalSum, setTotalSum] = useState("0");
  const [showSearchUser, setShowSearchUser] = useState(false);
  const [newExpenseData, setNewExpenseData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    const currentDate = formatDate2(getNextDay());
    const formattedDate = formatDate2(date) === currentDate ? currentDate : formatDate2(date);

    if (session.data?.user.role === "admin") {
      const data = await listAPI.getOrderwiseItemList(formattedDate, selectedUserType);
      if (data?.length > 0) {
        setTodayExpense(data);
        setLoading(false);
      } else {
        setTodayExpense([]);
        toast.info("No data found");
        setLoading(false);
      }
      setLoading(false);
    } else {
      if (userCode) {
        const data = await listAPI.getOrderwiseItemList(formattedDate, userCode);
        if (data?.length > 0) {
          setTodayExpense(data);
          setLoading(false);
        } else {
          setTodayExpense([]);
          toast.info("No data found");
          setLoading(false);
        }
        setLoading(false);
      }
    }
  };

  const FetchEmployeeDetails = async () => {
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
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const userDetails = localStorage.getItem("UserYear");
      if (userDetails) {
        const parts = userDetails.split("_");
        if (parts.length >= 4) {
          setYear(parts[1]);
          setRoute(parts[3]);
          setVehicleNumber(parts[2]);
          setUserCode(parts[0]);
        }
      }
    }
    fetchData();
    FetchEmployeeDetails();
    if (session?.data?.user?.id) {
      setUserId(session?.data?.user?.id);
    }
  }, [session?.data?.user?.name]);

  const handleEdit = async (item: any) => {
    try {
      const response = await listAPI.getEditNewExpense(item?.DTId.toString());
      setNewExpenseData(response);
      setOpen();
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = (item: any) => {
    Swal.fire({
      title: "Do you want to delete?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Yes",
      denyButtonText: `No`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await listAPI.getDeleteNewExpense(item?.DTId);
          console.log(response, "response in delete");
          if (response) {
            toast.success(`${response[0].InfoField}`);
          }
        } catch (error) {
          console.log(error);
        }
      } else if (result.isDenied) {
        toast.warn("Changes are not saved");
      }
    });
  };

  const handleNewExpense = async () => {
    // new expense modal open and modal data
    setLoading(true);
    try {
      const response = await listAPI.getCreateNewExpense();
      console.log(response, "modal data");
      setNewExpenseData(response);
      setOpen();
      setLoading(false);
    } catch (error) {
      console.log(error, "error message");
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const newDate = new Date(inputValue);
    setDate(newDate);
    if (session?.data?.user?.role === "admin") {
      setSelectedUserType("");
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

  const handleSelectUserType = (value: string) => {
    if (value === "null") {
      setSelectedUserType("");
    } else {
      setSelectedUserType(value);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      if (todayExpense?.length > 0) {
        const filteredList = todayExpense?.filter((item: any) => item?.itm_NAM?.toLowerCase().includes(searchQuery.toLowerCase()));
        setFilteredExpenseList(filteredList);
      }
    } else {
      setFilteredExpenseList(todayExpense);
    }
  }, [searchQuery, todayExpense]);

  const generateSums = (filterlist: any) => {
    let advanceSum = 0;

    filterlist?.forEach((item: any) => {
      const balance = parseFloat(item?.Amount);
      advanceSum += balance;
    });

    const totalSum = advanceSum;
    return totalSum.toFixed(2).toString();
  };

  useEffect(() => {
    if (filteredExpenseList?.length > 0) {
      const response = generateSums(filteredExpenseList);
      setTotalSum(response);
    }
  }, [filteredExpenseList]);

  return (
    <>
      <div className=" bg-slate-100 min-h-screen mt-24 sm:mt-20 md:mt-20 lg:mt-2 shadow-md flex justify-center">
        {loading && <Spinner />}
        <div className="w-full md:p-6 p-1">
          <div className="bg-slate-100 shadow-md flex-col flex items-start justify-between mb-2 p-2 rounded-lg">
            <div className="flex w-full justify-between items-center">
              <BackButton />
              {session.data?.user.role === "admin" ? (
                <h3 className="md:text-3xl text-xl font-semibold">All Staff</h3>
              ) : (
                <h3 className="md:text-3xl text-xl font-semibold">{session?.data?.user?.name}</h3>
              )}
            </div>
            <div className="flex w-full justify-between items-center my-1 gap-2">
              <div className="flex gap-2 justify-between items-center">
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
                      Select UserCode
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
                <button onClick={fetchData} className="btn btn-primary btn-sm md:btn-md font-semibold md:font-bold p-2 md:px-4   rounded">
                  Filter
                </button>
              </div>
            </div>
          </div>

          <div className="w-full flex">
            <div className="bg-slate-100 shadow-md w-full flex items-center gap-2 justify-between p-2 rounded-lg">
              <div className="flex justify-start items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search here"
                  className="shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight"
                />
              </div>
            </div>
          </div>

          <div className="grid md:hidden mt-6 grid-cols-1 gap-3 px-2 sm:grid-cols-2 max-h-[32rem] overflow-y-auto lg:grid-cols-1">
            {/* Card representation for smaller screens */}
            {filteredExpenseList &&
              filteredExpenseList?.map((item: any) => (
                <div key={item.AcRel} className="bg-primary shadow-md font-medium rounded-lg overflow-hidden">
                  <div className="p-2">
                    <h4 className="text-lg font-semibold mb-2">{item.itm_NAM}</h4>
                    <div className="flex justify-between">
                      <p className=" text-warning-content mb-2">Qty: {item.qty}</p>
                      <p className="text-warning-content mb-2">Rate: {item.RT}</p>
                    </div>
                    <p className="text-warning-content mb-2">Amount: {item.Amt}</p>
                    {/* <div className="flex justify-between items-center">
                                            <button className=" bg-error px-3 py-2 mb-2" onClick={() => handleEdit(item)}>
                                                Edit
                                            </button>
                                            <button className=" bg-error px-3 py-2 mb-2" onClick={() => handleDelete(item)}>
                                                Delete
                                            </button>
                                        </div> */}
                  </div>
                </div>
              ))}
          </div>

          <div className="bg-slate-100 w-full hidden max-h-96 md:block my-2 shadow overflow-auto  sm:rounded-lg">
            <table className=" divide-gray-200 overflow-hidden table ">
              <thead className="bg-primary sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenseList &&
                  filteredExpenseList?.map((item: any) => (
                    <tr key={item.AcRel}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.itm_NAM}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.qty}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.RT}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.Amt}</div>
                      </td>

                      {/* <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    className="mt-4 px-4 py-2 bg-error"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    className="mt-4 px-4 py-2 bg-error"
                                                    onClick={() => handleDelete(item)}
                                                >
                                                    Delete
                                                </button>
                                            </td> */}
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

export default todaysOrderwiseItemList;
