// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ListApi, UpdateAPI } from "@/app/utils/api";
import { Spinner } from "@/components/Spinner";
import BackButton from "@/components/BackButton";
import { toast } from "react-toastify";
import { OrderItemTypeTodayPayment } from "@/types";
import { getNextDay, formatDate, formatDate2 } from "@/lib/helper-function";
import { useModal } from "@/Provider";
import CustomModal from "@/components/Modal";
import EditNewPayment from "@/components/common/newPayment";
import Swal from "sweetalert2";
import Image from "next/image";
import approve from "../../../public/images/svg/approve.svg";
import reject from "../../../public/images/svg/reject.svg";
import { RiLoader2Fill } from "react-icons/ri";

const PaymentApproval = () => {
    const listAPI = new ListApi();
    const updateAPI = new UpdateAPI();
    const { setClose, isOpen, setOpen } = useModal();
    const [year, setYear] = useState("");
    const [route, setRoute] = useState("");
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [userCode, setUserCode] = useState("");
    const [userId, setUserId] = useState("");
    const [todayPaymentList, setTodayPaymentList] = useState<OrderItemTypeTodayPayment[]>([]);
    const [filteredPartyList, setFilteredPartyList] = useState<OrderItemTypeTodayPayment[]>([]);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<any>("");
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

    const [selectedItems, setSelectedItems] = useState<any[]>([]);

    const router = useRouter();
    // console.log("Router Object:", router);

    const session = useSession();

    const searchParams = useSearchParams();

    const DateVal = searchParams.get("date");

    const fetchData = async () => {
        setLoading(true);

        if (session.data?.user.role === "admin") {
            const data = await listAPI.getOrderPaymentMasterList("", selectedUserType, selectedStatusType);
            if (data?.length > 0) {
                setTodayPaymentList(data);
            }
            setLoading(false);
        } else {
            const data = await listAPI.getOrderPaymentMasterList("", session?.data?.user?.name, selectedStatusType);
            if (data?.length > 0) {
                setTodayPaymentList(data);
            }
            setLoading(false);
        }
        setLoading(false);
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

    const userWiseFetchPaymentList = async () => {
        const today = date ? formatDate2(date) : "";
        // if (selectedStatusType === 0 || selectedStatusType === 2) return toast.warn("Please select a date");
        if ((selectedStatusType === 0 && today === "") || (selectedStatusType === 2 && today === ""))
            return toast.warn("Please select a date");
        setLoading(true);
        const data = await listAPI.getOrderPaymentMasterList(today, selectedUserType, selectedStatusType);
        if (data?.length === 0) {
            setTodayPaymentList([]);
        } else {
            setTodayPaymentList(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (session?.data?.user?.role !== "admin") {
            setSelectedUserType(session?.data?.user.name);
        }
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
        }

        userWiseFetchPaymentList();
        FetchEmployeeDetails();
    }, [session.data?.user.role, searchParams, DateVal]);

    // const handleItem = (item: OrderItemTypeTodayPayment) => {
    //     const combinedInfo = `${item.PaymentID}`;
    //     setPaymentID(item?.PaymentID);
    //     setOpen();

    //     // router.push(`/newpayment/${combinedInfo}`);
    // };

    // const handleNewPayment = () => {
    //     setPaymentID("");
    //     setOpen();
    // };

    const formatDatingDate = (date) => {
        const dateObject = new Date(date);

        const day = dateObject.getDate().toString().padStart(2, "0");
        const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
        const year = dateObject.getFullYear();

        return `${day}-${month}-${year}`;
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
        const filteredList = todayPaymentList?.filter((item) =>
            item?.PartyName.toLowerCase().includes(searchQuery.toLowerCase())
        );
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
        const response = generateSums(filteredPartyList);
        setTotalSum(response);
    }, [filteredPartyList]);

    const handleExpenseStatus = async (item: any, status: boolean | string) => {
        let title;
        let aprSts: string | number;
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
                    const fetchDetails = await updateAPI.updatePaymentApprove(
                        formatDatingDate(dateInputValue),
                        ReAprUser,
                        item?.PaymentID,
                        1,
                        aprSts
                    );

                    if (fetchDetails) {
                        toast.success("Successfully updated");
                        userWiseFetchPaymentList();
                    }
                    setLoading(false);
                } catch (error) {
                    console.log(error);
                }
            }
        });
    };

    const handleUpdatedCalendar = (e: any, item: OrderItemTypeTodayPayment) => {
        const inputValue = e.target.value;
        const newDate = new Date(inputValue);
        const id = item?.PaymentID;
        const updatedFilterData = filteredPartyList?.map((data) => {
            if (data?.PaymentID === id) {
                const updatedData = { ...data, updatedDate: newDate };
                return updatedData;
            }
            return data;
        });

        setFilteredPartyList(updatedFilterData);
        setUpdatedDateItem(id);
        setUpdatingDate(true);
    };

    const handleAllSelect = () => {
        const allItems = todayPaymentList?.map((item: OrderItemTypeTodayPayment) => item?.PaymentID);
        const allSelected = allItems.every((id) => selectedItems.includes(id));
        if (allSelected) {
            setSelectedItems([]);
        } else {
            setSelectedItems(allItems);
        }
    };

    const handleNonSelectedItems = () => {
        const nonSelectedItems = todayPaymentList
            ?.filter((item) => !selectedItems.includes(item.PaymentID))
            ?.map((item) => item.PaymentID);

        setSelectedItems(nonSelectedItems);
    };

    const handlePaymentIdChecked = (id: any) => {
        return selectedItems?.includes(id) ?? false;
    };

    const handlePaymentIdChange = (id: any) => {
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
        const PaymentIDString = selectedItems.join(",");

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

                    const fetchDetails = await updateAPI.updatePaymentApprove(
                        formatDatingDate(dateInputValue),
                        ReAprUser,
                        PaymentIDString,
                        1,
                        aprSts
                    );
                    if (fetchDetails) {
                        toast.success("Sucessfully updated");
                        setSelectedItems([]);
                        userWiseFetchPaymentList();
                    }

                    // userWiseFetchPaymentList();
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
        let title = `Do you want to Disapprove All?\n selected Date is : ${formatDate2(date)} `;
        let aprSts: number = 0;
        const PaymentIDString = selectedItems.join(",");

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

                    const fetchDetails = await updateAPI.updatePaymentApprove(
                        formatDatingDate(dateInputValue),
                        ReAprUser,
                        PaymentIDString,
                        1,
                        aprSts
                    );
                    if (fetchDetails) {
                        toast.success("Sucessfully updated");
                        setSelectedItems([]);
                        userWiseFetchPaymentList();
                    }

                    // userWiseFetchPaymentList();
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
            <div className=" bg-slate-100 min-h-screen mt-24 sm:mt-20 md:mt-20 lg:mt-2 shadow-md flex justify-center">
                {loading && <Spinner />}

                <div className="w-full lg:mt-0 p-1">
                    <div className="bg-slate-100 shadow-md flex-col flex items-start justify-between mb-2 p-2 rounded-lg">
                        <div className="flex w-full justify-between items-center">
                            <BackButton />
                            <h3 className="md:text-3xl text-xl font-semibold">All Staff</h3>
                        </div>
                        <div className="flex w-full justify-between items-center my-1 gap-2">
                            <div className="flex gap-2 justify-start flex-wrap  items-center">
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
                                                        ? "max-h-40 h-auto z-[300] overflow-auto w-[200px] absolute top-8"
                                                        : ""
                                                } `}
                                            >
                                                {showSearch &&
                                                    userTypes &&
                                                    userTypes.map((item, ind) => (
                                                        <div key={ind} className="w-full bg-white p-0.5 rounded">
                                                            <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                                                                <div
                                                                    className="text-md font-medium text-success-content cursor-pointer"
                                                                    onClick={() => {
                                                                        // setPartySelected("selectParty");
                                                                        handleOrder(item?.EMPCODE);
                                                                    }}
                                                                >
                                                                    {item.EmpName}
                                                                </div>
                                                                <div className="text-sm font-normal text-success-content">
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
                                {/* <button
                                    onClick={userWiseFetchPaymentList}
                                    className="btn btn-primary btn-sm md:btn-md text-white font-semibold md:font-bold p-2 md:px-4   rounded"
                                >
                                    Filter with Date
                                </button> */}
                                <button
                                    onClick={userWiseFetchPaymentList}
                                    className="btn btn-primary btn-sm md:btn-md text-white font-semibold md:font-bold p-2 md:px-4   rounded"
                                >
                                    Refresh
                                </button>
                            </div>
                            <div className="">
                                {/* <button
                                    onClick={handleNewPayment}
                                    className="btn btn-primary md:text-base h-fit sm:text-sm text-xs btn-sm md:btn-md text-white font-semibold md:font-bold p-2 md:px-4  rounded"
                                >
                                    New Payment
                                </button> */}
                                {/* <Link
                                href={`/newpayment/${0}`}
                                className="btn btn-primary text-white font-bold py-2 md:px-4 px-2  rounded"
                            >
                                New Payment
                            </Link> */}
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex">
                        <div className="bg-slate-100 flex justify-between items-center shadow-md w-full p-2 rounded-lg">
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
                                    <span className="w-fit font-bold text-base whitespace-nowrap border-black p-0.5 border border-solid bg-[#f0f0f0]">
                                        {filteredPartyList?.length} / {totalSum}
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
                                        todayPaymentList &&
                                        selectedItems.length === todayPaymentList.length &&
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

                    <div className="grid md:hidden mt-6 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 px-2 max-h-[45rem] overflow-y-auto">
                        {/* Card representation for smaller screens */}
                        {filteredPartyList &&
                            filteredPartyList.map((item) => (
                                <div
                                    key={item.PaymentID}
                                    className="bg-blue-200  border border-blue-200 shadow-md rounded-lg overflow-hidden"
                                    style={{
                                        boxShadow: "5px 5px 0px 2px rgba(173, 216, 230, 0.9)",
                                    }}
                                >
                                    <div className="p-4">
                                        <h4 className="text-lg flex items-center font-semibold mb-2">
                                            <input
                                                type="checkbox"
                                                name={item?.PaymentID.toString()}
                                                onChange={() => handlePaymentIdChange(item?.PaymentID)}
                                                checked={handlePaymentIdChecked(item?.PaymentID)}
                                                className="size-5 text-blue-600 me-2 bg-gray-100 checked:after:scale-100 checked:before:scale-150 checked:transition hover:scale-125 hover:checked:scale-100 checked:duration-300 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-0"
                                            />
                                            <div>{item?.PartyName}</div>
                                        </h4>
                                        <p className="text-gray-700 mb-2">Payment Date: {formatDatingDate(item.Cdate)}</p>
                                        <p className="text-gray-700 mb-2">Type: {item.TransType}</p>
                                        <p className="text-gray-700 mb-2">Discount: {item.Discount}</p>
                                        <p className="text-gray-700 mb-2">Gross Amount: {item.BillAmount}</p>
                                        <p className="text-gray-700 mb-2">Other Amount: {item.OthAmount}</p>
                                        <p className="text-gray-700 mb-2">Total Amount: {item.TotAmt}</p>
                                        <p className="text-gray-700 mb-2">Ref Name: {item.RefNo}</p>
                                        {item?.AprDate && (
                                            <p className="text-gray-700 mb-2">
                                                Approved Date: {formatDatingDate(item?.AprDate)}
                                            </p>
                                        )}
                                        <div className="flex justify-between">
                                            <div className="flex justify-between">
                                                {item?.AprSts === 0 ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleExpenseStatus(item, true)}
                                                            className={`block w-fit px-3 bg-white rounded shadow-lg  p-1`}
                                                        >
                                                            <Image
                                                                height={500}
                                                                width={500}
                                                                className="size-10 block"
                                                                src={approve}
                                                                alt="payment update"
                                                            />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleExpenseStatus(item, false)}
                                                            className={`block w-fit px-3 bg-white rounded shadow-lg  p-1`}
                                                        >
                                                            <Image
                                                                height={500}
                                                                width={500}
                                                                className="size-10 block"
                                                                src={reject}
                                                                alt="payment update"
                                                            />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
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
                                        <th className="px-6 py-3 flex items-center text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    todayPaymentList &&
                                                    selectedItems.length === todayPaymentList.length &&
                                                    selectedItems.length !== 0
                                                }
                                                onClick={handleAllSelect}
                                                className="size-5 text-blue-600 me-2 bg-gray-100 checked:after:scale-100 checked:before:scale-150 checked:transition hover:scale-125 hover:checked:scale-100 checked:duration-300 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-0"
                                            />
                                            Select
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                            Payment Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                            Party Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-warning-content tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-warning-content tracking-wider">
                                            Discount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                            Gross Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                            Total Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                            Ref Name
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
                                    {filteredPartyList &&
                                        filteredPartyList
                                            .slice()
                                            .sort((a, b) => b.PaymentID - a.PaymentID)
                                            .map((item) => (
                                                <tr key={item.PaymentID}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            name={item?.PaymentID.toString()}
                                                            onChange={() => handlePaymentIdChange(item.PaymentID)}
                                                            checked={handlePaymentIdChecked(item?.PaymentID)}
                                                            className="size-5 text-blue-600 me-2 bg-gray-100 checked:after:scale-100 checked:before:scale-150 checked:transition hover:scale-125 hover:checked:scale-100 checked:duration-300 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-0"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {formatDatingDate(item.Cdate)}
                                                        </div>
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
                                                        <div className="text-sm text-gray-900">{item.TotAmt}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{item.RefNo}</div>
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex gap-2">
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
                                                                            alt="payment update"
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
                                                                            alt="payment update"
                                                                        />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {item?.AprDate && (
                                                            <div className="text-sm text-gray-900">
                                                                {formatDatingDate(item.AprDate)}
                                                            </div>
                                                        )}
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

export default PaymentApproval;
