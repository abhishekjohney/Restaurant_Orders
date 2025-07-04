// @ts-nocheck
"use client";
import { useModal } from "@/Provider";
import { ListApi, UpdateAPI } from "@/app/utils/api";
import { formatDate, formatDate2, getNextDay } from "@/lib/helper-function";
import { EmployeeDDInterface, NewExpenseInterface, PartyItemType, EmployeeDDInterface } from "@/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiDelete } from "react-icons/fi";
import { RiLoader2Fill } from "react-icons/ri";
import { toast } from "react-toastify";
import { Spinner } from "../Spinner";

type Props = {
  route?: string;
  vehicle?: string;
  userCode?: string;
  userId?: string;
  newExpenseData?: NewExpenseInterface[];
  expenseList?: PartyItemType[];
  cashAccountList?: PartyItemType[];
  employeeList?: EmployeeDDInterface[];
};

const CreateExpense = (Props: Props) => {
  const listAPI = new ListApi();
  const updateAPI = new UpdateAPI();
  const router = useRouter();
  const session = useSession();
  const { setClose } = useModal();

  const [showModal, setShowModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSearchAcc, setShowSearchAcc] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(getNextDay());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryCA, setSearchQueryCA] = useState("");
  const [filteredExpenseList, setFilteredExpenseList] = useState<PartyItemType[]>([]);
  const [filteredCashAccountList, setFilteredCashAccountList] = useState<PartyItemType[]>([]);
  const [maxHeight, setMaxHeight] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState("");
  const [userTypes, setUserTypes] = useState<EmployeeDDInterface[]>(Props?.employeeList);
  const [selectedUserType, setSelectedUserType] = useState({
    EMPAUTOID: "",
    EMPCODE: "",
    EmployeeName: "",
  });
  const [formData, setFormdData] = useState<NewExpenseInterface>(Props?.newExpenseData[0]);

  const [expenseList, setExpenseList] = useState<PartyItemType[]>(Props?.expenseList);
  const [cashAccountList, setCashAccountList] = useState<PartyItemType[]>(Props?.cashAccountList);
  const [screenName, setScreenName] = useState("Expenses");

  useEffect(() => {
    if (Props?.newExpenseData?.length > 0 && Props?.newExpenseData[0]?.Acc1Id !== 0) {
      setFormdData(Props?.newExpenseData[0]);
      setScreenName(Props?.newExpenseData[0].PayType);
      setShowForm(true);
      const dateString = Props?.newExpenseData[0]?.CdateStr;
      const dateParts = dateString.split("-");
      const year = parseInt(dateParts[2]);
      const month = parseInt(dateParts[1]) - 1;
      const day = parseInt(dateParts[0]);
      const date = new Date(year, month, day);
      setSelectedDate(date);
      setSelectedUserType({
        ...selectedUserType,
        EMPAUTOID: Props?.newExpenseData[0]?.EmpAutoid,
        EMPCODE: Props?.newExpenseData[0]?.EmpCode,
        EmployeeName: Props?.newExpenseData[0]?.EmpName,
      });
      setSearchQuery(Props?.newExpenseData[0]?.Account1);
      setSearchQueryCA(Props?.newExpenseData[0]?.Account2);
    } else {
      setFormdData({
        ...formData,
        Route: Props?.route,
        UserCode: Props?.userCode,
        VehicleNo: Props?.vehicle,
        UserAutoID: Props?.userId,
      });
    }
  }, [Props]);

  // const FetchEmployeeDetails = async () => {
  //   setLoading(true);
  //   // if (session?.data?.user?.role === "admin") {
  //   try {
  //     setLoading(true);
  //     const response = await listAPI.getEmployeeMasterDDList();
  //     const dataFilter = response?.filter((data) => data?.DRPYN === false);

  //     if (dataFilter?.length === 0) {
  //       dataFilter.push({
  //         EMPAUTOID: "",
  //         EMPCODE: "",
  //         EmployeeName: "No employee is online",
  //         DRPYN: false,
  //       });
  //     }

  //     if (response) {
  //       setUserTypes(dataFilter);
  //       setLoading(false);
  //     }
  //     setLoading(false);
  //   } catch (error) {
  //     console.error(error);
  //   }
  //   // }
  //   setLoading(false);
  // };

  // const fetchExpenseData = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await listAPI.getExpenseList();
  //     if (response) {
  //       setLoading(true);
  //       const fieldsToExclude = ["Byr_nam", "AccAutoID", "AccAutoIDClient"]; // Define fields to exclude
  //       const updatedPartyList = response?.PartyList?.map((item: PartyItemType) => {
  //         const combinedField = Object.keys(item)
  //           .filter(
  //             (key) =>
  //               !fieldsToExclude.includes(key) &&
  //               item[key as keyof PartyItemType] !== null &&
  //               item[key as keyof PartyItemType] !== undefined
  //           )
  //           .map((key) => item[key as keyof PartyItemType])
  //           .join(" ")
  //           .replace(/\s+/g, " ") // Replace multiple spaces with a single space
  //           .trim();

  //         return {
  //           ...item,
  //           combinedField,
  //         };
  //       });
  //       setExpenseList(updatedPartyList);
  //       setLoading(false);
  //     }
  //     setLoading(false);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // const fetchCashAccountData = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await listAPI.getCashAccountList();
  //     if (response) {
  //       setLoading(true);
  //       const fieldsToExclude = ["Byr_nam", "AccAutoID", "AccAutoIDClient"]; // Define fields to exclude
  //       const updatedPartyList = response?.PartyList?.map((item: PartyItemType) => {
  //         const combinedField = Object.keys(item)
  //           .filter(
  //             (key) =>
  //               !fieldsToExclude.includes(key) &&
  //               item[key as keyof PartyItemType] !== null &&
  //               item[key as keyof PartyItemType] !== undefined
  //           )
  //           .map((key) => item[key as keyof PartyItemType])
  //           .join(" ")
  //           .replace(/\s+/g, " ") // Replace multiple spaces with a single space
  //           .trim();

  //         return {
  //           ...item,
  //           combinedField,
  //         };
  //       });
  //       setCashAccountList(updatedPartyList);
  //       setLoading(false);
  //     }
  //     setLoading(false);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  useEffect(() => {
    const filteredList = expenseList?.filter((item) => item?.Byr_nam?.toLowerCase().includes(searchQuery?.toLowerCase()));

    const filteredListCA = cashAccountList?.filter((item) => item?.Byr_nam?.toLowerCase().includes(searchQueryCA?.toLowerCase()));

    setFilteredExpenseList(filteredList);
    setFilteredCashAccountList(filteredListCA);
  }, [searchQuery, expenseList, cashAccountList, searchQueryCA]);

  const handleOrder = async (selectedItem: PartyItemType, type: string) => {
    // console.log(selectedItem);
    if (type === "expense") {
      setShowSearch(false);
      setShowSearchAcc(false);
      setSearchQuery(selectedItem?.Byr_nam);
      setFormdData({
        ...formData,
        Account1: selectedItem?.Byr_nam,
        Acc1Id: selectedItem?.AccAutoID,
      });
    } else {
      setShowSearch(false);
      setShowSearchAcc(false);
      setSearchQueryCA(selectedItem?.Byr_nam);
      setFormdData({
        ...formData,
        Account2: selectedItem?.Byr_nam,
        Acc2Id: selectedItem?.AccAutoID,
      });
    }
    setShowModal(false);
  };

  const handleFormType = (val: string) => {
    // if(formData?.DTId !== 0) return toast.warn("Switching Expense type not permitable")
    if (val === "Expenses") {
      handleSelectUserType("null");
      const data2 = cashAccountList?.filter((item) => {
        return item?.Byr_nam == "CASH IN HAND";
      });
      setFormdData({
        ...formData,
        PayType: val,
        Account1: "",
        Acc1Id: "",
        Acc2Id: data2[0]?.AccAutoID,
        Account2: data2[0]?.Byr_nam,
        EmpAutoid: "0",
        EmpCode: "",
        Remarks: "",
        EmpName: "",
        TRANSTYPE: "Payment",
      });
      setSearchQuery("");
      setSearchQueryCA(data2[0]?.Byr_nam);
      setShowForm(true);
      setScreenName(val);
    } else if (val === "Deposit") {
      handleSelectUserType("null");
      const data2 = cashAccountList?.filter((item) => {
        return item?.Byr_nam == "CASH IN HAND";
      });

      setFormdData({
        ...formData,
        PayType: val,
        Account1: "",
        Acc1Id: "",
        Acc2Id: data2[0]?.AccAutoID,
        Account2: data2[0]?.Byr_nam,
        EmpAutoid: "0",
        EmpCode: "",
        Remarks: "",
        EmpName: "",
        TRANSTYPE: "Contra",
      });

      setSearchQuery("");
      setSearchQueryCA(data2[0]?.Byr_nam);
      setShowForm(true);
      setScreenName(val);
    } else if (val === "Salary") {
      const data = expenseList?.filter((item) => {
        return item?.Byr_nam == "SALARY";
      });
      const data2 = cashAccountList?.filter((item) => {
        return item?.Byr_nam == "CASH IN HAND";
      });
      setFormdData({
        ...formData,
        PayType: val,
        Account1: data[0]?.Byr_nam,
        Acc1Id: data[0]?.AccAutoID,
        Account2: data2[0]?.Byr_nam,
        Acc2Id: data2[0]?.AccAutoID,
        TRANSTYPE: "Payment",
        Remarks: "",
      });
      setSearchQuery("");
      setSearchQueryCA(data2[0]?.Byr_nam);
      setShowForm(true);
      setScreenName(val);
    }
  };

  const handleSelectUserType = (value: any) => {
    const data = userTypes?.filter((user) => user.EMPAUTOID == value);
    if (value === "null") {
      setSelectedUserType("");
    } else {
      setSelectedUserType({
        EMPAUTOID: data[0]?.EMPAUTOID,
        EMPCODE: data[0]?.EMPCODE,
        EmployeeName: data[0]?.EmployeeName,
      });
      setFormdData({
        ...formData,
        EmpAutoid: data[0]?.EMPAUTOID,
        EmpCode: data[0]?.EMPCODE,
        EmpName: data[0]?.EmployeeName,
        Remarks: data[0]?.EmployeeName,
      });
    }
  };

  const showPartyMasterItem = () => {
    if (showSearchAcc) {
      return (
        <div className="bg-white shadow-lg border z-[100] absolute max-h-44 overflow-auto w-full rounded p-2">
          {filteredCashAccountList.length > 0 &&
            filteredCashAccountList.map((item: PartyItemType) => (
              <div
                className="hover:bg-gray-200"
                onClick={() => {
                  handleOrder(item, "cash head");
                }}
              >
                <strong>{item.Byr_nam}</strong>
              </div>
            ))}
        </div>
      );
    }
  };

  const handlePartyItemChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value !== "" && cashAccountList.length > 0) {
      const newList = cashAccountList.filter((item: PartyItemType) => item.Byr_nam.toLowerCase().includes(value.toLowerCase()));
      if (newList.length > 0) {
        setShowSearchAcc(true);
        setFilteredCashAccountList(newList);
        // console.log(newList);
      } else {
        setShowSearchAcc(false);
        setFilteredCashAccountList([]);
      }
    } else {
      setShowSearchAcc(false);
      setFilteredCashAccountList([]);
    }
  };

  const handleSubmission = async (e) => {
    e.preventDefault();

    if (formData.AprSts === 1) {
      toast.warn("This Expense is already approved");
      return router.push("/todaysExpense");
    }

    if (!formData.Amount) {
      toast.warn("Amount is required");
      return router.push("/todaysExpense");
    }

    if (!formData.PayType) {
      toast.warn("Please select a expense type");
      return router.push("/todaysExpense");
    }

    if (formData?.PayType === "Expenses") {
      if (!formData?.Acc1Id || !formData?.Account1) {
        return toast.warn("Please select Expense head again");
      }
      if (!formData?.Acc2Id || !formData?.Account2) {
        return toast.warn("Please select Cash bank head again");
      }
    }

    if (formData?.PayType === "Salary") {
      if (!formData?.EmpAutoid || !formData?.EmpCode || !formData?.EmpName) {
        return toast.warn("Please select Employee again");
      }
      if (!formData?.Acc1Id || !formData?.Account1) {
        return toast.warn("Please click button salary again");
      }
      if (!formData?.Acc2Id || !formData?.Account2) {
        return toast.warn("Please select Cash bank head again");
      }
    }

    if (formData?.PayType === "Deposit") {
      if (!formData?.Acc1Id || !formData?.Account1) {
        return toast.warn("Please select Bank head again");
      }
      if (!formData?.Acc2Id || !formData?.Account2) {
        return toast.warn("Please select Cash head again");
      }
    }

    // console.log(formData);

    if (!formData.Acc1Id || !formData.Acc2Id || !formData?.Account1 || !formData?.Account2 || !formData.Amount)
      return toast.warn("Please select credentials");

    if (formData?.PayType === "Expenses") {
      if (!formData?.Acc1Id || !formData?.Acc2Id || !formData?.Account1 || !formData?.Account2 || !formData?.Amount) {
        return toast.warn("please select inputs");
      }
    }

    if (formData?.PayType === "Salary" && formData?.EmpCode === "") {
      if (!formData?.Acc1Id || !formData?.Acc2Id || !formData?.Account1 || !formData?.Account2 || !formData?.Amount) {
        return toast.warn("please select inputs");
      }
      return toast.warn("Please select a User");
    }

    if (formData?.PayType === "Deposit") {
      if (!formData?.Acc1Id || !formData?.Acc2Id || !formData?.Account1 || !formData?.Account2 || !formData?.Amount) {
        return toast.warn("please select inputs");
      }
    }

    setSubmitted(true);
    formData.CdateStr = formatDate2(selectedDate);

    try {
      const response = await updateAPI.createnewExpense(formData);
      const rcdid = response[0].RcdID;

      if (rcdid > 0) {
        toast.success("Expense added successfully");
        setSubmitted(false);
        router.refresh()
        router.push("/todaysExpense");
        setClose();
      } else if (rcdid == -3) {
        setSubmitted(false);
        toast.error("Failed to save Expense, with Employee Name");
      } else {
        setSubmitted(false);
        toast.error("Failed to save Expense");
      }
    } catch (error) {
      setSubmitted(false);
      console.error(error);
      toast.error("Server error");
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const newDate = new Date(inputValue);
    setSelectedDate(newDate);
    setFormdData({ ...formData, CdateStr: formatDate2(newDate) });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormdData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (name === "Amount") {
      setFormdData({ ...formData, Payment: value, Amount: value });
    }
  };

  const filterByCashAccount = cashAccountList.filter((items) => items?.Groups === "Cash Account");
  const filterByBankAccount = cashAccountList.filter((items) => items?.Groups === "Bank Account");

  return (
    <>
      <div className="flex w-full">
        {loading && <Spinner />}
        <div className="w-full p-1 md:p-4">
          <div className="w-full flex gap-2 justify-center">
            {(formData?.DTId === 0 || (formData?.DTId !== 0 && formData?.PayType === "Expenses")) && (
              <button onClick={() => handleFormType("Expenses")} className="">
                <h2
                  className={` ${
                    showForm && screenName === "Expenses" ? "bg-black text-white" : "bg-transparent"
                  } shadow-lg px-2 py-1 rounded-sm font-semibold text-base md:text-lg`}
                >
                  Expense
                </h2>
              </button>
            )}
            {(formData?.DTId === 0 || (formData?.DTId !== 0 && formData?.PayType === "Salary")) && (
              <button onClick={() => handleFormType("Salary")} className="">
                <h2
                  className={` ${
                    showForm && screenName === "Salary" ? "bg-black text-white" : "bg-transparent"
                  } shadow-lg px-2 py-1 rounded-sm font-semibold text-base md:text-lg`}
                >
                  Salary
                </h2>
              </button>
            )}
            {(formData?.DTId === 0 || (formData?.DTId !== 0 && formData?.PayType === "Deposit")) && (
              <button onClick={() => handleFormType("Deposit")} className="">
                <h2
                  className={` ${
                    showForm && screenName === "Deposit" ? "bg-black text-white" : "bg-transparent"
                  } shadow-lg px-2 py-1 rounded-sm font-semibold text-base md:text-lg`}
                >
                  Bank Deposit
                </h2>
              </button>
            )}
          </div>
          {/* salary */}
          {showForm && screenName === "Salary" && (
            <>
              <form className="bg-white shadow-md rounded p-4 md:px-8 md:py-7 mb-4">
                <div className="mb-4 flex justify-start items-center">
                  <label className="block text-warning-content basis-1/5 text-start text-sm font-bold mb-2">Select Employee</label>
                  <select
                    value={selectedUserType?.EMPAUTOID}
                    onChange={(e) => handleSelectUserType(e.target.value)}
                    name=""
                    className="shadow appearance-none border input-info text-sm rounded w-full py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                    id=""
                  >
                    <option value="null">--select--</option>
                    {userTypes &&
                      userTypes?.map((data, index) => (
                        <option key={index} value={data?.EMPAUTOID}>
                          {data?.EmployeeName}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="mb-4 flex justify-start items-center">
                  <label className="block text-warning-content text-start basis-1/5 text-sm font-bold mb-2">Cash Bank Head</label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      // onClick={() => setShowSearchAcc(!showSearchAcc)}
                      onChange={(e) => {
                        handlePartyItemChange(e);
                        setSearchQueryCA(e.target.value);
                      }}
                      className="shadow appearance-none border input-info rounded w-full py-2 px-3 leading-tight "
                      placeholder="Enter ..."
                      value={searchQueryCA}
                    />
                    {showPartyMasterItem()}
                  </div>
                </div>
                <div className="mb-4 flex justify-start items-center">
                  <label className="block text-warning-content basis-1/5 text-start text-sm font-bold mb-2">Amount</label>
                  <input
                    type="text"
                    className="shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight"
                    placeholder="Enter ..."
                    autoComplete="off"
                    name="Amount"
                    onClick={(e) => {
                      e.target.value = "";
                      handleChange(e);
                    }}
                    onChange={(e) => handleChange(e)}
                    value={formData?.Amount}
                  />
                </div>
                <div className="flex justify-start items-center">
                  <label className="block text-warning-content basis-1/5 sm:basis-1/3 text-sm font-bold mb-2">Date</label>
                  <input
                    value={formatDate(selectedDate)}
                    onChange={handleDateChange}
                    type="date"
                    className="shadow appearance-none border input-info rounded w-full py-2 px-3"
                    placeholder="Enter ..."
                  />
                </div>
                {submitted ? (
                  <>
                    <div className="flex items-center justify-center">
                      <div className="lg:flex my-2 justify-center items-center">
                        <button className=" w-full font-bold py-2 px-4 mb-2 lg:mb-0 rounded btn btn-success" type="button">
                          <span>
                            <RiLoader2Fill className="animate-spin" color="white" size="27" />
                          </span>
                          Loading
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center">
                      <div className="lg:flex my-2 justify-center items-center">
                        <button
                          className=" w-full font-bold py-2 px-4 mb-2 lg:mb-0 rounded btn btn-success"
                          type="submit"
                          onClick={handleSubmission}
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </>
          )}
          {/* expense */}
          {showForm && screenName === "Expenses" && (
            <>
              <form className="bg-white shadow-md rounded p-4 md:px-8 md:py-7 mb-4">
                <div className="mb-4 flex justify-start items-center">
                  <label className="block text-warning-content text-start basis-1/5 text-sm font-bold mb-2">Expense Head</label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      onClick={() => setShowSearch(!showSearch)}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="shadow appearance-none border input-info rounded w-full py-2 px-3 leading-tight "
                      placeholder="Enter ..."
                      value={searchQuery}
                    />

                    <div className="absolute top-7 z-30 max-h-40 h-auto overflow-auto w-full">
                      {showSearch &&
                        filteredExpenseList &&
                        filteredExpenseList.map((item, index) => (
                          <div key={index} className="w-full bg-white p-0.5 rounded">
                            <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                              <div
                                className="text-md font-semibold text-success-content cursor-pointer"
                                onClick={() => {
                                  handleOrder(item, "expense");
                                }}
                              >
                                {item.Byr_nam}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="mb-4 flex justify-start items-center">
                  <label className="block text-warning-content text-start basis-1/5 text-sm font-bold mb-2">Cash Bank Head</label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      onClick={() => setShowSearchAcc(!showSearchAcc)}
                      onChange={(e) => setSearchQueryCA(e.target.value)}
                      className="shadow appearance-none border input-info rounded w-full py-2 px-3 leading-tight "
                      placeholder="Enter ..."
                      value={searchQueryCA}
                    />

                    <div className="absolute top-7 z-30 max-h-40 h-auto overflow-auto w-full">
                      {showSearchAcc &&
                        filteredCashAccountList &&
                        filteredCashAccountList.map((item, index) => (
                          <div key={index} className="w-full bg-white p-0.5 rounded">
                            <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                              <div
                                className="text-md font-semibold text-success-content cursor-pointer"
                                onClick={() => {
                                  handleOrder(item, "cash head");
                                }}
                              >
                                {item.Byr_nam}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="mb-4 flex justify-start items-center">
                  <label className="block text-warning-content basis-1/5 text-start text-sm font-bold mb-2">
                    Ref No. <span className="text-sm text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight"
                    placeholder="Enter ..."
                    name="RefNo"
                    onChange={handleChange}
                    value={formData?.RefNo}
                  />
                </div>
                <div className="mb-4 flex justify-start items-center">
                  <label className="block text-warning-content basis-1/5 text-start text-sm font-bold mb-2">Amount</label>
                  <input
                    type="text"
                    className="shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight"
                    placeholder="Enter ..."
                    autoComplete="off"
                    name="Amount"
                    onClick={(e) => {
                      e.target.value = "";
                      handleChange(e);
                    }}
                    onChange={(e) => handleChange(e)}
                    value={formData?.Amount}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-auto">
                  <div className="flex justify-start items-center">
                    <div className="block text-warning-content basis-1/5 sm:basis-1/3 text-sm font-bold mb-2">
                      <label htmlFor="">Remarks</label>
                      <button
                        onClick={() => setFormdData({ ...formData, Remarks: "" })}
                        className="bg-gray-400 p-2 w-fit rounded-md shadow-lg border-2 border-white justify-center items-center flex gap-2 text-white text-xs font-medium capitalize"
                      >
                        <FiDelete /> clear
                      </button>
                    </div>
                    <textarea
                      value={formData?.Remarks}
                      onChange={handleChange}
                      name="Remarks"
                      className="shadow h-auto appearance-none border input-info rounded w-full py-2 px-3"
                      placeholder="Enter ..."
                    ></textarea>
                  </div>
                  <div className="flex justify-start items-center">
                    <label className="block text-warning-content basis-1/5 sm:basis-1/3 text-sm font-bold mb-2">Date</label>
                    <input
                      value={formatDate(selectedDate)}
                      onChange={handleDateChange}
                      type="date"
                      className="shadow appearance-none border input-info rounded w-full py-2 px-3"
                      placeholder="Enter ..."
                    />
                  </div>
                </div>
                {submitted ? (
                  <>
                    <div className="flex items-center justify-center">
                      <div className="lg:flex my-2 justify-center items-center">
                        <button className=" w-full font-bold py-2 px-4 mb-2 lg:mb-0 rounded btn btn-success" type="button">
                          <span>
                            <RiLoader2Fill className="animate-spin" color="white" size="27" />
                          </span>
                          Loading
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center">
                      <div className="lg:flex my-2 justify-center items-center">
                        <button
                          className=" w-full font-bold py-2 px-4 mb-2 lg:mb-0 rounded btn btn-success"
                          type="submit"
                          onClick={handleSubmission}
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </>
          )}
          {/* deposit */}
          {showForm && screenName === "Deposit" && (
            <>
              <form className="bg-white shadow-md rounded p-4 md:px-8 md:py-7 mb-4">
                <div className="mb-4 flex justify-start items-center">
                  <label className="block text-warning-content text-start basis-1/5 text-sm font-bold mb-2">Bank Head</label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      onClick={() => setShowSearch(!showSearch)}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="shadow appearance-none border input-info rounded w-full py-2 px-3 leading-tight "
                      placeholder="Enter ..."
                      value={searchQuery}
                    />

                    <div className="absolute top-7 z-30 max-h-40 h-auto overflow-auto w-full">
                      {showSearch &&
                        filterByBankAccount &&
                        filterByBankAccount.map((item, index) => (
                          <div key={index} className="w-full bg-white p-0.5 rounded">
                            <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                              <div
                                className="text-md font-semibold text-success-content cursor-pointer"
                                onClick={() => {
                                  handleOrder(item, "expense");
                                }}
                              >
                                {item.Byr_nam}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex justify-start items-center">
                  <label className="block text-warning-content text-start basis-1/5 text-sm font-bold mb-2">Cash Head</label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      onClick={() => setShowSearchAcc(!showSearchAcc)}
                      onChange={(e) => setSearchQueryCA(e.target.value)}
                      className="shadow appearance-none border input-info rounded w-full py-2 px-3 leading-tight "
                      placeholder="Enter ..."
                      value={searchQueryCA}
                    />

                    <div className="absolute top-7 z-30 max-h-40 h-auto overflow-auto w-full">
                      {showSearchAcc &&
                        filterByCashAccount &&
                        filterByCashAccount.map((item, index) => (
                          <div key={index} className="w-full bg-white p-0.5 rounded">
                            <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                              <div
                                className="text-md font-semibold text-success-content cursor-pointer"
                                onClick={() => {
                                  handleOrder(item, "cash head");
                                }}
                              >
                                {item.Byr_nam}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="mb-4 flex justify-start items-center">
                  <label className="block text-warning-content basis-1/5 text-start text-sm font-bold mb-2">
                    Ref No. <span className="text-sm text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight"
                    placeholder="Enter ..."
                    name="RefNo"
                    onChange={handleChange}
                    value={formData?.RefNo}
                  />
                </div>
                <div className="mb-4 flex justify-start items-center">
                  <label className="block text-warning-content basis-1/5 text-start text-sm font-bold mb-2">Amount</label>
                  <input
                    type="text"
                    className="shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight"
                    placeholder="Enter ..."
                    autoComplete="off"
                    name="Amount"
                    onClick={(e) => {
                      e.target.value = "";
                      handleChange(e);
                    }}
                    onChange={(e) => handleChange(e)}
                    value={formData?.Amount}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-auto">
                  <div className="flex justify-start items-center">
                    <div className="block text-warning-content basis-1/5 sm:basis-1/3 text-sm font-bold mb-2">
                      <label htmlFor="">Remarks</label>
                      <button
                        onClick={() => setFormdData({ ...formData, Remarks: "" })}
                        className="bg-gray-400 p-2 w-fit rounded-md shadow-lg border-2 border-white justify-center items-center flex gap-2 text-white text-xs font-medium capitalize"
                      >
                        <FiDelete /> clear
                      </button>
                    </div>
                    <textarea
                      value={formData?.Remarks}
                      onChange={handleChange}
                      name="Remarks"
                      className="shadow h-auto appearance-none border input-info rounded w-full py-2 px-3"
                      placeholder="Enter ..."
                    ></textarea>
                  </div>
                  <div className="flex justify-start items-center">
                    <label className="block text-warning-content basis-1/5 sm:basis-1/3 text-sm font-bold mb-2">Date</label>
                    <input
                      value={formatDate(selectedDate)}
                      onChange={handleDateChange}
                      type="date"
                      className="shadow appearance-none border input-info rounded w-full py-2 px-3"
                      placeholder="Enter ..."
                    />
                  </div>
                </div>
                {submitted ? (
                  <>
                    <div className="flex items-center justify-center">
                      <div className="lg:flex my-2 justify-center items-center">
                        <button className=" w-full font-bold py-2 px-4 mb-2 lg:mb-0 rounded btn btn-success" type="button">
                          <span>
                            <RiLoader2Fill className="animate-spin" color="white" size="27" />
                          </span>
                          Loading
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center">
                      <div className="lg:flex my-2 justify-center items-center">
                        <button
                          className=" w-full font-bold py-2 px-4 mb-2 lg:mb-0 rounded btn btn-success"
                          type="submit"
                          onClick={handleSubmission}
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};
export default CreateExpense;
