"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ListApi, UpdateAPI } from "@/app/utils/api";
import { Spinner } from "@/components/Spinner";
import BackButton from "@/components/BackButton";
import { NewExpenseInterface } from "@/types";
import { getNextDay, formatDate, formatDate2 } from "@/lib/helper-function";
import { useModal } from "@/Provider";
import CustomModal from "@/components/Modal";
import CreateExpense from "@/components/common/createExpense";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { RiLoader2Fill } from "react-icons/ri";
import CustomFunctionalModal from "@/components/FunctionalModal";

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

function formateMMM(inputDate: any) {
  // const date = new Date(dateString);
  // const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  // const day = date.getDate();
  // const month = monthNames[date.getMonth()];
  // const year = date.getFullYear();
  // return `${day.toString().padStart(2, "0")}/${month}/${year}`;
  const [day, month, year] = inputDate.split("-");
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const monthName = monthNames[parseInt(month) - 1];
  return `${day}-${monthName}-${year}`;
}

const initialData: MainData = {
  ActionType: 0,
  Amount: 0,
  AprDate: "",
  AprDateStr: "",
  AprSts: 0,
  AprUser: "",
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
};

const CurrencyCheckList = () => {
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
  const [userName, setUserName] = useState("");

  const [todayExpense, setTodayExpense] = useState<CurrencyInterface[]>([]);
  const [filteredExpenseList, setFilteredExpenseList] = useState<CurrencyInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>(getNextDay());
  const [userTypes, setUserTypes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [addNew, setAddNew] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [total, setTotal] = useState<number>(0);

  const [submitted, setSubmitted] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [selectedUserType2, setSelectedUserType2] = useState<string>("");
  const [showSearchUser, setShowSearchUser] = useState(false);
  const [showSearchUser2, setShowSearchUser2] = useState(false);
  const [noteTable, setNoteTable] = useState<NoteDetails[]>([]);
  const [modalData, setModalData] = useState<MainData>(initialData);

  interface CurrencyInterface {
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

  const fetchDataModal = async (date: any, user: any) => {
    setLoading(true);
    if (user) {
      const data = await listAPI.getNoteCountsRecordByDate(formateMMM(date), user);
      if (data?.length > 0) {
        console.log(data[0], " data ");
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

  const fetchData = async () => {
    setLoading(true);

    if (session.data?.user.role === "admin") {
      if (session?.data?.user.role) {
        const data = await listAPI.getNotesCountListByDateJson(formatDate2(date), selectedUserType);
        if (data?.length > 0) {
          console.log(data);
          setTodayExpense(data);
          setLoading(false);
        } else {
          setTodayExpense([]);
          toast.info("No data found");
          setLoading(false);
        }
        setLoading(false);
      }
    } else {
      if (session?.data?.user?.name) {
        const data = await listAPI.getNotesCountListByDateJson(formatDate2(date), session?.data?.user?.name);
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

  // console.log(todayExpense, "expense");

  const FetchEmployeeDetails = async () => {
    try {
      if (session?.data?.user?.role === "admin") {
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
      setUserName(session?.data?.user?.name || "");
    }
  }, [session?.data?.user?.name]);

  const handleEdit = async (item: CurrencyInterface) => {
    await fetchDataModal(item.CdateStr, item.UserCode);
    setEdit(true);
    setAddNew(false);
    setOpen();
  };

  const handleDelete = (item: CurrencyInterface) => {
    Swal.fire({
      title: "Do you want to delete?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Yes",
      denyButtonText: `No`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const fetchDetails = await updateAPI.updateCurrencyApproval(userName, item.NCRID, "delete");
          if (fetchDetails) {
            toast.success("Successfully updated");
            fetchData();
          }
          setLoading(false);
        } catch (error) {
          console.log(error);
        }
      }
    });
  };

  const handleNewExpense = async () => {
    if (session?.data?.user?.role !== "admin") {
      if (session?.data?.user?.name) {
        setSelectedUserType2(session?.data?.user?.name);
      }
    }
    setAddNew(true);
    setModalOpen(true);
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

  const handleSelectUserType2 = (value: string) => {
    if (value === "null") {
      setSelectedUserType2("");
    } else {
      setSelectedUserType2(value);
    }
  };

  const handleUserCombo = async (value: string) => {
    if (value === "null") {
      setSelectedUserType("");
    } else {
      setSelectedUserType(value);
    }
    setShowSearchUser(false);
  };

  const handleUserCombo2 = async (value: string) => {
    if (value === "null") {
      setSelectedUserType2("");
    } else {
      setSelectedUserType2(value);
    }
    setShowSearchUser2(false);
  };

  useEffect(() => {
    if (searchQuery) {
      const filteredList = todayExpense?.filter((item) => item?.UserCode?.toLowerCase().includes(searchQuery.toLowerCase()));
      setFilteredExpenseList(filteredList);
    } else {
      setFilteredExpenseList(todayExpense);
    }
    const tot = todayExpense?.reduce((acc: number, conc: CurrencyInterface) => acc + conc.TotAmt, 0);
    if (tot > 0) {
      setTotal(tot);
    }
  }, [searchQuery, todayExpense]);

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
          newRoute = parts[3] ? parts[3] : "";
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

  const handleNewAdd = async () => {
    if (selectedUserType2 === "") return toast.warn("Please select a user");
    if (!date) return toast.warn("Please select a date");
    await fetchDataModal(formatDate2(date), selectedUserType2);
    setOpen();
    setAddNew(false);
    setEdit(true);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!modalData.VehicleNo) return toast.warn("Please input data");
    if (!modalData.Amount) return toast.warn("Please input amount");
    if (!modalData.UserCode) return toast.warn("User is not selected, Please try again");
    if (!modalData.EmpAutoID) return toast.warn("User is not selected, Please try again");
    setSubmitted(true);
    try {
      const response = await updateAPI.updateNotesDetails(modalData);
      if (response) {
        toast.success("Succesfully Submitted");
        setSubmitted(false);
        setModalData(initialData);
        await fetchData();
        setEdit(false);
        setClose();
      } else {
        setEdit(false);
        setModalData(initialData);
        setClose();
        setSubmitted(false);
        toast.error("Failed");
      }
    } catch (error) {
      setModalData(initialData);
      setClose();
      setEdit(false);
      setSubmitted(false);
      toast.error(`error ${error}`);
    }
  };

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
              <div className="flex md:flex-row flex-col gap-1 items-center">
                <div className="flex gap-2">
                  <button
                    onClick={handleNewExpense}
                    className="btn btn-primary btn-sm md:btn-md text-black font-semibold md:font-bold p-2 md:px-4   rounded"
                  >
                    Add New
                  </button>
                  <button
                    onClick={fetchData}
                    className="btn btn-primary sm:hidden block btn-sm md:btn-md font-semibold md:font-bold p-2 md:px-4   rounded"
                  >
                    Filter
                  </button>
                </div>
                {total > 0 ? (
                  <div className="h-fit">
                    <div className="font-semibold text-black px-2 py-1 rounded-md border border-solid border-black shadow-md">
                      {total > 0 ? `Total-${total}` : ""}
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:hidden mt-6 grid-cols-1 gap-6 px-2 sm:grid-cols-2 max-h-[32rem] overflow-y-auto lg:grid-cols-1">
            {/* Card representation for smaller screens */}
            {filteredExpenseList &&
              filteredExpenseList?.map((item, ind) => (
                <div
                  key={ind}
                  className="bg-primary shadow-md rounded-lg overflow-hidden"
                  style={{
                    boxShadow: "5px 5px 0px 2px rgba(173, 216, 230, 0.9)",
                  }}
                >
                  <div className="p-4">
                    <p className=" text-warning-content mb-2"> User Code: {item.UserCode}</p>
                    <p className=" text-warning-content mb-2">Date: {item.CdateStr}</p>
                    <p className=" text-warning-content mb-2">Vehicle No.: {item.VehicleNo}</p>
                    <p className=" text-warning-content mb-2">Route: {item.Route}</p>
                    <p className=" text-warning-content mb-2">Amount: {item.TotAmt}</p>
                    <div className="flex justify-between items-center">
                      <button className=" bg-error px-3 py-2 mb-2 rounded-md" onClick={() => handleEdit(item)}>
                        Edit
                      </button>
                      <button
                        className=" bg-error px-3 py-2 mb-2 rounded-md disabled:bg-error/45"
                        disabled={item?.AprSts === 1}
                        onClick={() => handleDelete(item)}
                      >
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Vehicle No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Select</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Delete</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenseList &&
                  filteredExpenseList?.map((item, ind) => (
                    <tr key={ind}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.UserCode}</div>
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
                        <div className="text-sm text-gray-900">{item.TotAmt}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="mt-4 px-4 py-2 bg-error rounded" onClick={() => handleEdit(item)}>
                          Edit
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="mt-4 disabled:bg-error/40 px-4 py-2 bg-error rounded"
                          disabled={item?.AprSts === 1}
                          onClick={() => handleDelete(item)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {isOpen && edit && (
            <CustomModal title="Currency Table">
              <div className="flex max-h-[87vh] h-full flex-col overflow-auto w-full">
                <div className="flex justify-between w-full">
                  <h2>
                    Total: <strong>{modalData.TotAmt}</strong>
                  </h2>
                  <h2>
                    Date: <strong>{modalData.CdateStr}</strong>
                  </h2>
                </div>
                <div className="bg-slate-100 w-full max-h-96 mb-1 shadow overflow-auto sm:rounded-lg">
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
                                  value={item.NoteCount}
                                  className="shadow appearance-none border input-info text-sm rounded w-fit max-w-24 py-1 px-1.5 my-auto sm:py-2 sm:px-3  leading-tight "
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
                                  value={item.NoteRemarks}
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
                      disabled={modalData.AprSts === 1}
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                  </>
                )}
              </div>
            </CustomModal>
          )}

          {addNew && setModalOpen && (
            <CustomFunctionalModal close={setModalOpen} title="Add your details">
              <div className="flex min-h-96 h-full overflow-auto w-full">
                <div className="bg-slate-200 shadow-md w-full h-full flex md:flex-row flex-col items-center gap-2 justify-between mb-4 p-2 rounded-lg">
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
                        onClick={() => setShowSearchUser2(!showSearchUser2)}
                        onChange={(e) => handleSelectUserType2(e.target.value)}
                        className="shadow appearance-none border input-info md:!min-w-60 text-sm rounded w-full py-1 px-1.5 my-auto sm:py-2 sm:px-3  leading-tight "
                        placeholder="select"
                        value={selectedUserType2}
                      />
                      <div className={` ${showSearchUser2 ? "max-h-40 h-auto z-[300] overflow-auto w-full absolute top-8" : ""} `}>
                        {showSearchUser2 &&
                          userTypes &&
                          userTypes.map((item, ind) => (
                            <div key={ind} className="w-full bg-white p-0.5 rounded">
                              <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                                <div
                                  className="text-sm font-medium whitespace-nowrap text-success-content cursor-pointer"
                                  onClick={() => {
                                    // setPartySelected("selectParty");
                                    handleUserCombo2(item?.EMPCODE);
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
                    onClick={handleNewAdd}
                    className="btn btn-success w-full md:w-28 text-white font-bold py-2 px-4 rounded mr-4"
                    type="button"
                  >
                    Add New
                  </button>
                </div>
              </div>
            </CustomFunctionalModal>
          )}
        </div>
      </div>
    </>
  );
};

export default CurrencyCheckList;
