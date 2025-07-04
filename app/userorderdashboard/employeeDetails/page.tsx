// @ts-nocheck
"use client";
import { useModal } from "@/Provider";
import { ListApi, UpdateAPI } from "@/app/utils/api";
import BackButton from "@/components/BackButton";
import CustomModal from "@/components/Modal";
import { Spinner } from "@/components/Spinner";
import { EmpAttendanceType } from "@/types";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import AvatarImage from "../../../public/images/avatar.png";
import AttendanceModal from "./_components/Attendance";
import EmployeeAttnList from "./_components/EmployeeList";

interface EmpMstrType {
  EMPAUTOID: number | null;
  EmployeeSlNo: number | null;
  EMPCODE: string | null;
  EmployeeName: string | null;
  FatherName: string | null;
  DateofBirthStr: string | null;
  Gender: string | null;
  MOBILENO: string | null;
  EmployeeType: string | null;
  Designation: string | null;
  Department: string | null;
  DOFJOINStr: string | null;
  PhoneNo: string | null;
  EmailAddress: string | null;
  PANNo: string | null;
  ADHARNO: string | null;
  BalAmt: number | null;
  EMPIdentity: string | null;
  PrsAddress0: string | null;
  PrsAddress1: string | null;
  PrsAddress2: string | null;
  PrsDistrict: string | null;
  PrsPIN: string | null;
  PrsState: string | null;
  PerAddress0: string | null;
  PerAddress1: string | null;
  PerAddress2: string | null;
  PerDISTRICT: string | null;
  PerPIN: string | null;
  PerState: string | null;
  SalaryType: number | null;
  BasicRate: number | null;
  OTEMPYN: boolean | null;
  Qualification: string | null;
  Referance1: string | null;
  DOFLeavingStr: string | null;
  Remarks: string | null;
  DRPYN: boolean | null;
}

const EmployeeDetails = () => {
  const [employeeMasterList, setEmployeeMasterList] = useState<EmpMstrType[]>([]);
  const listAPI = new ListApi();
  const updateAPI = new UpdateAPI();
  const { setClose, isOpen, setOpen } = useModal();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [formData, setFormData] = useState<EmpMstrType>(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendenceData] = useState<EmpAttendanceType>([]);

  const session = useSession();

  const currentDate = new Date();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonthName = monthNames[currentDate.getMonth()];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await listAPI.getEmployeeMasterBalanceList();
      if (response) {
        setLoading(false);
        setEmployeeMasterList(response);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [session.data?.user.name]);

  const handleRowSelect = (item: EmpMstrType) => {
    setSelectedItem(item.EMPAUTOID);
  };

  const handleMonthChange = (selectedMonth) => {
    setSelectedMonth(selectedMonth);
  };

  const handleCloseModal = () => {
    setFormData([]);
    setShowModal(false);
  };

  const handleData = async (Emplist) => {
    console.log(Emplist);

    setFormData({
      EMPAUTOID: Emplist.EMPAUTOID,
      EmployeeSlNo: Emplist.EmployeeSlNo,
      EMPCODE: Emplist.EMPCODE,
      EmployeeName: Emplist.EmployeeName,
      FatherName: Emplist.FatherName,
      DateofBirthStr: Emplist.DateofBirthStr,
      Gender: Emplist.Gender,
      MOBILENO: Emplist.MOBILENO,
      EmployeeType: Emplist.EmployeeType,
      Designation: Emplist.Designation,
      Department: Emplist.Department,
      DOFJOINStr: Emplist.DOFJOINStr,
      PhoneNo: Emplist.PhoneNo,
      EmailAddress: Emplist.EmailAddress,
      PANNo: Emplist.PANNo,
      ADHARNO: Emplist.ADHARNO,
      BalAmt: Emplist.BalAmt,
      EMPIdentity: Emplist.EMPIdentity,
      PrsAddress0: Emplist.PrsAddress0,
      PrsAddress1: Emplist.PrsAddress1,
      PrsAddress2: Emplist.PrsAddress2,
      PrsDistrict: Emplist.PrsDistrict,
      PrsPIN: Emplist.PrsPIN,
      PrsState: Emplist.PrsState,
      PerAddress0: Emplist.PerAddress0,
      PerAddress1: Emplist.PerAddress1,
      PerAddress2: Emplist.PerAddress2,
      PerDISTRICT: Emplist.PerDISTRICT,
      PerPIN: Emplist.PerPIN,
      PerState: Emplist.PerState,
      SalaryType: Emplist.SalaryType,
      BasicRate: Emplist.BasicRate,
      OTEMPYN: Emplist.OTEMPYN,
      Qualification: Emplist.Qualification,
      Referance1: Emplist.Referance1,
      DOFLeavingStr: Emplist.DOFLeavingStr,
      Remarks: Emplist.Remarks,
      DRPYN: Emplist.DRPYN,
    });

    setShowModal(true);
  };

  const handleRefresh = () => {};

  const handleAttendance = async (Emplist) => {
    setOpen();
    setFormData({
      ...formData,
      EMPAUTOID: Emplist?.EMPAUTOID,
      EmployeeName: Emplist?.EmployeeName,
      EMPCODE: Emplist?.EMPCODE,
    });
  };

  const filteredList = employeeMasterList.filter((EmpList) => {
    const searchText = searchTerm.toLowerCase();
    return (
      EmpList.EMPCODE.toLowerCase().includes(searchText) ||
      EmpList.EmployeeName.toLowerCase().includes(searchText) ||
      String(EmpList.DRPYN).toLowerCase().includes(searchText)
    );
  });

  const listToRender = filteredList ? filteredList : employeeMasterList;

  return (
    <>
      <div className="min-h-screen rounded-md w-full lg:w-4/5 bg-slate-100 lg:mt-12 mt-24 mx-auto p-4 lg:p-0">
        {loading && <Spinner />}
        {isOpen && (
          <CustomModal
            children={
              <AttendanceModal
                EmpAutoid={formData?.EMPAUTOID}
                EmpName={formData?.EmployeeName}
                userCode={formData?.EMPCODE}
                Month={selectedMonth}
              />
            }
            title="Attendance"
          ></CustomModal>
        )}
        <div className="w-full rounded-md bg-white shadow-xl flex justify-between mx-auto font-semibold text-xl text-center border-slate-100 px-3 py-4">
          <BackButton />
          Employee Details
        </div>
        <div className="flex justify-center items-center">
          <div className="w-full mt-2">
            {/* Search Bar */}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Search by Code/ Name / Drop Type"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className=" input-primary rounded-md px-4 py-2 mb-1 w-full"
              />
              <button className="px-3 py-2 md:px-4 md:py-3 md:w-64 font-semibold rounded-md btn btn-primary">Search</button>
            </div>

            {/* Table */}
            <div className="flex md:flex-row flex-col ">
              <div className="grid md:hidden mt-6 grid-cols-1 gap-6 px-2 sm:grid-cols-2 lg:grid-cols-1 max-h-96 overflow-y-auto">
                {listToRender &&
                  listToRender.map((EmpList, index) => (
                    <div
                      key={EmpList.EMPAUTOID}
                      className="bg-white shadow-md border border-blue-300 rounded-lg overflow-hidden"
                      style={{
                        boxShadow: "5px 5px 15px 10px rgba(173, 216, 230, 0.9)",
                      }}
                    >
                      <div className="p-4 flex items-center justify-between text-center">
                        <div>
                          <p className="text-gray-700 flex text-lg  font-medium  mb-2">Code: {EmpList.EMPCODE}</p>
                          <p className="text-gray-700 text-lg flex font-medium mb-2">Sl.No: {EmpList.EmployeeSlNo}</p>
                          <p className="text-gray-700 text-lg flex font-medium mb-2">
                            Dropped:
                            {EmpList.DRPYN ? (
                              <span className="px-2 inline-flex text-lg font-semibold rounded-md text-center m-0 bg-green-100  text-error">
                                Inactive
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-lg font-semibold rounded-md text-center m-0 bg-red-100 text-success">
                                Active
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <Image
                            src={AvatarImage}
                            alt={EmpList.EmployeeName}
                            className="mx-auto h-16 w-16 rounded-full mb-4"
                            width={16}
                            height={16}
                          />
                        </div>
                      </div>
                      <h4 className=" text-xl text-center font-extrabold my-1">{EmpList.EmployeeName}</h4>
                      <div className="p-3">
                        <div className={`p-1 text-center whitespace-nowrap text-white ${EmpList.BalAmt < 0 ? "bg-error" : "bg-success"}`}>
                          <p className="text-white text-lg font-bold">Balance Amount: {EmpList.BalAmt}</p>
                        </div>
                        <div className="flex justify-between w-full mt-1">
                          <button
                            onClick={() => handleData(EmpList)} // Replace openModalFunction with the actual function to open the modal
                            className=" btn btn-primary rounded-md"
                          >
                            More
                          </button>
                          <button
                            onClick={() => handleAttendance(EmpList)} // Replace openModalFunction with the actual function to open the modal
                            className=" btn btn-primary rounded-md"
                          >
                            Attendance
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="hidden md:block w-full lg:block overflow-x-auto ">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className=" table rounded-xl shadow-md mt-2">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-medium text-warning-content">Code</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-warning-content">Sl.No</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-warning-content">EmployeeName</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-warning-content">BalanceAmount</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-warning-content"></th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-warning-content">Dropped</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-warning-content">Details</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-warning-content"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {listToRender.map((EmpList, index) => (
                        <tr key={EmpList.EMPAUTOID}>
                          <td className="py-4 px-6 whitespace-nowrap">{EmpList.EMPCODE}</td>
                          <td className="py-4 px-6 whitespace-nowrap">{EmpList.EmployeeSlNo}</td>
                          <td className="py-4 px-6 whitespace-nowrap" colSpan="2">
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
                          <td className={`py-4 px-6 whitespace-nowrap text-white ${EmpList.BalAmt <= 0 ? "bg-error" : "bg-success"}`}>
                            {EmpList.BalAmt}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            {EmpList.DRPYN ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-error">Inactive</span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-success">Active</span>
                            )}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <button
                              onClick={() => handleData(EmpList)} // Replace openModalFunction with the actual function to open the modal
                              className=" btn btn-primary rounded-md px-2 py-2"
                            >
                              More
                            </button>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <button
                              onClick={() => handleAttendance(EmpList)} // Replace openModalFunction with the actual function to open the modal
                              className=" btn btn-primary rounded-md px-2 py-2"
                            >
                              Attendance
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
        </div>
      </div>

      {showModal && (
        <div className="fixed  inset-0 z-50 mt-4  customHeightModalNew opacity-1 flex items-center justify-center">
          <div className="bg-gray-100  customScrolling relative bottom-3 -mt-5 customHeightModal shadow-md shadow-gray-400 p-8 rounded-lg text-center">
            <div className="w-full rounded-md mx-auto bg-primary font-semibold text-xl text-center border-b-4 border-slate-100 px-3 py-4">
              Sallary/Daily Wages Payment
            </div>
            <button className="bg-red-500  absolute top-0 right-3  rounded-md mt-4 px-4 py-2  text-white" onClick={handleCloseModal}>
              <IoMdClose />
            </button>

            <div className="w-full mb-4">
              <div className="flex flex-wrap mb-3">
                <label className="text-white  px-2 py-2 bg-info rounded-md mr-2 lg:mb-0 mb-2">EmpCode:</label>
                <input
                  type="text"
                  className="border rounded-md shadow-md py-2 pl-2 input-primary mr-0 lg:mr-3 lg:mb-0 mb-2 w-full lg:w-auto"
                  value={formData?.EMPCODE as string}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...(prevData as EmpMstrType),
                      EMPCODE: e.target.value,
                    }))
                  }
                />
                <input
                  type="text"
                  className="border rounded-md shadow-md lg:mr-2 mr-0 py-2 pl-2 input-primary lg:mb-0 mb-2 w-full lg:w-auto"
                  value={formData?.EmployeeName as string}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...(prevData as EmpMstrType),
                      EmployeeName: e.target.value,
                    }))
                  }
                />
                <label className={`text-white px-2 py-2 rounded-md mt-2 lg:mt-0 mr-2 ${formData?.DRPYN ? "bg-error" : "bg-success"}`}>
                  {formData?.DRPYN ? "INACTIVE" : "ACTIVE"}
                </label>
              </div>
              <div className="flex flex-wrap mb-3">
                <label className="text-white px-2 py-2 bg-info rounded-md mr-2 lg:mb-0 mb-2">Date of Join</label>
                <input
                  type="text"
                  className="border rounded-md shadow-md py-2 pl-2 input-primary mr-0 lg:mr-3 lg:mb-0 mb-2 w-full lg:w-auto"
                  value={formData?.DOFJOINStr as string}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...(prevData as EmpMstrType),
                      DOFJOINStr: e.target.value,
                    }))
                  }
                />
                <input
                  type="text"
                  className="border rounded-md shadow-md lg:mr-2 mr-0 py-2 pl-2 input-primary bg-primary lg:mb-0 mb-2 w-full lg:w-auto"
                  value={formData?.BasicRate as number}
                />
                <label
                  className={`px-2 text-white py-2 rounded-md mt-2 lg:mt-0 mr-2 ${
                    formData?.SalaryType === 1 ? "bg-error" : formData?.SalaryType === 0 ? "bg-success" : ""
                  }`}
                >
                  {formData?.SalaryType === 1 ? "Daily" : formData?.SalaryType === 0 ? "Monthly" : ""}
                </label>
              </div>
              <div className="flex flex-wrap">
                <label className="text-white px-2 py-2 bg-info rounded-md mr-2 lg:mb-0 mb-2">Amount</label>
                <input
                  type="text"
                  className="border rounded-md shadow-md py-2 pl-2 input-primary mr-0 lg:mr-3 lg:mb-0 mb-2 w-full lg:w-auto"
                  value={formData?.BalAmt as number}
                />
                <label className="text-white px-2 py-2 bg-info rounded-md mr-2 lg:mb-0 mb-2">Month</label>
                <select
                  className="border rounded-md w-full lg:w-40 shadow-md py-2 pl-2 input-primary mr-0 lg:mr-3 lg:mb-0 mb-2"
                  value={selectedMonth ? selectedMonth : currentMonthName}
                  onChange={(e) => handleMonthChange(e.target.value)}
                >
                  <option value="">Select a month</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>

                <button className="border rounded-md shadow-md w-full lg:w-40 py-2 px-4 btn btn-primary" onClick={handleRefresh}>
                  Refresh
                </button>
              </div>
            </div>

            <EmployeeAttnList EmpAutoid={formData?.EMPAUTOID} Month={selectedMonth} />
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeDetails;
