"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ListApi, UpdateAPI } from "@/app/utils/api";
import { Spinner } from "@/components/Spinner";
import BackButton from "@/components/BackButton";
import { TodayExpenseInterface, NewExpenseInterface, PartyItemType, EmployeeDDInterface } from "@/types";
import { getNextDay, formatDate, formatDate2 } from "@/lib/helper-function";
import { useModal } from "@/Provider";
import CustomModal from "@/components/Modal";
import CreateExpense from "@/components/common/createExpense";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { FcApproval } from "react-icons/fc";

const TodayExpense = () => {
  const listAPI = new ListApi();
  const updateAPI = new UpdateAPI();
  const { setClose, isOpen, setOpen } = useModal();
  const router = useRouter();
  const session = useSession();
  const searchParams = useSearchParams();

  const [year, setYear] = useState("");
  const [route, setRoute] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [userCode, setUserCode] = useState("");
  const [userId, setUserId] = useState("");

  const [todayExpense, setTodayExpense] = useState<TodayExpenseInterface[]>([]);
  const [filteredExpenseList, setFilteredExpenseList] = useState<TodayExpenseInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>(getNextDay());
  const [userTypes, setUserTypes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [totalSum, setTotalSum] = useState("0");
  const [newExpenseData, setNewExpenseData] = useState<NewExpenseInterface[]>([]);
  const [showSearchUser, setShowSearchUser] = useState(false);
  const [expenseList, setExpenseList] = useState<PartyItemType[]>([]);
  const [cashAccountList, setCashAccountList] = useState<PartyItemType[]>([]);
  const [employeeList, setEmployeeList] = useState<EmployeeDDInterface[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const currentDate = formatDate2(getNextDay());
    const formattedDate = formatDate2(date) === currentDate ? currentDate : formatDate2(date);

    if (session.data?.user.role === "admin") {
      const data = await listAPI.getDailyExpenseList(formattedDate, selectedUserType);
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
      const data = await listAPI.getDailyExpenseList(formattedDate, session?.data?.user?.name);
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

  const handleEdit = async (item: TodayExpenseInterface) => {
    try {
      const response = await listAPI.getEditNewExpense(item?.DTId.toString());

      const expData = JSON.parse(response[0]?.JSONData1);
      const cashAccList = JSON.parse(response[0]?.JSONData2);
      const expAccList = JSON.parse(response[0]?.JSONData3);
      const empList = JSON.parse(response[0]?.JSONData4);
      setExpenseList(expAccList.PartyList);
      setCashAccountList(cashAccList.PartyList);
      setEmployeeList(empList);
      setNewExpenseData(expData);
      setOpen();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Something went wrong");
      toast.warn("Please try again");
      console.log(error);
    }
  };

  const handleDelete = (item: TodayExpenseInterface) => {
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
          if (response) {
            toast.success(`${response[0].InfoField}`);
            fetchData();
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
      const expData = JSON.parse(response[0].JSONData1);
      const cashAccList = JSON.parse(response[0].JSONData2);
      const expAccList = JSON.parse(response[0].JSONData3);
      const empList = JSON.parse(response[0].JSONData4);
      setExpenseList(expAccList.PartyList);
      setCashAccountList(cashAccList.PartyList);
      setEmployeeList(empList);
      setNewExpenseData(expData);
      setOpen();
      setLoading(false);
    } catch (error) {
      console.log(error, "error message");
      setLoading(false);
      toast.error("Server error");
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
    if (searchQuery) {
      const filteredList = todayExpense?.filter(
        (item) =>
          item?.Account2?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item?.Account1?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredExpenseList(filteredList);
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
    const response = generateSums(filteredExpenseList);
    setTotalSum(response);
  }, [filteredExpenseList]);

  return (
    <>
      {isOpen && (
        <CustomModal
          children={
            <CreateExpense
              route={route}
              userCode={userCode}
              newExpenseData={newExpenseData}
              userId={userId}
              vehicle={vehicleNumber}
              expenseList={expenseList}
              cashAccountList={cashAccountList}
              employeeList={employeeList}
            />
          }
          title="New Expense"
        ></CustomModal>
      )}
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
            <div className="flex w-full flex-wrap justify-between items-center my-1 gap-2">
              <div className="flex gap-2 justify-between items-center">
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
                ) : (
                  <div className="flex justify-start items-center">
                    <label className="text-warning-content me-2 text-center md:block hidden whitespace-nowrap basis-1/5 text-sm font-semibold">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={formatDate(date)}
                      onChange={handleDateChange}
                      className="shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight"
                    />
                  </div>
                )}
                <button
                  onClick={fetchData}
                  className="btn btn-primary sm:block hidden btn-sm md:btn-md font-semibold md:font-bold p-2 md:px-4   rounded"
                >
                  Filter
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleNewExpense}
                  className="btn btn-primary btn-sm md:btn-md text-black font-semibold md:font-bold p-2 md:px-4   rounded"
                >
                  New Expense
                </button>
                <button
                  onClick={fetchData}
                  className="btn btn-primary sm:hidden block btn-sm md:btn-md font-semibold md:font-bold p-2 md:px-4   rounded"
                >
                  Filter
                </button>
              </div>
            </div>
          </div>
          <div className="w-full flex">
            <div className="bg-slate-100 shadow-md w-full flex items-center gap-2 justify-between p-2 rounded-lg">
              <div className="flex justify-start basis-1/2 items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search here"
                  className="shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight"
                />
              </div>
              <div className="flex justify-end basis-1/2 w-full items-center">
                <span className="w-fit font-medium text-base border-black p-0.5 border border-solid bg-[#f0f0f0]">
                  {filteredExpenseList?.length} / {totalSum}
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:hidden mt-6 grid-cols-1 gap-6 px-2 sm:grid-cols-2 max-h-[32rem] overflow-y-auto lg:grid-cols-1">
            {/* Card representation for smaller screens */}
            {filteredExpenseList &&
              filteredExpenseList?.map((item) => (
                <div
                  key={item.AcRel}
                  className={`border border-blue-200 shadow-md rounded-lg overflow-hidden ${
                    item?.AprSts === 0 ? "bg-blue-200" : "bg-[#FFE0B5]"
                  }`}
                  style={{
                    boxShadow: "5px 5px 0px 2px rgba(173, 216, 230, 0.9)",
                  }}
                >
                  <div className="p-4">
                    <div className="flex justify-between">
                      <h4 className="text-lg font-semibold mb-2">SL No.: {item.DTId}</h4>
                      {item?.AprSts > 0 && <FcApproval size={25} />}
                    </div>
                    <p className=" text-warning-content mb-2"> User Code: {item.UserCode}</p>
                    <p className="text-warning-content mb-2">Expense Type: {item.Account2}</p>
                    <p className=" text-warning-content mb-2">Date: {item.CdateStr}</p>
                    <p className=" text-warning-content mb-2">Vehicle No.: {item.VehicleNo}</p>
                    <p className=" text-warning-content mb-2">Route: {item.Route}</p>
                    <p className=" text-warning-content mb-2">Amount: {item.Amount}</p>
                    <p className=" text-warning-content mb-2">Purpose: {item.Account1}</p>
                    <p className=" text-warning-content mb-2">Employee: {item.EmpName}</p>
                    <div className="flex justify-between items-center">
                      <button className=" bg-error px-3 py-2 mb-2" onClick={() => handleEdit(item)}>
                        Edit
                      </button>
                      <button className=" bg-error px-3 py-2 mb-2" onClick={() => handleDelete(item)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="bg-slate-100 w-full hidden md:block my-2 shadow overflow-auto  sm:rounded-lg">
            <table className=" divide-gray-200 overflow-hidden table ">
              <thead className="bg-primary sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">SLNO</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Expense Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Vehicle No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Select</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Delete</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenseList &&
                  filteredExpenseList?.map((item) => (
                    <tr className={`${item?.AprSts === 0 ? "bg-white" : "bg-gray-200"}`} key={item.AcRel}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.DTId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.UserCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.Account2}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.CdateStr}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.VehicleNo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.Route}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.Amount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.Account1}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.EmpName}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="mt-4 px-4 py-2 bg-error" onClick={() => handleEdit(item)}>
                          Edit
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="mt-4 px-4 py-2 bg-error" onClick={() => handleDelete(item)}>
                          Delete
                        </button>
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

export default TodayExpense;
