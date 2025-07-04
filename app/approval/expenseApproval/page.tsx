// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ListApi, UpdateAPI } from "@/app/utils/api";
import { Spinner } from "@/components/Spinner";
import BackButton from "@/components/BackButton";
import { TodayExpenseInterface, NewExpenseInterface } from "@/types";
import { getNextDay, formatDate, formatDate2 } from "@/lib/helper-function";
import { useModal } from "@/Provider";
import CustomModal from "@/components/Modal";
import CreateExpense from "@/components/common/createExpense";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Image from "next/image";

import approve from "../../../public/images/svg/approve.svg";
import reject from "../../../public/images/svg/reject.svg";
import calendar from "../../../public/images/svg/Calendar.svg";
import { RiLoader2Fill } from "react-icons/ri";

const ExpenseApproval = () => {
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
    const [date, setDate] = useState<any>();
    const [userTypes, setUserTypes] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUserType, setSelectedUserType] = useState<string>("");
    const [selectedStatusType, setSelectedStatusType] = useState<number>(1);
    const [totalSum, setTotalSum] = useState("0");
    const [updatedDate, setUpdatedDate] = useState<any>(getNextDay());
    const [updatingDate, setUpdatingDate] = useState<any>(false);
    const [updatedDateItem, setUpdatedDateItem] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    const [newExpenseData, setNewExpenseData] = useState<NewExpenseInterface[]>([]);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);

    const fetchData = async () => {
        setLoading(true);

        if (session.data?.user.role === "admin") {
            const data = await listAPI.getDailyExpenseList("", selectedUserType, selectedStatusType);
            console.log(data, "result");
            if (data?.length > 0) {
                setTodayExpense(data);
                setLoading(false);
            } else {
                setFilteredExpenseList([]);
            }
            setLoading(false);
        } else {
            const data = await listAPI.getDailyExpenseList("", session?.data?.user?.name, selectedStatusType);
            if (data?.length > 0) {
                setTodayExpense(data);
                setLoading(false);
            } else {
                setFilteredExpenseList([]);
            }
            setLoading(false);
        }
    };

    const fetchByDate = async () => {
        // setLoading(true);
        const today = date ? formatDate2(date) : "";

        if (session.data?.user.role === "admin") {
            if ((selectedStatusType === 0 && today === "") || (selectedStatusType === 2 && today === ""))
                return toast.warn("Please select a date");
            setLoading(true);
            const data = await listAPI.getDailyExpenseList(today, selectedUserType, selectedStatusType);
            if (data?.length > 0) {
                setTodayExpense(data);
                setLoading(false);
            } else {
                setFilteredExpenseList([]);
            }
            setLoading(false);
        }
        // else {
        //     const data = await listAPI.getDailyExpenseList(formattedDate, session?.data?.user?.name, selectedStatusType);
        //     if (data?.length > 0) {
        //         setTodayExpense(data);
        //         setLoading(false);
        //     } else {
        //         setFilteredExpenseList([]);
        //     }
        //     setLoading(false);
        // }
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
                    const uniqueTodayOrderArray: any[] = [...uniqueTodayOrder];
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
        fetchByDate();
        FetchEmployeeDetails();
        if (session?.data?.user?.id) {
            setUserId(session?.data?.user?.id);
        }
    }, [session?.data?.user?.name]);

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

    const formatDatingDate = (date) => {
        const dateObject = new Date(date);

        const day = dateObject.getDate().toString().padStart(2, "0");
        const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
        const year = dateObject.getFullYear();

        return `${day}-${month}-${year}`;
    };

    const handleOrder = async (value: string) => {
        if (value === "null") {
            setSelectedUserType("");
        } else {
            setSelectedUserType(value);
        }
        setShowSearch(!showSearch);
    };

    const handleSelectStatus = (value: number) => {
        setSelectedStatusType(value);
    };

    useEffect(() => {
        if (searchQuery) {
            if (todayExpense?.length > 0) {
                const filteredList = todayExpense?.filter(
                    (item) =>
                        item?.Account2?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item?.Account1?.toLowerCase().includes(searchQuery.toLowerCase())
                );
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
        const response = generateSums(filteredExpenseList);
        setTotalSum(response);
    }, [filteredExpenseList]);

    const handleExpenseStatus = async (item: TodayExpenseInterface, status: boolean | string) => {
        let title;
        let aprSts: number;
        if (status === true) {
            aprSts = 1;
            title = "Do you want to Approve ?";
        }
        if (status === false) {
            title = "Do you want to Disapprove ?";
            aprSts = 0;
        }

        if (status === "delete") title = "Do you want to Delete ?";

        Swal.fire({
            title: title,
            showDenyButton: true,
            showCancelButton: false,
            html: `<input type="date" id="dateInput" class="shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight">`,
            confirmButtonText: "Yes",
            denyButtonText: `No`,
            didOpen: () => {
                document.getElementById("dateInput").value = formatDate(updatedDate);
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                const dateInputValue = document.getElementById("dateInput").value;
                try {
                    setLoading(true);
                    const ReAprUser = session?.data?.user?.name;
                    const fetchDetails = await updateAPI.updateExpenseApprove(
                        formatDatingDate(dateInputValue),
                        ReAprUser,
                        item?.DTId.toString(),
                        1,
                        aprSts
                    );

                    if (fetchDetails) {
                        console.log(fetchDetails, " result ");
                        toast.success("Successfully updated");
                        fetchByDate();
                        setSelectedItems([]);
                    }

                    // fetchByDate();
                    setLoading(false);
                } catch (error) {
                    console.log(error);
                }
            }
        });
    };

    const handleUpdatedCalendar = (e: any, item: TodayExpenseInterface) => {
        const inputValue = e.target.value;
        const newDate = new Date(inputValue);
        const id = item?.DTId;
        const updatedFilterData = filteredExpenseList?.map((data) => {
            if (data?.DTId === id) {
                const updatedData = { ...data, updatedDate: newDate };
                return updatedData;
            }
            return data;
        });

        setFilteredExpenseList(updatedFilterData);
        setUpdatedDateItem(id);
        setUpdatingDate(true);
    };

    const handleAllSelect = () => {
        const allItems = todayExpense?.map((item) => item?.DTId);
        const allSelected = allItems.every((id) => selectedItems.includes(id));
        if (allSelected) {
            setSelectedItems([]);
        } else {
            setSelectedItems(allItems);
        }
    };

    const handleNonSelectedItems = () => {
        const nonSelectedItems = todayExpense
            ?.filter((item) => !selectedItems.includes(item.DTId))
            ?.map((item) => item.DTId);

        setSelectedItems(nonSelectedItems);
    };

    const handleDTIdChecked = (id: any) => {
        return selectedItems?.includes(id) ?? false;
    };

    const handleDTIdChange = (id: any) => {
        // Toggle selection of item
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter((item) => item !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleApproveAll = () => {
        setSubmitted(true);

        let title = `Do you want to Approve All?\n selected Date is : ${formatDate2(date)} `;
        let aprSts: number = 1;
        const DTIdString = selectedItems.join(",");
        console.log(DTIdString);

        Swal.fire({
            title: title,
            showDenyButton: true,
            showCancelButton: false,
            html: `<input type="date" id="dateInput" class="shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight">`,
            confirmButtonText: "Yes",
            denyButtonText: `No`,
            didOpen: () => {
                document.getElementById("dateInput").value = formatDate(updatedDate);
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                const dateInputValue = document.getElementById("dateInput").value;
                try {
                    setLoading(true);
                    const ReAprUser = session?.data?.user?.name;

                    const fetchDetails = await updateAPI.updateExpenseApprove(
                        formatDatingDate(dateInputValue),
                        ReAprUser,
                        DTIdString,
                        1,
                        aprSts
                    );
                    if (fetchDetails) {
                        toast.success("Successfully updated");
                        setSelectedItems([]);
                        fetchByDate();
                    }

                    // fetchByDate();
                    setLoading(false);
                } catch (error) {
                    console.log(error);
                }
            }
        });
        setSubmitted(false);
    };

    const handleDisapproveAll = () => {
        setSubmitted(true);

        let title = `Do you want to Approve All?\n selected Date is : ${formatDate2(date)} `;
        let aprSts: number = 0;
        const DTIdString = selectedItems?.join(",");

        Swal.fire({
            title: title,
            showDenyButton: true,
            showCancelButton: false,
            html: `<input type="date" id="dateInput" class="shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight">`,
            confirmButtonText: "Yes",
            denyButtonText: `No`,
            didOpen: () => {
                document.getElementById("dateInput").value = formatDate(updatedDate);
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                const dateInputValue = document.getElementById("dateInput").value;
                try {
                    setLoading(true);
                    const ReAprUser = session?.data?.user?.name;

                    const fetchDetails = await updateAPI.updateExpenseApprove(
                        formatDatingDate(dateInputValue),
                        ReAprUser,
                        DTIdString,
                        1,
                        aprSts
                    );
                    if (fetchDetails) {
                        toast.success("Successfully updated");
                        setSelectedItems([]);
                        fetchByDate();
                    }

                    // fetchByDate();
                    setLoading(false);
                } catch (error) {
                    console.log(error);
                }
            }
        });
        setSubmitted(false);
    };

    return (
        <>
            {/* {isOpen && (
                <CustomModal
                    children={
                        <CreateExpense
                            route={route}
                            userCode={userCode}
                            newExpenseData={newExpenseData}
                            userId={userId}
                            vehicle={vehicleNumber}
                        />
                    }
                    title="New Expense"
                ></CustomModal>
            )} */}
            <div className=" bg-slate-100 min-h-screen mt-24 sm:mt-20 md:mt-20 lg:mt-2 shadow-md flex justify-center">
                {loading && <Spinner />}
                <div className="w-full p-1">
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
                            <div className="flex gap-2 flex-wrap justify-start md:justify-between items-center">
                                {session.data?.user.role === "admin" ? (
                                    <>
                                        <div className="flex justify-start items-center">
                                            <label className="text-warning-content me-2 text-center md:block hidden whitespace-nowrap basis-1/5 text-sm font-semibold">
                                                Select Date
                                            </label>
                                            <input
                                                type="date"
                                                value={date ? formatDate(date) : ""}
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
                                                    onClick={() => setShowSearch(!showSearch)}
                                                    onChange={(e) => handleSelectUserType(e.target.value)}
                                                    className="shadow appearance-none border input-info text-sm rounded max-w-32 w-fit py-1 px-1.5 my-auto sm:py-2 sm:px-3  leading-tight "
                                                    placeholder="select"
                                                    value={selectedUserType}
                                                />
                                                <div
                                                    className={`max-w-48 ${
                                                        showSearch
                                                            ? "max-h-40 h-auto z-[300] overflow-auto w-[230px] absolute top-8"
                                                            : ""
                                                    } `}
                                                >
                                                    {showSearch &&
                                                        userTypes &&
                                                        userTypes.map((item, ind) => (
                                                            <div key={ind} className="w-full bg-white p-0.5 rounded">
                                                                <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                                                                    <div
                                                                        className="text-sm font-medium whitespace-nowrap text-success-content cursor-pointer"
                                                                        onClick={() => {
                                                                            // setPartySelected("selectParty");
                                                                            handleOrder(item?.EMPCODE);
                                                                        }}
                                                                    >
                                                                        {item.EmpName}
                                                                    </div>
                                                                    <div className="text-xs font-normal text-success-content">
                                                                        {item.EMPCODE}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-start items-center">
                                            <label className="text-warning-content me-2 text-center md:block hidden whitespace-nowrap basis-1/5 text-sm font-semibold">
                                                Select Status
                                            </label>
                                            <select
                                                value={selectedStatusType}
                                                onChange={(e) => handleSelectStatus(parseInt(e.target.value))}
                                                name=""
                                                className="shadow appearance-none border input-info text-sm rounded w-fit py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                                                id=""
                                            >
                                                <option value="0">--All--</option>
                                                <option value="2">Approved</option>
                                                <option value="1">Pending</option>
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-start items-center">
                                        <label className="text-warning-content me-2 text-center md:block hidden whitespace-nowrap basis-1/5 text-sm font-semibold">
                                            Select Date
                                        </label>
                                        <input
                                            type="date"
                                            value={date ? formatDate(date) : ""}
                                            onChange={handleDateChange}
                                            className="shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight"
                                        />
                                    </div>
                                )}
                                {/* <button
                                    onClick={fetchByDate}
                                    className="btn btn-primary btn-sm md:btn-md font-semibold md:font-bold p-2 md:px-4   rounded"
                                >
                                    Filter by Date
                                </button> */}
                                <button
                                    onClick={fetchByDate}
                                    className="btn btn-primary btn-sm md:btn-md font-semibold md:font-bold p-2 md:px-4   rounded"
                                >
                                    Refresh
                                </button>
                            </div>

                            {/* <button
                                onClick={handleNewExpense}
                                className="btn btn-primary btn-sm md:btn-md text-white font-semibold md:font-bold p-2 md:px-4   rounded"
                            >
                                New Expense
                            </button> */}
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
                            <div className="flex gap-2 flex-col md:flex-row">
                                <div className="flex justify-end w-full items-center">
                                    <span className="w-fit whitespace-nowrap font-medium text-base border-black p-0.5 border border-solid bg-[#f0f0f0]">
                                        {filteredExpenseList?.length} / {totalSum}
                                    </span>
                                </div>
                                <div className="flex justify-end w-full items-center">
                                    <button
                                        onClick={handleNonSelectedItems}
                                        type="button"
                                        className="w-fit font-medium text-base border-black p-0.5 rounded-sm whitespace-nowrap px-1 py-0.5 bg-primary"
                                    >
                                        Inverse Select
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between md:justify-start gap-1 items-center">
                        <div className="md:hidden block">
                            <div className="px-6 py-3 flex justify-start w-full items-center gap-2 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                <input
                                    type="checkbox"
                                    checked={
                                        todayExpense &&
                                        selectedItems.length === todayExpense.length &&
                                        selectedItems.length !== 0
                                    }
                                    onClick={handleAllSelect}
                                    className="size-5 text-blue-600 bg-gray-100 checked:after:scale-100 checked:before:scale-150 checked:transition hover:scale-125 hover:checked:scale-100 checked:duration-300 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-0"
                                />
                                Select All
                            </div>
                        </div>
                        {selectedItems?.length > 0 && (
                            <>
                                {submitted ? (
                                    <>
                                        <button
                                            type="button"
                                            className="bg-primary flex items-center rounded-md shadow-lg px-3 py-1 font-semibold uppercase mt-2 mb-0"
                                        >
                                            <span>
                                                <RiLoader2Fill className="animate-spin" color="black" size="27" />
                                            </span>
                                            Processing...
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleApproveAll}
                                            type="button"
                                            className="bg-primary rounded-md shadow-lg px-3 py-1 font-semibold uppercase my-2"
                                        >
                                            Approve
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                        {selectedItems?.length > 0 && (
                            <>
                                {submitted ? (
                                    <>
                                        <button
                                            type="button"
                                            className="bg-primary flex rounded-md shadow-lg px-3 py-1 font-semibold uppercase my-2"
                                        >
                                            <span>
                                                <RiLoader2Fill className="animate-spin" color="black" size="27" />
                                            </span>
                                            Processing...
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleDisapproveAll}
                                            type="button"
                                            className="bg-primary rounded-md shadow-lg px-3 py-1 font-semibold uppercase my-2"
                                        >
                                            Disaprove
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    <div className="grid md:hidden mt-6 grid-cols-1 gap-6 px-2 sm:grid-cols-2 max-h-[32rem] overflow-y-auto">
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
                                        <h4 className="text-lg flex items-center font-semibold mb-2">
                                            <input
                                                type="checkbox"
                                                name={item?.DTId.toString()}
                                                onChange={() => handleDTIdChange(item.DTId)}
                                                checked={handleDTIdChecked(item?.DTId)}
                                                className="size-5 text-blue-600 me-2 bg-gray-100 checked:after:scale-100 checked:before:scale-150 checked:transition hover:scale-125 hover:checked:scale-100 checked:duration-300 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-0"
                                            />
                                            SL No.: {item.DTId}
                                        </h4>
                                        <p className=" text-warning-content mb-2"> User Code: {item.UserCode}</p>
                                        <p className="text-warning-content mb-2">Expense Type: {item.Account2}</p>
                                        <p className=" text-warning-content mb-2">Date: {item.CdateStr}</p>
                                        <p className=" text-warning-content mb-2">Amount: {item.Amount}</p>
                                        <p className=" text-warning-content mb-2">Purpose: {item.Account1}</p>
                                        {item?.EmpName && (
                                            <p className=" text-warning-content mb-2">Employee: {item.EmpName}</p>
                                        )}
                                        {item?.AprDateStr && (
                                            <p className=" text-warning-content mb-2">Approved Date: {item?.AprDateStr}</p>
                                        )}
                                        <div className="flex justify-between items-center">
                                            {item?.AprSts === 0 ? (
                                                <>
                                                    <button
                                                        onClick={() => handleExpenseStatus(item, true)}
                                                        className={`block w-fit px-3 bg-white rounded shadow-lg p-1`}
                                                    >
                                                        <Image
                                                            height={500}
                                                            width={500}
                                                            className="size-10 block"
                                                            src={approve}
                                                            alt="location update"
                                                        />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleExpenseStatus(item, false)}
                                                        className={`block w-fit px-3 bg-white rounded shadow-lg p-1`}
                                                    >
                                                        <Image
                                                            height={500}
                                                            width={500}
                                                            className="size-10 block"
                                                            src={reject}
                                                            alt="location update"
                                                        />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>

                    <div className="bg-slate-100 w-full hidden md:block max-h-96 h-full my-2 shadow overflow-auto  sm:rounded-lg">
                        <table className=" divide-gray-200 overflow-hidden table">
                            <thead className="bg-primary sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 flex justify-center items-center gap-2 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        <input
                                            type="checkbox"
                                            checked={
                                                todayExpense &&
                                                selectedItems.length === todayExpense.length &&
                                                selectedItems.length !== 0
                                            }
                                            onClick={handleAllSelect}
                                            className="size-5 text-blue-600 bg-gray-100 checked:after:scale-100 checked:before:scale-150 checked:transition hover:scale-125 hover:checked:scale-100 checked:duration-300 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-0"
                                        />
                                        Select
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Expense Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Purpose
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Employee
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Approve/Disapprove
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Approved Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredExpenseList &&
                                    filteredExpenseList?.map((item: TodayExpenseInterface, ind) => (
                                        <tr key={ind}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {/* <div className="text-sm text-gray-900">{item.DTId}</div> */}
                                                <input
                                                    type="checkbox"
                                                    name={item?.DTId.toString()}
                                                    onChange={() => handleDTIdChange(item.DTId)}
                                                    checked={handleDTIdChecked(item?.DTId)}
                                                    className="size-5 text-blue-600 bg-gray-100 checked:after:scale-100 checked:before:scale-150 checked:transition hover:scale-125 hover:checked:scale-100 checked:duration-300 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-0"
                                                />
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
                                                <div className="text-sm text-gray-900">{item.Amount}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.Account1}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.EmpName}</div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2 justify-between">
                                                    {item?.AprSts === 0 ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleExpenseStatus(item, true)}
                                                                className={`block w-fit bg-[#88efff] px-3 rounded-lg p-1`}
                                                            >
                                                                <Image
                                                                    height={500}
                                                                    width={500}
                                                                    className="size-10 block"
                                                                    src={approve}
                                                                    alt="location update"
                                                                />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleExpenseStatus(item, false)}
                                                                className={`block w-fit bg-[#88efff] px-3 rounded-lg p-1`}
                                                            >
                                                                <Image
                                                                    height={500}
                                                                    width={500}
                                                                    className="size-10 block"
                                                                    src={reject}
                                                                    alt="location update"
                                                                />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item?.AprDateStr}</div>
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

export default ExpenseApproval;
