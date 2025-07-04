"use client";
import BackButton from "@/components/BackButton";
import { Spinner } from "@/components/Spinner";
import { formatDate, formatDate2, getNextDay } from "@/lib/helper-function";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { RiLoader2Fill } from "react-icons/ri";
import { ListApi, UpdateAPI } from "../utils/api";
import { toast } from "react-toastify";
import CustomModal from "@/components/Modal";
import { useModal } from "@/Provider";
import CustomFunctionalModal from "@/components/FunctionalModal";

function formateMMM(dateString: any) {
  const date = new Date(dateString);
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day.toString().padStart(2, "0")}/${month}/${year}`;
}

type Props = {};

const CurrencyCheck = (props: Props) => {
  const listAPI = new ListApi();
  const updateAPI = new UpdateAPI();
  const { setClose, isOpen, setOpen } = useModal();
  const [modalData, setModalData] = useState<MainData>({
    ActionType: 0,
    Amount: 0,
    AprDate: "",
    AprDateStr: "",
    AprSts: 0,
    AprUser: null,
    Cdate: "",
    CdateStr: "",
    EmpAutoID: 0,
    NCRID: 0,
    NotesDetails: [],
    PAYSLNO: 0,
    Remarks: "",
    Route: "",
    TotAmt: 0,
    UserCode: "",
    VehicleNo: "",
  });
  const [filteredOrderList, setFilteredOrderList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [date, setDate] = useState<Date>(getNextDay());
  const [userTypes, setUserTypes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [totalSum, setTotalSum] = useState("0");
  const [suggestion, setSuggestion] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSearchUser, setShowSearchUser] = useState(false);
  const [noteTable, setNoteTable] = useState<NoteDetails[]>([]);
  const router = useRouter();
  const session = useSession();
  const searchParams = useSearchParams();

  interface NoteDetails {
    ActionType: any;
    NCDRID: any;
    NCRID: any;
    NMID: any;
    NoteAmount: any;
    NoteCount: any;
    NoteRemarks: string;
    NoteType: string;
    NoteValue: any;
  }

  interface MainData {
    ActionType: any;
    Amount: any;
    AprDate: string;
    AprDateStr: string;
    AprSts: any;
    AprUser: string | null;
    Cdate: string;
    CdateStr: string;
    EmpAutoID: any;
    NCRID: any;
    NotesDetails: NoteDetails[];
    PAYSLNO: any;
    Remarks: string;
    Route: string;
    TotAmt: any;
    UserCode: string;
    VehicleNo: string;
  }

  const fetchData = async () => {
    setLoading(true);
    if (selectedUserType) {
      const data = await listAPI.getNoteCountsRecordByDate(formateMMM(date), selectedUserType);
      if (data?.length > 0) {
        setModalData(data[0]);
        setNoteTable(data[0].NotesDetails);
        setLoading(false);
      } else {
        setNoteTable([]);
        setModalData({
          ActionType: 0,
          Amount: 0,
          AprDate: "",
          AprDateStr: "",
          AprSts: 0,
          AprUser: null,
          Cdate: "",
          CdateStr: "",
          EmpAutoID: 0,
          NCRID: 0,
          NotesDetails: [],
          PAYSLNO: 0,
          Remarks: "",
          Route: "",
          TotAmt: 0,
          UserCode: "",
          VehicleNo: "",
        });
        toast.info("No data found");
        setLoading(false);
      }
      setLoading(false);
    }
  };

  const FetchEmployeeDetails = async () => {
    // if (session?.data?.user?.role === "admin") {
    setLoading(true);
    try {
      const response = await listAPI.getEmployeeMasterListView();
      if (response) {
        if (response?.length > 0) {
          const uniqueTodayOrder = response?.map((item: any) => ({
            EMPCODE: item?.EMPCODE,
            EmpName: item?.EmployeeName,
          }));
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
    FetchEmployeeDetails();
  }, [session.data?.user.role]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (!isNaN(Number(value))) {
      setNoteTable((prevTable) => {
        const newTable = [...prevTable];
        const newItem = { ...newTable[index] };
        newItem.NoteCount = Number(value);
        newItem.NoteAmount = Number(value) * newItem.NoteValue;
        newTable[index] = newItem;
        return newTable;
      });
    }
  };

  const handleRemarkChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;

    setNoteTable((prevTable) => {
      const newTable = [...prevTable];
      const newItem = { ...newTable[index] };
      newItem.NoteRemarks = value;
      newTable[index] = newItem;
      return newTable;
    });
  };

  const handleNewAdd = async () => {
    if (selectedUserType === "") return toast.warn("Please select a user");
    if (!date) return toast.warn("Please select a date");
    await fetchData();
    setModalOpen(true);
  };

  useEffect(() => {
    let sumOfAll = noteTable.reduce((acc: number, cen: NoteDetails) => {
      return acc + cen.NoteAmount;
    }, 0);

    const userDetails = localStorage.getItem("UserYear");
    let newRoute = modalData.Route;
    let newVehicle = modalData.VehicleNo;
    if (userDetails) {
      const parts = userDetails.split("_");
      if (parts.length >= 4) {
        if (!modalData.Route) {
          newRoute = parts[3];
        }
        if (!modalData.VehicleNo) {
          newVehicle = parts[2];
        }
      }
    }
    setModalData({
      ...modalData,
      NotesDetails: noteTable,
      Amount: sumOfAll,
      TotAmt: sumOfAll,
      Route: newRoute,
      VehicleNo: newVehicle,
    });
  }, [noteTable]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log(modalData, "submit data");
    if (!modalData.VehicleNo) return toast.warn("Please input data");
    if (!modalData.Amount) return toast.warn("Please input amount");
    if (!modalData.UserCode) return toast.warn("User is not selected, Please try again");
    if (!modalData.EmpAutoID) return toast.warn("User is not selected, Please try again");
    setSubmitted(true);
    try {
      const response = await updateAPI.updateNotesDetails(modalData);
      console.log(response);
      if (response) {
        toast.success("Succesfully Submitted");
        setSubmitted(false);
        router.push("/currencycheck");
        setClose();
      } else {
        setSubmitted(false);
        toast.error("Failed to Add Expense");
      }
    } catch (error) {
      setSubmitted(false);
      toast.error(`error ${error}`);
    }

    // setClose()
  };

  return (
    <div>
      <div className=" bg-slate-100 min-h-screen mt-24 sm:mt-16 md:mt-20 lg:mt-0 shadow-md flex justify-center">
        {loading && <Spinner />}
        <div className="w-full md:p-6 lg:p-8 xl:p-10">
          <div className="bg-transparent  flex-col flex items-start justify-between mb-2 p-2">
            <div className="flex w-full justify-between items-center">
              <BackButton />
              <h3 className="md:text-3xl text-xl font-semibold">All Staff</h3>
            </div>
          </div>
          <div className="w-full gap-2">
            <div className="bg-slate-200 shadow-md w-full flex md:flex-row flex-col items-center gap-2 justify-between mb-4 p-2 rounded-lg">
              <div className="flex justify-start items-center w-full md:basis-1/2">
                <label className="text-warning-content me-2 text-center whitespace-nowrap basis-1/5 text-sm font-semibold">
                  Select Date
                </label>
                <input
                  type="date"
                  value={formatDate(date)}
                  onChange={handleDateChange}
                  className="shadow appearance-none border input-info text-sm rounded w-full py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                />
              </div>
              <div className="flex justify-start items-center w-full md:basis-1/2">
                <label className="text-warning-content me-2 text-center whitespace-nowrap basis-1/5 text-sm font-semibold">
                  Select Employee
                </label>

                <div className="relative flex flex-col w-full">
                  <input
                    type="text"
                    onClick={() => setShowSearchUser(!showSearchUser)}
                    onChange={(e) => handleSelectUserType(e.target.value)}
                    className="shadow appearance-none border input-info text-sm rounded w-full py-1 px-1.5 my-auto sm:py-2 sm:px-3  leading-tight "
                    placeholder="select"
                    value={selectedUserType}
                  />
                  <div className={` ${showSearchUser ? "max-h-40 h-auto z-[300] overflow-auto w-full absolute top-8" : ""} `}>
                    {showSearchUser &&
                      userTypes &&
                      userTypes.map((item, ind) => (
                        <div key={ind} className="w-full bg-white p-0.5 rounded">
                          <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                            <div
                              className="text-sm font-medium whitespace-nowrap text-success-content cursor-pointer"
                              onClick={() => {
                                // setPartySelected("selectParty");
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
            </div>
            <button
              onClick={handleNewAdd}
              className="btn btn-success w-full md:w-28 text-white font-bold py-2 px-4 rounded mr-4"
              type="button"
            >
              Add New
            </button>
          </div>

          {modalOpen && (
            <CustomFunctionalModal close={setModalOpen} title="Currency Table">
              <div className="flex max-h-[87vh] h-full overflow-auto w-full">
                <div className="flex justify-between">
                  <h2>
                    Total: <strong>{modalData.Amount}</strong>
                  </h2>
                  <h2>
                    Date: <strong>{modalData.CdateStr}</strong>
                  </h2>
                </div>
                <div className="bg-slate-100 w-full max-h-96 shadow overflow-auto sm:rounded-lg">
                  <table className=" divide-gray-200 table overflow-x-visible">
                    <thead className="bg-primary sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Count</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                          Note Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {noteTable &&
                        noteTable?.map((item: NoteDetails, ind) => {
                          return (
                            <tr key={ind}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  className="shadow appearance-none border input-info text-sm rounded w-fit max-w-32 py-1 px-1.5 my-auto sm:py-2 sm:px-3  leading-tight "
                                  onChange={(e) => handleInputChange(e, ind)}
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{item.NoteType}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{item.NoteAmount}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  className="shadow appearance-none border input-info text-sm rounded w-fit max-w-32 py-1 px-1.5 my-auto sm:py-2 sm:px-3  leading-tight "
                                  onChange={(e) => handleRemarkChange(e, ind)}
                                />
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
                {submitted ? (
                  <>
                    <button className="btn flex btn-success w-full md:w-fit text-white font-bold py-2 px-4 rounded mr-4" type="button">
                      <span>
                        <RiLoader2Fill className="animate-spin" color="white" size="27" />
                      </span>
                      Loading
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-success w-full md:w-fit text-white font-bold py-2 px-4 rounded mr-4"
                      type="submit"
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                  </>
                )}
              </div>
            </CustomFunctionalModal>
          )}

          {/* <div className="grid md:hidden mt-6 grid-cols-1 gap-6 px-2 sm:grid-cols-2 max-h-[32rem] overflow-y-auto lg:grid-cols-1">
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
                                        <h4 className="text-lg font-semibold mb-2">Order No: {item.OrderNo}</h4>
                                        <p className=" text-warning-content mb-2"> User Code: {item.UserCode}</p>
                                        <p className="text-warning-content mb-2">Party: {item.PartyName}</p>
                                        <p className=" text-warning-content mb-2">Date: {item.OrderDate}</p>
                                        <p className=" text-warning-content mb-2">Items: {item.TotCnd}</p>
                                        {item?.AccPartyID === "0" ? (
                                            <>
                                                <p className="cursor-pointer text-warning-content mb-2">
                                                    Acc:
                                                    <button className="text-sm text-center font-semibold text-gray-900 w-10">
                                                        0
                                                    </button>
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="cursor-pointer text-warning-content mb-2">
                                                    Acc:
                                                    <button className="text-sm text-center font-semibold text-white w-10">
                                                        1
                                                    </button>
                                                </p>
                                            </>
                                        )}
                                        <p className=" text-warning-content mb-2">Amount: {item.TotAmt}</p>
                                        {submitted ? (
                                            <>
                                                <button className=" bg-error px-3 py-2 mb-2">
                                                    <span>
                                                        <RiLoader2Fill className="animate-spin" color="black" size="27" />
                                                    </span>
                                                    Processing...
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button className=" bg-error px-3 py-2 mb-2" type="button">
                                                    Select
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                    <div className="bg-slate-100 w-full hidden md:block max-h-96  shadow overflow-auto  sm:rounded-lg">
                        <table className=" divide-gray-200 table overflow-x-visible">
                            <thead className="bg-primary sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Order No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Party
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Items
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        ACC
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Select
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrderList &&
                                    filteredOrderList?.map((item: any, ind) => (
                                        <tr key={ind}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.OrderNo}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.UserCode}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.PartyName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.OrderDate}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.TotCnd}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item?.AccPartyID === "0" ? (
                                                    <>
                                                        <button className="text-sm text-gray-900">0</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className="text-sm text-gray-900">1</button>
                                                    </>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.TotAmt}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {submitted ? (
                                                    <>
                                                        <button className="mt-4 px-4 py-2 bg-error">
                                                            <span>
                                                                <RiLoader2Fill
                                                                    className="animate-spin"
                                                                    color="black"
                                                                    size="27"
                                                                />
                                                            </span>
                                                            Processing...
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className="mt-4 px-4 py-2 bg-error" type="button">
                                                            Select
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div> */}
        </div>
      </div>
    </div>
  );
};

export default CurrencyCheck;
