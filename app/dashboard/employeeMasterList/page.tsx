// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { IoMdClose } from "react-icons/io";
import { Sidebar } from "@/components/salesman/Sidebar";
import { signIn, signOut, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { ListApi, UpdateAPI } from "@/app/utils/api";
import Image from "next/image";
import AvatarImage from "../../../public/images/avatar.png";
import BackButton from "@/components/BackButton";

const EmployeeMasterList = () => {
    const listAPI = new ListApi();
    const updateAPI = new UpdateAPI();
    const [employeeMasterList, setEmployeeMasterList] = useState<EmpMstrType[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<number | null>(null);
    const [formData, setFormData] = useState<EmpMstrType>(null);
    const [selectedOPeration, setSelectedOPeration] = useState("");

    const router = useRouter();
    // console.log("Router Object:", router);

    const session = useSession();

    const searchParams = useSearchParams();

    const DateVal = searchParams.get("date");

    useEffect(() => {
        const fetchData = async () => {
            if (session.data?.user.role === "admin") {
                try {
                    const response = await listAPI.getEmployeeMasterListView();

                    if (response) {
                        console.log("Response Today Order ADMIN ", response);
                        // Ensure responseData is an array before setting stockList
                        setEmployeeMasterList(response);
                    }
                } catch (error) {
                    console.error(error);
                }
            } else {
                try {
                    const storedUserYear = localStorage.getItem("UserYear");

                    if (storedUserYear) {
                        const parts = storedUserYear.split("_");
                        const year = parts[1];

                        const response = await fetch("/api/getPaymentMasterList", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                title: "GetOrderPaymentMasterList",
                                description: "demo",
                            }),
                        });

                        if (response.ok) {
                            // Handle the response data here
                            const responseData = await response.json();

                            console.log("Response Today ORder salesman", responseData);
                            // Ensure responseData is an array before setting stockList
                            setTodayPaymentList(responseData.userdata);
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        };
        fetchData();
    }, [session.data?.user.role, searchParams, DateVal]);

    console.log(employeeMasterList);

    interface EmpMstrType {
        EMPAUTOID: number | null;
        ActionType: number | null;
        EmployeeSlNo: number | null;
        EMPCODE: string | null;
        EmployeeName: string | null;
        FatherName: string | null;
        DateofBirth: string | null;
        DateofBirthStr: string | null;
        Gender: string | null;
        MOBILENO: string | null;
        EmployeeType: string | null;
        Designation: string | null;
        Department: string | null;
        DOFJOIN: string | null;
        DOFJOINStr: string | null;
        PhoneNo: string | null;
        EmailAddress: string | null;
        OrgAutoID: string | null;
        PANNo: string | null;
        ADHARNO: string | null;
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
        DOFLeaving: string | null;
        DOFLeavingStr: string | null;
        Remarks: string | null;
        DRPYN: boolean | null;
        ORDERBY: null;
        QRYSTR: string | null;
    }

    //   const handleItem = (item:OrderItemType) => {

    //     const combinedInfo = `${item.PaymentID}`;

    //      router.push(`/newpayment/${combinedInfo}`)

    //   };

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-based
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleDateOfBirthChange = (e) => {
        const selectedDate = e.target.value;
        const formattedDate = formatDate(selectedDate);
        setFormData((prevData) => ({
            ...prevData,
            DateofBirthStr: formattedDate,
        }));
    };

    const handleRowSelect = (item: EmpMstrType) => {
        // Use the callback function to work with the latest state
        //console.log(item.EMPAUTOID);
        setSelectedItem(item.EMPAUTOID);
    };

    const handleAddNew = async () => {
        setSelectedOPeration("AddNew");
        try {
            const response = await listAPI.addNewEmpMasterList("0");

            if (response) {
                console.log(response);

                setFormData({
                    EMPAUTOID: response[0].EMPAUTOID,
                    ActionType: response[0].ActionType,
                    EmployeeSlNo: response[0].EmployeeSlNo,
                    EMPCODE: response[0].EMPCODE,
                    EmployeeName: response[0].EmployeeName,
                    FatherName: response[0].FatherName,
                    DateofBirth: response[0].DateofBirth,
                    DateofBirthStr: response[0].DateofBirthStr,
                    Gender: response[0].Gender,
                    MOBILENO: response[0].MOBILENO,
                    EmployeeType: response[0].EmployeeType,
                    Designation: response[0].Designation,
                    Department: response[0].Department,
                    DOFJOIN: response[0].DOFJOIN,
                    DOFJOINStr: response[0].DOFJOINStr,
                    PhoneNo: response[0].PhoneNo,
                    EmailAddress: response[0].EmailAddress,
                    PANNo: response[0].PANNo,
                    ADHARNO: response[0].ADHARNO,
                    EMPIdentity: response[0].EMPIdentity,
                    PrsAddress0: response[0].PrsAddress0,
                    PrsAddress1: response[0].PrsAddress1,
                    PrsAddress2: response[0].PrsAddress2,
                    PrsDistrict: response[0].PrsDistrict,
                    PrsPIN: response[0].PrsPIN,
                    PrsState: response[0].PrsState,
                    PerAddress0: response[0].PerAddress0,
                    PerAddress1: response[0].PerAddress1,
                    PerAddress2: response[0].PerAddress2,
                    PerDISTRICT: response[0].PerDISTRICT,
                    PerPIN: response[0].PerPIN,
                    PerState: response[0].PerState,
                    SalaryType: response[0].SalaryType,
                    BasicRate: response[0].BasicRate,
                    OTEMPYN: response[0].OTEMPYN,
                    Qualification: response[0].Qualification,
                    Referance1: response[0].Referance1,
                    DOFLeaving: response[0].DOFLeaving,
                    DOFLeavingStr: response[0].DOFLeavingStr,
                    Remarks: response[0].Remarks,
                    DRPYN: response[0].DRPYN,
                    OrgAutoID: response[0].OrgAutoID,
                    QRYSTR: response[0].QRYSTR,
                    ORDERBY: response[0].ORDERBY,
                });

                setShowModal(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCloseModal = () => {
        setFormData([]);
        setShowModal(false);
    };

    const handleEdit = async (EMPAUTOID) => {
        setSelectedOPeration("Edit");
        try {
            const response = await listAPI.addNewEmpMasterList(EMPAUTOID);

            if (response) {
                console.log(response);

                const convertDateFormat = (dateStr) => {
                    const [day, month, year] = dateStr.split("-");
                    return `${year}-${month}-${day}`;
                };

                setFormData({
                    EMPAUTOID: response[0].EMPAUTOID,
                    ActionType: response[0].ActionType,
                    EmployeeSlNo: response[0].EmployeeSlNo,
                    EMPCODE: response[0].EMPCODE,
                    EmployeeName: response[0].EmployeeName,
                    FatherName: response[0].FatherName,
                    DateofBirth: response[0].DateofBirth,
                    DateofBirthStr: convertDateFormat(response[0].DateofBirthStr),
                    Gender: response[0].Gender,
                    MOBILENO: response[0].MOBILENO,
                    EmployeeType: response[0].EmployeeType,
                    Designation: response[0].Designation,
                    Department: response[0].Department,
                    DOFJOIN: response[0].DOFJOIN,
                    DOFJOINStr: response[0].DOFJOINStr,
                    PhoneNo: response[0].PhoneNo,
                    EmailAddress: response[0].EmailAddress,
                    PANNo: response[0].PANNo,
                    ADHARNO: response[0].ADHARNO,
                    EMPIdentity: response[0].EMPIdentity,
                    PrsAddress0: response[0].PrsAddress0,
                    PrsAddress1: response[0].PrsAddress1,
                    PrsAddress2: response[0].PrsAddress2,
                    PrsDistrict: response[0].PrsDistrict,
                    PrsPIN: response[0].PrsPIN,
                    PrsState: response[0].PrsState,
                    PerAddress0: response[0].PerAddress0,
                    PerAddress1: response[0].PerAddress1,
                    PerAddress2: response[0].PerAddress2,
                    PerDISTRICT: response[0].PerDISTRICT,
                    PerPIN: response[0].PerPIN,
                    PerState: response[0].PerState,
                    SalaryType: response[0].SalaryType,
                    BasicRate: response[0].BasicRate,
                    OTEMPYN: response[0].OTEMPYN,
                    Qualification: response[0].Qualification,
                    Referance1: response[0].Referance1,
                    DOFLeaving: response[0].DOFLeaving,
                    DOFLeavingStr: response[0].DOFLeavingStr,
                    Remarks: response[0].Remarks,
                    DRPYN: response[0].DRPYN,
                    OrgAutoID: response[0].OrgAutoID,
                    QRYSTR: response[0].QRYSTR,
                    ORDERBY: response[0].ORDERBY,
                });

                setShowModal(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = () => {};

    const handleClose = () => {};

    const handleSave = async () => {
        console.log(formData);

        // try {
        //   const response = await updateAPI.updateEmployeeMaster(formData);
        //   if (response) {
        //     console.log(response[0].InfoField);

        //     if (
        //       response[0].InfoField == "Updated" &&
        //       response[0].ActionType === 0
        //     ) {
        //       toast.success("Employee Updated successfully");
        //     } else {
        //       toast.warning("Failed to Update Employee");
        //     }
        //   }
        // } catch (error) {
        //   console.error(error);
        // }

        //setShowModal(false);
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
            <div className="min-h-screen rounded-md w-full lg:w-4/5 bg-slate-100 lg:mt-12 mt-28 mx-auto p-8 lg:p-0">
                <BackButton />
                <div className="w-full rounded-md bg-blue-500 mx-auto text-white font-semibold text-xl text-center border-b-4 border-slate-100 px-3 py-4 sticky top-0 z-10">
                    Staff Master
                </div>
                <div className="flex justify-center items-center">
                    <div className="w-full mt-16">
                        {/* Search Bar */}
                        <div className="lg:flex items-center sticky top-12 z-10">
                            <input
                                type="text"
                                placeholder="Search by Code/ Name / Drop Type"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className=" input-primary border-2  rounded-md px-4 py-2 mb-1 w-full"
                            />
                            <button className=" px-4 py-3 ml-2 md:w-64 font-semibold rounded-md btn btn-primary">
                                Search
                            </button>
                        </div>

                        {/* Buttons */}
                        <div className="flex lg:w-full md:justify-end justify-center mt-8 sticky bottom-0 z-10">
                            <div className="lg:flex justify-center lg:flex-row w-full lg:space-x-4 space-x-2">
                                <button
                                    className="w-full ml-2 md:w-28 btn btn-primary md:px-4 md:py-2 px-1 py-2 rounded-md mb-2 lg:mb-0"
                                    onClick={handleAddNew}
                                >
                                    Add New
                                </button>
                                <button
                                    className="w-full  md:w-28 btn btn-error md:px-4 md:py-2 px-1 py-2 rounded-md mb-2 lg:mb-0"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                                <button
                                    className="w-full  md:w-28 btn btn-info text-white md:px-4 md:py-2 px-1 py-2 rounded-md"
                                    onClick={handleClose}
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex md:flex-row flex-col ">
                            <div className="overflow-y-auto max-h-[500px]">
                                <div className="grid md:hidden mt-6 grid-cols-1 gap-6 px-2 sm:grid-cols-2 lg:grid-cols-1">
                                    {listToRender.map((EmpList, index) => (
                                        <div
                                            key={EmpList.EMPAUTOID}
                                            className="bg-white shadow-md border border-blue-100 rounded-lg overflow-hidden"
                                            style={{
                                                boxShadow: "5px 5px 15px 10px rgba(173, 216, 230, 0.9)",
                                            }}
                                        >
                                            <div className="p-4 text-center">
                                                <Image
                                                    src={AvatarImage}
                                                    alt={EmpList.EmployeeName}
                                                    className="mx-auto h-16 w-16 rounded-full mb-4"
                                                    width={16}
                                                    height={16}
                                                />
                                                <h4 className=" text-xl font-extrabold mt-2 mb-2">
                                                    {EmpList.EmployeeName}
                                                </h4>
                                            </div>
                                            <div className="p-4">
                                                <p className="text-gray-700 text-lg  font-bold  mb-2">
                                                    Code: {EmpList.EMPCODE}
                                                </p>
                                                <p className="text-gray-700 text-lg font-bold mb-2">
                                                    Sl.No: {EmpList.EmployeeSlNo}
                                                </p>
                                                <p className="text-gray-700 text-lg font-bold mb-2">
                                                    Father Name: {EmpList.FatherName}
                                                </p>
                                                <p className="text-gray-700 text-lg font-bold mb-2">
                                                    Mobile No: {EmpList.MOBILENO}
                                                </p>
                                                <p className="text-gray-700 text-lg font-bold mb-2">
                                                    Basic/Rate: {EmpList.BasicRate}
                                                </p>
                                                <p className="text-gray-700 text-lg font-bold mb-2">
                                                    Salary Type :{EmpList.SalaryType}
                                                </p>
                                                <p className="text-gray-700 text-lg font-bold mb-2">
                                                    Dropped:
                                                    {EmpList.DRPYN ? (
                                                        <span className="px-2 inline-flex text-lg leading-5 font-bold rounded-full text-error">
                                                            Inactive
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 inline-flex text-lg leading-5 font-bold rounded-full text-success">
                                                            Active
                                                        </span>
                                                    )}
                                                </p>
                                                <button
                                                    className=" text-white px-4 py-2 rounded btn btn-primary "
                                                    onClick={() => handleEdit(EmpList.EMPAUTOID)}
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="hidden md:block lg:block overflow-x-auto ">
                                <div className="max-h-[400px] overflow-y-auto">
                                    <table className=" table rounded-xl shadow-md mt-2">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="py-3 px-4 text-left text-xs font-medium text-warning-content">
                                                    Code
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-medium text-warning-content">
                                                    Sl.No
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-medium text-warning-content">
                                                    EmployeeName
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-medium text-warning-content"></th>
                                                <th className="py-3 px-4 text-left text-xs font-medium text-warning-content">
                                                    Father Name
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-medium text-warning-content">
                                                    Mobile No
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-medium text-warning-content">
                                                    Basic/Rate
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-medium text-warning-content">
                                                    Salary Type
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-medium text-warning-content">
                                                    Dropped
                                                </th>
                                                <th className="py-3 px-4 text-left text-xs font-medium text-warning-content ">
                                                    Action
                                                </th>
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
                                                            <span className="text-xs font-medium">
                                                                {EmpList.EmployeeName}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 whitespace-nowrap">{EmpList.FatherName}</td>
                                                    <td className="py-4 px-6 whitespace-nowrap">{EmpList.MOBILENO}</td>
                                                    <td className="py-4 px-6 whitespace-nowrap">{EmpList.BasicRate}</td>
                                                    <td className="py-4 px-6 whitespace-nowrap">{EmpList.SalaryType}</td>
                                                    <td className="py-4 px-6 whitespace-nowrap">
                                                        {EmpList.DRPYN ? (
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-error">
                                                                Inactive
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-success">
                                                                Active
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6 whitespace-nowrap">
                                                        <button
                                                            className="px-4 py-2 rounded btn btn-primary"
                                                            onClick={() => handleEdit(EmpList.EMPAUTOID)}
                                                        >
                                                            Edit
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
                        <div className="lg:w-96 w-full rounded-md bg-blue-500 mx-auto text-white font-semibold text-xl text-center border-b-4 border-slate-100 px-3 py-4">
                            Staff Master
                        </div>
                        <button
                            className="bg-red-500  absolute top-0 right-3  rounded-md mt-4 px-4 py-2  text-white"
                            onClick={handleCloseModal}
                        >
                            <IoMdClose />
                        </button>

                        <div className="lg:flex mt-8 ">
                            <div className="w-full lg:w-1/5 lg:order-last">
                                <div className="lg:mt-4">
                                    <div className="flex flex-col items-center h-full">
                                        <div className="lg:flex lg:flex-col items-center">
                                            {selectedOPeration === "AddNew" ? (
                                                <button
                                                    className="px-3 border rounded-md mr-2 lg:mr-0  lg:w-full btn btn-success shadow-md py-2  font-semibold"
                                                    onClick={handleSave}
                                                >
                                                    New Save
                                                </button>
                                            ) : (
                                                <button
                                                    className="px-3 border rounded-md lg:w-full mr-2 lg:mr-0  shadow-md py-2 btn btn-success font-semibold"
                                                    onClick={handleSave}
                                                >
                                                    Edit Save
                                                </button>
                                            )}
                                            <button
                                                onClick={handleCloseModal}
                                                className="px-3 border rounded-md lg:w-full mr-2 lg:mr-0   shadow-md py-2 btn btn-error font-semibold mt-2"
                                            >
                                                Quit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full lg:w-4/5  lg:order-first md:mt-2 max-h-96 overflow-y-auto ">
                                <div className="lg:flex">
                                    <div className="w-full lg:w-1/2 pl-4">
                                        <div className="md:flex items-center">
                                            <label className="text-gray-600 mr-2">EmployeeSlNo:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md shadow-md py-2 pl-2 input-primary  w-full"
                                                value={formData?.EmployeeSlNo as number}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        EmployeeSlNo: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2">EmpCode:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md input-primary shadow-md py-2 pl-2  w-full"
                                                value={formData?.EMPCODE as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        EMPCODE: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2">EmployeeName:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md shadow-md py-2 pl-2 input-primary w-full"
                                                value={formData?.EmployeeName as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        EmployeeName: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2">FatherName:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md input-primary shadow-md py-2 pl-2  w-full"
                                                value={formData?.FatherName as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        FatherName: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2">DateOfBirth:</label>
                                            <input
                                                type="date"
                                                className="rounded-md input-primary shadow-md py-2 pl-2  w-full"
                                                value={formData?.DateofBirthStr as string}
                                                onChange={handleDateOfBirthChange}
                                            />
                                        </div>
                                        <div className="md:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2">Gender:</label>
                                            <select
                                                className="input-primary px-4 py-2 rounded-md w-full"
                                                value={formData?.Gender as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        Gender: e.target.value,
                                                    }))
                                                }
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="md:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2">MobileNo:</label>
                                            <input
                                                type="text"
                                                className=" rounded-md  shadow-md py-2 pl-2 input-primary outline-none w-full"
                                                value={formData?.MOBILENO as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        MOBILENO: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2">Branch/Division:</label>
                                            <select
                                                className="input-primary px-4 py-2 rounded-md w-full"
                                                value={formData?.EmployeeType as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        EmployeeType: e.target.value,
                                                    }))
                                                }
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="md:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2">Designation:</label>
                                            <input
                                                type="text"
                                                className="input-primary rounded-md shadow-md py-2 pl-2  outline-none w-full"
                                                value={formData?.Designation as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        Designation: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2">Department:</label>
                                            <input
                                                type="text"
                                                className="input-primary rounded-md  shadow-md py-2 pl-2  outline-none w-full"
                                                value={formData?.Department as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        Department: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2">DateofJoin:</label>
                                            <input
                                                type="text"
                                                className=" rounded-md  shadow-md py-2 pl-2 input-primary  outline-none w-full"
                                                value={formData?.DOFJOINStr as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        DOFJOINStr: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2">PhoneNo:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full"
                                                value={formData?.PhoneNo as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        PhoneNo: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2">EmailAddress:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full"
                                                value={formData?.EmailAddress as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        EmailAddress: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2">PANNo:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full"
                                                value={formData?.PANNo as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        PANNo: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center mt-2">
                                            <label className="text-gray-600 text-left lg:w-48 mr-2">ADHARNo:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full"
                                                value={formData?.ADHARNO as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        ADHARNO: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2">DrivingLicenceNo:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full"
                                                value={formData?.EMPIdentity as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        EMPIdentity: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full lg:w-1/2 pl-4">
                                        <h2 className="text-lg font-semibold mb-2">Present Address</h2>
                                        <div className="md:flex items-center">
                                            <label className="text-gray-600 mr-2 mt-2">Address:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full mt-2"
                                                value={formData?.PrsAddress0 as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        PrsAddress0: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center">
                                            <label className="text-gray-600 mr-2 mt-2">Address1:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full mt-2"
                                                value={formData?.PrsAddress1 as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        PrsAddress1: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center">
                                            <label className="text-gray-600 mr-2 mt-2">Address2:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full mt-2"
                                                value={formData?.PrsAddress2 as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        PrsAddress2: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center">
                                            <label className="text-gray-600 mr-2 mt-2">District:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full mr-2 mt-2"
                                                value={formData?.PrsDistrict as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        PrsDistrict: e.target.value,
                                                    }))
                                                }
                                            />
                                            <label className="text-gray-600 mr-2 mt-2">Pin:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full mt-2"
                                                value={formData?.PrsPIN as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        PrsPIN: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center">
                                            <label className="text-gray-600 mr-2 mt-2">State:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full mt-2"
                                                value={formData?.PrsState as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        PrsState: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <h2 className="text-lg font-semibold mt-2 mb-2">Permanent Address</h2>
                                        <div className="md:flex items-center">
                                            <label className="text-gray-600 mr-2 mt-2">Address:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full mt-2"
                                                value={formData?.PerAddress0 as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        PerAddress0: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center">
                                            <label className="text-gray-600 mr-2 mt-2">Address1:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full mt-2"
                                                value={formData?.PerAddress1 as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        PerAddress1: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center">
                                            <label className="text-gray-600 mr-2 mt-2">Address2:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full mt-2"
                                                value={formData?.PerAddress2 as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        PerAddress2: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center">
                                            <label className="text-gray-600 mr-2 mt-2">District:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full mr-2 mt-2"
                                                value={formData?.PerDISTRICT as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        PerDISTRICT: e.target.value,
                                                    }))
                                                }
                                            />
                                            <label className="text-gray-600 mr-2 mt-2">Pin:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full mt-2"
                                                value={formData?.PerPIN as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        PerPIN: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center">
                                            <label className="text-gray-600 mr-2 mt-2">State:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full mt-2"
                                                value={formData?.PerState as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        PerState: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>

                                        <div className="md:flex items-center mt-3">
                                            <label className="text-gray-600 mr-2 mt-2">SalaryType:</label>
                                            <select
                                                className="border border-gray-300 focus:border-blue-500 px-4 py-2 mr-2 mt-2 rounded-md w-full"
                                                value={formData?.SalaryType as number}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        EmployeeSlNo: e.target.value,
                                                    }))
                                                }
                                            >
                                                <option value="0">Monthly Salary</option>
                                                <option value="1">Daily Wages</option>
                                            </select>
                                        </div>
                                        <div className="md:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2 mt-2">Basic/Rate:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-24 mr-2 mt-2"
                                                value={formData?.BasicRate as number}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        BasicRate: e.target.value,
                                                    }))
                                                }
                                            />

                                            <input
                                                type="checkbox"
                                                id="sameAsPermanent"
                                                checked={formData?.OTEMPYN as boolean}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        OTEMPYN: e.target.checked,
                                                    }))
                                                }
                                            />
                                            <label htmlFor="sameAsPermanent" className="text-gray-600 ml-2">
                                                Label To OT
                                            </label>
                                        </div>
                                        <div className="md:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2 mt-2">Qualification:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full mt-2"
                                                value={formData?.Qualification as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        Qualification: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2 mt-2">Reference1:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full mt-2"
                                                value={formData?.Referance1 as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        Referance1: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex sm:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2 mt-2">DateOfLeaving:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full mt-2"
                                                value={formData?.DOFLeavingStr as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        DOFLeavingStr: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex sm:flex items-center mt-2">
                                            <label className="text-gray-600 mr-2 mt-2">Reason:</label>
                                            <input
                                                type="text"
                                                className="border rounded-md border-slate-300 shadow-md py-2 pl-2 focus:border-blue-500 outline-none w-full mt-2"
                                                value={formData?.Remarks as string}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        Remarks: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="md:flex sm:flex items-center mt-2 mb-2">
                                            <label className="text-gray-600 mr-2 mt-2">Dropped:</label>
                                            <input
                                                type="checkbox"
                                                className="mt-2"
                                                id="sameAsPermanent"
                                                checked={formData?.DRPYN as boolean}
                                                onChange={(e) =>
                                                    setFormData((prevData) => ({
                                                        ...(prevData as EmpMstrType),
                                                        DRPYN: e.target.checked,
                                                    }))
                                                }
                                            />
                                            <label htmlFor="sameAsPermanent" className="text-gray-600 mt-2 ml-2">
                                                Yes
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EmployeeMasterList;
