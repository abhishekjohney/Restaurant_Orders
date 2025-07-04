// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoMdClose } from "react-icons/io";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { ListApi, UpdateAPI } from "@/app/utils/api";
import Image from "next/image";
import AvatarImage from "../../../public/images/avatar.png";
import BackButton from "@/components/BackButton";
import AttendanceForm from "@/components/common/attendanceFrom";
import { formatDate2, getNextDay } from "@/lib/helper-function";
import dailyIcon from "../../../public/images/svg/dailyAttendance.svg";
import { Spinner } from "@/components/Spinner";

type AttendanceData = {
  OTDay: string | any;
  AllAmt: string | any;
  DedAmt: string | any;
  TotAmt: string | any;
  OTWHrs: string | any;
  OTWMins: string | any;
};

const DailyAttendence = () => {
  const listAPI = new ListApi();
  const updateAPI = new UpdateAPI();
  const [attendenceList, setAttendenceList] = useState<EmpMstrType[]>([]);
  const [formData, setFormData] = useState<EmpMstrType>(null);
  const [dateStr, setDateStr] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState();
  const [extradutyData, setExtradutyData] = useState<AttendanceData>({});
  const [currDate, setCurrDate] = useState(getNextDay());
  const [updated, setUpdated] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const router = useRouter();
  const session = useSession();
  const searchParams = useSearchParams();
  const DateVal = searchParams.get("date");

  const currentDate = new Date();
  const formattedDate = currentDate
    .toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .split("/")
    .join("-");

  const [date, setDate] = useState(formattedDate);

  interface EmpMstrType {
    ActionType: number | null;
    AdvAmt: number | null;
    AttAmt: number | null;
    AttDate: string | null;
    AttDateStr: string | null;
    AttDys: number | null;
    AttFullMins: number | null;
    AttMstAmt: number | null;
    AttType1: string | null;
    AttType2: string | null;
    AttValue: number | null;
    AttValueStr: string | null;
    AttWHMS: null;
    AttWHrs: string | null;
    AttWMins: number | null;
    AttWSecs: number | null;
    ChkRollAttID: number | null;
    Department: null;
    EmpAutoId: number | null;
    EmpCode: string | null;
    EmployeeName: string | null;
    FTime: null;
    FullHMS: null;
    FullMins: number | null;
    FullSec: number | null;
    FullWHrs: number | null;
    FullWMins: number | null;
    FullWSecs: number | null;
    JOName: null;
    JONo: number | null;
    OTAmt: number | null;
    OTFullMins: number | null;
    OTHMS: null;
    OTWHrs: number | null;
    OTWMins: number | null;
    OTWSecs: number | null;
    OrgAutoID: number | null;
    PAYID: number | null;
    Remarks: string;
    ToTime: null;
  }

  const fetchData = async () => {
    setLoading(true);
    if (session.data?.user.role === "admin") {
      try {
        const response = await listAPI.getDailyAttendanceByDate(date);
        if (response) {
          setAttendenceList(response);
          setDateStr(response[0].AttDateStr);
          setLoading(false);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    setFormData({
      ActionType: Number | null,
      AdvAmt: Number | null,
      AttAmt: Number | null,
      AttDate: String | null,
      AttDateStr: String | null,
      AttDys: Number | null,
      AttFullMins: Number | null,
      AttMstAmt: Number | null,
      AttType1: String | null,
      AttType2: String | null,
      AttValue: Number | null,
      AttValueStr: String | null,
      AttWHMS: String | null,
      AttWHrs: Number | null,
      AttWMins: Number | null,
      AttWSecs: Number | null,
      ChkRollAttID: Number | null,
      Department: Number | null,
      EmpAutoId: Number | null,
      EmpCode: String | null,
      EmployeeName: String | null,
      FTime: String | null,
      FullHMS: String | null,
      FullMins: String | null,
      FullSec: Number | null,
      FullWHrs: Number | null,
      FullWMins: Number | null,
      FullWSecs: Number | null,
      JOName: String | null,
      JONo: Number | null,
      OTAmt: Number | null,
      OTFullMins: Number | null,
      OTHMS: String | null,
      OTWHrs: Number | null,
      OTWMins: Number | null,
      OTWSecs: Number | null,
      OrgAutoID: Number | null,
      PAYID: Number | null,
      Remarks: String | "",
      ToTime: String | null,
    });
  }, [session.data?.user.role, searchParams, DateVal]);

  const handleAttTypeChange = (value, index) => {
    const updatedAttendenceList = [...attendenceList];
    updatedAttendenceList[index].AttType1 = value;
    setAttendenceList(updatedAttendenceList);
  };

  const fetchAttendanceModalData = async (userCode: string | any) => {
    setLoading(true);
    try {
      const response = await listAPI.getDailyAttendanceByDateAndUser(date, userCode);
      if (response) {
        setModalData(response);
        setExtradutyData({
          ...extradutyData,
          AllAmt: response[0]?.AllAmt,
          DedAmt: response[0]?.DedAmt,
          OTDay: response[0]?.OTDay,
          OTWHrs: response[0]?.OTWHrs,
          OTWMins: response[0]?.OTWMins,
          TotAmt: response[0]?.TotAmt,
        });
        setShowForm(true);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setShowForm(!showForm);
    fetchData();
  }, [updated]);

  const handleShowFormModal = (item: any) => {
    console.log(item?.EmpCode);
    fetchAttendanceModalData(item?.EmpCode);
    // setShowForm(true);
  };

  const handlCloseShowFormModal = () => {
    setShowForm(false);
    setModalData();
    setExtradutyData({});
  };

  const handleInputChange = (e, index, field) => {
    const { value } = e.target;
    const updatedFormData = { ...formData };

    // Update the specific field based on the 'field' parameter
    updatedFormData[field] = value;

    // Update the state with the modified data
    setFormData(updatedFormData);

    // Update the corresponding field in the attendenceList
    const updatedAttendenceList = [...attendenceList];
    updatedAttendenceList[index][field] = value;
    setAttendenceList(updatedAttendenceList);
  };

  const handleRefresh = async () => {
    try {
      const response = await listAPI.getDailyAttendanceByDate(date);

      if (response) {
        console.log("Response Today Order ADMIN ", response);
        // Ensure responseData is an array before setting stockList
        setAttendenceList(response);

        setDateStr(response[0].AttDateStr);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePrint = () => {
    console.log(formData);
  };

  const handleOption = () => {
    setModalOpen(!modalOpen);
  };

  const handleMail = () => {};

  const handleClose = () => {};

  const handlePreAbst = async (value, index, userdata) => {
    console.log(value, index, userdata);

    const updatedAttendenceList = [...attendenceList];
    updatedAttendenceList[index].AttType1 = value;
    setAttendenceList(updatedAttendenceList);

    console.log(formData);

    if (userdata) {
      if (value === "P" || value === "AB") {
        const updatedFormData = {
          ...formData,
          ActionType: userdata.ActionType,
          AdvAmt: userdata.AdvAmt,
          AttDate: userdata.AttDate,
          AttDateStr: userdata.AttDateStr,
          AttDys: userdata.AttDys,
          AttFullMins: userdata.AttFullMins,
          AttMstAmt: userdata.AttMstAmt,
          AttType1: value,
          AttType2: userdata.AttType2,
          AttValue: userdata.AttValue,
          AttWHMS: userdata.AttWHMS,
          AttWHrs: userdata.AttWHrs,
          AttWMins: userdata.AttWMins,
          AttWSecs: userdata.AttWSecs,
          ChkRollAttID: userdata.ChkRollAttID,
          Department: userdata.Department,
          EmpAutoId: userdata.EmpAutoId,
          EmpCode: userdata.EmpCode,
          EmployeeName: userdata.EmployeeName,
          FTime: userdata.FTime,
          FullHMS: userdata.FullHMS,
          FullMins: userdata.FullMins,
          FullSec: userdata.FullSec,
          FullWHrs: userdata.FullWHrs,
          FullWMins: userdata.FullWMins,
          FullWSecs: userdata.FullWSecs,
          JOName: userdata.JOName,
          JONo: userdata.JONo,
          OTAmt: userdata.OTAmt,
          OTFullMins: userdata.OTFullMins,
          OTHMS: userdata.OTHMS,
          OTWHrs: userdata.OTWHrs,
          OTWMins: userdata.OTWMins,
          OTWSecs: userdata.OTWSecs,
          OrgAutoID: userdata.OrgAutoID,
          PAYID: userdata.PAYID,
          ToTime: userdata.ToTime,
        };

        setFormData(updatedFormData);

        try {
          const response = await updateAPI.UpdateDailyAttendance(updatedFormData);

          if (response) {
            console.log(response);

            if (response[0].InfoField == "Updated" && response[0].ActionType === 0) {
              toast.success("Attendance Updated successfully");
            } else {
              toast.warning("Failed to Update Attendance");
            }
          }
        } catch (error) {
          console.error(error);
          toast.error("Error updating employee");
        }
      }
    }
  };

  const handleUpdateDate = (e) => {
    const selectedDate = new Date(e.target.value);
    const formattedDate = `${selectedDate.getDate().toString().padStart(2, "0")}-${(selectedDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${selectedDate.getFullYear()}`;
    setDate(formattedDate);
  };

  const handleUpdate = async (userdata) => {
    console.log(formData);

    if (userdata) {
      const updatedFormData = {
        ...formData,
        ActionType: userdata.ActionType,
        AdvAmt: userdata.AdvAmt,
        AttDate: userdata.AttDate,
        AttDateStr: userdata.AttDateStr,
        AttDys: userdata.AttDys,
        AttFullMins: userdata.AttFullMins,
        AttMstAmt: userdata.AttMstAmt,
        AttType2: userdata.AttType2,
        AttValue: userdata.AttValue,
        AttWHMS: userdata.AttWHMS,
        AttWHrs: userdata.AttWHrs,
        AttWMins: userdata.AttWMins,
        AttWSecs: userdata.AttWSecs,
        ChkRollAttID: userdata.ChkRollAttID,
        Department: userdata.Department,
        EmpAutoId: userdata.EmpAutoId,
        EmpCode: userdata.EmpCode,
        EmployeeName: userdata.EmployeeName,
        FTime: userdata.FTime,
        FullHMS: userdata.FullHMS,
        FullMins: userdata.FullMins,
        FullSec: userdata.FullSec,
        FullWHrs: userdata.FullWHrs,
        FullWMins: userdata.FullWMins,
        FullWSecs: userdata.FullWSecs,
        JOName: userdata.JOName,
        JONo: userdata.JONo,
        OTAmt: userdata.OTAmt,
        OTFullMins: userdata.OTFullMins,
        OTHMS: userdata.OTHMS,
        OTWHrs: userdata.OTWHrs,
        OTWMins: userdata.OTWMins,
        OTWSecs: userdata.OTWSecs,
        OrgAutoID: userdata.OrgAutoID,
        PAYID: userdata.PAYID,
        ToTime: userdata.ToTime,
      };
      setFormData(updatedFormData);

      try {
        const response = await updateAPI.UpdateDailyAttendance(updatedFormData);

        if (response) {
          if (response.ActionType === 0) {
            toast.success("Employee Updated successfully");
          } else {
            toast.warning("Failed to Update Employee");
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Error updating employee");
      }
    }
  };

  const handleAPI = async () => {
    try {
      const response = await updateAPI.UpdateDailyAttendance(formData);

      if (response) {
        console.log(response[0].InfoField);

        if (response[0].InfoField == "Updated" && response[0].ActionType === 0) {
          toast.success("Employee Updated successfully");
        } else {
          toast.warning("Failed to Update Employee");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="min-h-screen rounded-md w-full  lg:w-4/5 bg-slate-100 mt-20 lg:mt-12 mx-auto mb-2 p-8 lg:p-0 Boxcard">
        {loading && <Spinner />}
        <div className="w-full rounded-md flex justify-between bg-green-400 mx-auto text-black font-semibold text-xl text-center border-b-4 border-slate-100 px-3 py-4">
          <BackButton />
          Daily Attendence
        </div>
        <div className="flex justify-center items-center">
          <div className="w-full lg:mt-5">
            {/* Search Bar */}
            <div className="flex items-center flex-col md:flex-row gap-2 justify-center">
              <div className="my-2 flex md:w-fit w-[90%] flex-col justify-start items-center">
                <label htmlFor="dateInput" className="w-full font-semibold">
                  Date
                </label>
                <input
                  id="dateInput"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => handleUpdateDate(e)}
                  className="bg-white input-primary w-full rounded-md px-4 py-2"
                />
              </div>
              <div className="md:hidden w-[90%] flex flex-row mb-2">
                <button
                  className="flex-1 lg:ml-0 md:w-28 bg-primary text-white md:px-4 md:py-2 px-1 py-2 rounded-md lg:mb-0 mr-2"
                  onClick={handleRefresh}
                >
                  Refresh
                </button>
                <button
                  className="flex-1 ml-2 lg:ml-0 md:w-28 bg-info text-white md:px-4 md:py-2 px-1 py-2 rounded-md lg:mb-0"
                  onClick={handleOption}
                >
                  More Option
                </button>
              </div>

              <div className="hidden md:block">
                <div className="my-2 flex flex-col justify-start items-center">
                  <label htmlFor="reportType" className="w-full font-semibold">
                    Report Type
                  </label>
                  <select id="reportType" className="bg-white max-w-60 w-full select-primary rounded-md px-4 py-2">
                    <option value="">Select a report type</option>
                    <option value="daily">Daily Attendence Report </option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="hidden md:block w-full mb-2">
              <div className="flex lg:w-full md:justify-end justify-center mt-8">
                <div className="lg:flex justify-center lg:flex-row w-full lg:space-x-4 space-x-2">
                  <button
                    className="w-full ml-2 lg:ml-0 md:w-28 bg-primary text-white md:px-4 md:py-2 px-1 py-2 rounded-md mb-2 lg:mb-0"
                    onClick={handleRefresh}
                  >
                    Refresh
                  </button>
                  <button
                    className="w-full  md:w-28 bg-info text-white md:px-4 md:py-2 px-1 py-2 rounded-md mb-2 lg:mb-0"
                    onClick={handlePrint}
                  >
                    Print
                  </button>
                  <button
                    className="w-full  md:w-28 bg-error text-white md:px-4 md:py-2 px-1 py-2 rounded-md mb-2 lg:mb-0"
                    onClick={handleMail}
                  >
                    Send Mail
                  </button>
                  <button className="w-full  md:w-28 bg-success text-white md:px-4 md:py-2 px-1 py-2 rounded-md" onClick={handleClose}>
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap bg-info">
              <div className="sm:w-1/2 w-full mx-auto flex items-center justify-start text-white font-semibold text-xl text-center px-2 py-1">
                <div className="flex justify-center items-center">{dateStr ? dateStr : ""}</div>
              </div>
              <div className="sm:w-1/2 w-full mx-auto text-white font-semibold text-xl text-center px-2 py-1">
                <div className="flex items-center">
                  <label htmlFor="noOfAtt" className="mr-2 font-semibold">
                    NofAtt
                  </label>
                  <input id="noOfAtt" type="text" value="1" className="border-2 w-full text-red-500 input-primary px-2 py-1 rounded-md" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="flex md:flex-row flex-col max-h-96 overflow-y-auto ">
              <div className="grid md:hidden grid-cols-1 w-full gap-6">
                <table className="bg-white table w-full border border-gray-600 rounded-xl shadow-md mt-2">
                  <thead className="bg-primary sticky top-0">
                    <tr>
                      <th className="py-1 px-2 text-left border border-gray-600 text-md font-bold text-black">Employee</th>
                      <th className="py-1 px-2 text-left border w-fit border-gray-600 text-md font-bold text-black">WorkType</th>
                      <th className="py-1 px-2 text-left border border-gray-600 text-md font-bold text-black">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {attendenceList &&
                      attendenceList.map((EmpList, index) => (
                        <tr key={EmpList.EmpAutoId}>
                          <td className="py-1 px-2  whitespace-nowrap border border-gray-600">
                            <div className="text-black font-semibold mb-1">{EmpList.EmpCode}</div>
                            <div className="text-black w-fit font-semibold">{EmpList.EmployeeName}</div>
                          </td>
                          <td className="py-1 px-2  whitespace-nowrap border border-gray-600">
                            <input
                              type="text"
                              value={EmpList.AttType1}
                              onChange={(e) => handleInputChange(e, index, "AttType1")}
                              className={`text-xs input-primary w-fit max-w-14 px-1 py-1 font-medium ${
                                EmpList.AttType1 === "P" ? "text-green-500" : EmpList.AttType1 === "AB" ? "text-red-500" : "text-blue-500"
                              }`}
                            />
                          </td>
                          <td className="py-1 px-2  whitespace-nowrap flex items-center border border-b-0 border-gray-600">
                            <button type="button" onClick={() => handleShowFormModal(EmpList)}>
                              <Image src={dailyIcon} height={100} width={100} className="size-10" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="hidden md:block lg:block w-full mb-2 ">
                <div className="max-h-[400px]  w-full overflow-y-auto">
                  <table className="bg-white border w-full border-gray-600 rounded-xl shadow-md mt-2">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="py-1 px-2  text-left border border-gray-600 text-md font-bold text-black ">Emp Code</th>
                        <th className="py-1 px-2 text-left  bottom-1 text-md font-bold text-black">EmployeeName</th>
                        <th className="py-1 px-2 text-left  text-xs font-medium text-gray-500"></th>
                        <th className="py-1 px-2 text-left border border-gray-600 text-md font-bold text-black">WorkType</th>
                        <th className="py-1 px-2 text-left border border-gray-600 text-md font-bold text-black">No Of Att</th>
                        <th className="py-1 px-2 text-left border border-gray-600 text-md font-bold text-black">Amount</th>
                        <th className="py-1 px-2 text-left border border-gray-600 text-md font-bold text-black">Action</th>
                        <th className="py-1 px-2 text-left border border-gray-600 text-md font-bold text-black">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {attendenceList &&
                        attendenceList.map((EmpList, index) => (
                          <tr key={EmpList.EmpAutoId}>
                            <td className="py-1 px-2  border border-gray-600  whitespace-nowrap">{EmpList.EmpCode}</td>
                            <td className="py-1 px-2 border border-gray-600 whitespace-nowrap" colSpan="2">
                              <div className="flex items-center">
                                <Image
                                  src={AvatarImage}
                                  alt={EmpList.EmployeeName}
                                  className="h-8 w-8 rounded-full mr-2"
                                  width={8}
                                  height={8}
                                />
                                <span className="text-xs font-medium">{EmpList.EmployeeName}</span>
                              </div>
                            </td>
                            <td className="py-1 px-2 border border-gray-600 whitespace-nowrap">
                              <input
                                type="text"
                                value={EmpList.AttType1}
                                onChange={(e) => handleInputChange(e, index, "AttType1")}
                                className={`text-xs input-primary  w-20 px-1 py-1 font-medium ${
                                  EmpList.AttType1 === "P" ? "text-green-500" : EmpList.AttType1 === "AB" ? "text-red-500" : "text-blue-500"
                                }`}
                              />
                            </td>
                            <td className="py-1 px-2 border border-gray-600 whitespace-nowrap">
                              <input
                                type="text"
                                value={EmpList.AttValueStr}
                                onChange={(e) => handleInputChange(e, index, "AttValueStr")}
                                className="input-primary w-20  px-1 py-1"
                              />
                            </td>
                            <td className="py-1 px-2 border border-gray-600 whitespace-nowrap">
                              <input
                                type="text"
                                value={EmpList.AttAmt}
                                onChange={(e) => handleInputChange(e, index, "AttAmt")}
                                className=" input-primary w-32  px-1 py-1"
                              />
                            </td>

                            <td className="py-1 px-2 border border-gray-600 whitespace-nowrap">
                              <button type="button" onClick={() => handleShowFormModal(EmpList)}>
                                <Image src={dailyIcon} height={100} width={100} className="size-10" />
                              </button>
                            </td>
                            <td className="py-1 px-2 border border-gray-600 whitespace-nowrap">
                              <input
                                type="text"
                                value={EmpList.Remarks}
                                onChange={(e) => handleInputChange(e, index, "Remarks")}
                                className=" input-primary w-32  px-1 py-1"
                              />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showForm && modalData && (
        <div className="modal-content">
          <div
            id="default-modal"
            aria-hidden="true"
            className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0"
          >
            <div className="relative p-4 w-full h-screen flex justify-center items-center max-w-screen max-h-screen">
              <div className="absolute inset-0 bg-black opacity-35 w-full h-full"></div>
              <div className="relative bg-white z-[100000] w-full md:w-fit md:min-w-[80%] rounded-lg shadow-xl">
                <div className="flex items-center w-full p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                  <h3 className="text-xl w-full font-semibold text-center mx-auto text-gray-900">Update Attendance</h3>
                  <button
                    type="button"
                    onClick={handlCloseShowFormModal}
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    data-modal-hide="default-modal"
                  >
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>
                <div className="p-4 md:p-5 space-y-4">
                  <AttendanceForm extraDuty={extradutyData} setUpdated={setUpdated} updated={updated} modalData={modalData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 mt-4 opacity-1 flex items-center justify-center">
          <div className="bg-gray-100 relative bottom-3 -mt-5 max-h-screen overflow-auto shadow-md shadow-gray-400 p-8 rounded-lg text-center">
            <button className="bg-red-500  absolute top-0 right-3  rounded-md mt-4 px-4 py-2  text-white" onClick={handleOption}>
              <IoMdClose />
            </button>
            <div className="lg:flex items-center justify-center">
              <div className="lg:flex flex-col md:flex-row items-center mb-4 lg:mb-0 lg:mr-4">
                <div className="flex flex-col">
                  <label htmlFor="reportType" className="mb-1 mr-2 font-semibold">
                    Report Type
                  </label>
                  <select
                    id="reportType"
                    className="bg-white border-2 w-full border-gray-300 focus:outline-none  focus:border-blue-500 rounded-md px-4 py-2"
                  >
                    <option value="">Select a report type</option>
                    <option value="daily">Daily Attendence Report </option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex lg::w-full md:justify-end justify-center mt-5">
              <div className="lg:flex justify-center lg:flex-row w-full lg:space-x-4 space-x-2">
                <button
                  className="w-full ml-2  md:w-28 bg-blue-500 text-white md:px-4 md:py-2 px-1 py-2 rounded-md mb-2 lg:mb-0"
                  onClick={handlePrint}
                >
                  Print
                </button>
                <button
                  className="w-full  md:w-28 bg-red-500 text-white md:px-4 md:py-2 px-1 py-2 rounded-md mb-2 lg:mb-0"
                  onClick={handleMail}
                >
                  Send Mail
                </button>
                <button className="w-full  md:w-28 bg-green-500 text-white md:px-4 md:py-2 px-1 py-2 rounded-md" onClick={handleClose}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DailyAttendence;
