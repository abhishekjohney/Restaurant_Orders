// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ListApi } from "@/app/utils/api";
import { Spinner } from "@/components/Spinner";
import BackButton from "@/components/BackButton";
import { toast } from "react-toastify";
import { OrderItemTypeTodayPayment } from "@/types";
import { getNextDay, formatDate, formatDate2 } from "@/lib/helper-function";
import { useModal } from "@/Provider";
import CustomModal from "@/components/Modal";
import EditNewPayment from "@/components/common/newPayment";
import Swal from "sweetalert2";
import { FcApproval } from "react-icons/fc";

const TodayPaymnets = () => {
  const listAPI = new ListApi();
  const { setClose, isOpen, setOpen } = useModal();
  const [year, setYear] = useState("");
  const [route, setRoute] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [userCode, setUserCode] = useState("");
  const [userId, setUserId] = useState("");
  const [todayPaymentList, setTodayPaymentList] = useState<OrderItemTypeTodayPayment[]>([]);
  const [filteredPartyList, setFilteredPartyList] = useState<OrderItemTypeTodayPayment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>(getNextDay());
  const [userTypes, setUserTypes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [paymentID, setPaymentID] = useState("");
  const [totalSum, setTotalSum] = useState("0");
  const [showSearchUser, setShowSearchUser] = useState(false);

  const router = useRouter();
  // console.log("Router Object:", router);

  const session = useSession();

  const searchParams = useSearchParams();

  const DateVal = searchParams.get("date");

  const fetchData = async () => {
    setLoading(true);
    const currentDate = formatDate2(getNextDay());
    const formattedDate = formatDate2(date) === currentDate ? currentDate : formatDate2(date);
    if (session.data?.user.role === "admin") {
      const data = await listAPI.getOrderPaymentMasterList(formattedDate, selectedUserType);
      if (data?.length === 0) {
        toast.info("No data found");
        setLoading(false);
        setTodayPaymentList([]);
      } else {
        setTodayPaymentList(data);
      }
      setLoading(false);
    } else {
      const data = await listAPI.getOrderPaymentMasterList(formattedDate, session?.data?.user?.name);
      setSelectedUserType(session?.data?.user?.name);
      if (data?.length === 0) {
        toast.info("No data found");
        setLoading(false);
        setTodayPaymentList([]);
      } else {
        setTodayPaymentList(data);
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
  const userWiseFetchPaymentList = async () => {
    setLoading(true);
    const today = formatDate2(date);
    const data = await listAPI.getOrderPaymentMasterList(today, selectedUserType);
    if (data?.length === 0) {
      setTodayPaymentList([]);
    } else {
      setTodayPaymentList(data);
    }
    setLoading(false);
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
    if (session?.data?.user?.id) {
      setUserId(session?.data?.user?.id);
      setSelectedUserType(session?.data?.user?.name);
    }

    fetchData();
    FetchEmployeeDetails();
  }, [session.data?.user.role, searchParams, DateVal]);

  const handleItem = (item: OrderItemTypeTodayPayment) => {
    const combinedInfo = `${item.PaymentID}`;
    setPaymentID(item?.PaymentID);
    setOpen();
  };

  const handleNewPayment = () => {
    setPaymentID("");
    setOpen();
  };

  const formatDatingDate = (date) => {
    const dateObject = new Date(date);

    const day = dateObject.getDate().toString().padStart(2, "0");
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObject.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const newDate = new Date(inputValue);
    setDate(newDate);
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

  const handleDeletePayment = async (id) => {
    Swal.fire({
      title: "Do you want to delete?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Delete",
      denyButtonText: `Don't delete`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await listAPI.deletePaymentMasterRecordByCode(id);
          if (response) {
            toast.success("payment deleted successfully");
            fetchData();
            FetchEmployeeDetails();
          } else {
            toast.error("Failed to Create Order");
          }
        } catch (error) {
          console.log(error);
        }
      } else if (result.isDenied) {
        toast.warn("Changes are not saved");
      }
    });
  };

  useEffect(() => {
    const filteredList = todayPaymentList?.filter((item) => item?.PartyName.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredPartyList(filteredList);
  }, [searchQuery, todayPaymentList]);

  const generateSums = (filterlist: any) => {
    let advanceSum = 0;

    filterlist?.forEach((item: any) => {
      const balance = parseFloat(item?.TotAmt);
      advanceSum += balance;
    });

    const totalSum = advanceSum;
    return totalSum.toFixed(2).toString();
  };
  useEffect(() => {
    if (filteredPartyList?.length > 0) {
      const response = generateSums(filteredPartyList);
      setTotalSum(response);
    }
  }, [filteredPartyList]);

  return (
    <>
      <div className=" bg-slate-100 min-h-screen mt-24 sm:mt-20 md:mt-20 lg:mt-2 shadow-md flex justify-center">
        {loading && <Spinner />}
        {isOpen && (
          <CustomModal
            children={<EditNewPayment userCode={userCode} paymentId={paymentID} userId={userId} />}
            title="New Payment"
          ></CustomModal>
        )}
        <div className="w-full lg:mt-0 p-1">
          <div className="bg-slate-100 shadow-md flex-col flex items-start justify-between mb-2 p-2 rounded-lg">
            <div className="flex w-full justify-between items-center">
              <BackButton />
              {session.data?.user.role === "admin" ? (
                <h3 className="md:text-3xl text-xl font-semibold">All Staff</h3>
              ) : (
                <h3 className="md:text-3xl text-xl font-semibold">{session?.data?.user?.name}</h3>
              )}
            </div>
            <div className="flex w-full justify-between flex-wrap items-center my-1 gap-2">
              <div className="flex gap-2 justify-between items-center">
                {/* {session.data?.user.role === "admin" ? (
                                    <> */}
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
                    <div className={`max-w-48 ${showSearchUser ? "max-h-40 h-auto z-[300] overflow-auto w-[230px] absolute top-8" : ""} `}>
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
                <button
                  onClick={userWiseFetchPaymentList}
                  className="btn btn-primary btn-sm md:btn-md text-white font-semibold md:font-bold p-2 md:px-4   rounded"
                >
                  Filter
                </button>
              </div>
              <div className="">
                <button
                  onClick={handleNewPayment}
                  className="btn btn-primary md:text-base h-fit sm:text-sm text-xs btn-sm md:btn-md text-white font-semibold md:font-bold p-2 md:px-4  rounded"
                >
                  New Payment
                </button>
              </div>
            </div>
          </div>
          <div className="w-full flex">
            <div className="bg-slate-100 flex shadow-md w-full p-2 rounded-lg">
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
                <span className="w-fit font-bold text-base border-black p-0.5 border border-solid bg-[#f0f0f0]">
                  {filteredPartyList?.length} / {totalSum}
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:hidden mt-6 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 px-2 max-h-[45rem] overflow-y-auto">
            {/* Card representation for smaller screens */}
            {filteredPartyList &&
              filteredPartyList.map((item) => (
                <div
                  key={item.PaymentID}
                  className={`border border-blue-200 shadow-md rounded-lg overflow-hidden ${
                    item?.AprSts === 0 ? "bg-blue-200" : "bg-[#FFE0B5]"
                  }`}
                  style={{
                    boxShadow: "5px 5px 0px 2px rgba(173, 216, 230, 0.9)",
                  }}
                >
                  <div className="p-4">
                    <h4 className="text-lg flex justify-between font-semibold mb-2">
                      {item.PartyName}
                      {item?.AprSts > 0 && <FcApproval size={25} />}
                    </h4>
                    <p className="text-gray-700 mb-2">Payment Date: {formatDatingDate(item.Cdate)}</p>
                    <p className="text-gray-700 mb-2">Type: {item.TransType}</p>
                    <p className="text-gray-700 mb-2">Discount: {item.Discount}</p>
                    <p className="text-gray-700 mb-2">Gross Amount: {item.BillAmount}</p>
                    <p className="text-gray-700 mb-2">Other Amount: {item.OthAmount}</p>
                    <p className="text-gray-700 mb-2">Total Amount: {item.TotAmt}</p>
                    <div className="flex justify-between">
                      <button className="btn btn-info rounded-md text-white px-3 py-2 mb-2" onClick={() => handleItem(item)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-info rounded-md text-white px-3 py-2 mb-2"
                        onClick={() => handleDeletePayment(item?.PaymentID)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="bg-slate-100 w-full hidden md:block  shadow overflow-hidden  sm:rounded-lg">
            <div className="max-h-[450px] overflow-y-auto">
              <table className=" divide-gray-200 table overflow-x-visible">
                <thead className="bg-primary sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Payment Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Party Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content tracking-wider">Discount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Gross Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Other Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Total Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Edit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Delete</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPartyList &&
                    filteredPartyList
                      .slice()
                      .sort((a, b) => b.PaymentID - a.PaymentID)
                      .map((item) => (
                        <tr className={`${item?.AprSts === 0 ? "bg-white" : "bg-gray-200"}`} key={item.PaymentID}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDatingDate(item.Cdate)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.PartyName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.TransType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.Discount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.BillAmount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.OthAmount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.TotAmt}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button className="mt-4 px-4 py-2 bg-info text-white rounded" onClick={() => handleItem(item)}>
                              Edit
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              className="mt-4 px-4 py-2 bg-info text-white rounded"
                              onClick={() => handleDeletePayment(item?.PaymentID)}
                            >
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
      </div>
    </>
  );
};

export default TodayPaymnets;
