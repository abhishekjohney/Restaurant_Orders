// @ts-nocheck
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiDelete } from "react-icons/fi";
import { ListApi, UpdateAPI } from "@/app/utils/api";
import { PartyItemType } from "@/types";
import { formatDate, formatDate2, getNextDay } from "@/lib/helper-function";
import BackButton from "@/components/BackButton";

const CreateExpense = () => {
    const listAPI = new ListApi();
    const updateAPI = new UpdateAPI();
    const router = useRouter();
    const session = useSession();

    const [year, setYear] = useState("");
    const [route, setRoute] = useState("");
    const [vehicleNumber, setVehicleNumber] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showSearchAcc, setShowSearchAcc] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date>(getNextDay());
    const [searchQuery, setSearchQuery] = useState("");
    const [searchQueryCA, setSearchQueryCA] = useState("");
    const [filteredExpenseList, setFilteredExpenseList] = useState<PartyItemType[]>([]);
    const [filteredCashAccountList, setFilteredCashAccountList] = useState<PartyItemType[]>([]);
    const [maxHeight, setMaxHeight] = useState(0);
    const [userCode, setUserCode] = useState("");
    const [userId, setUserId] = useState("");
    const [formData, setFormdData] = useState({
        Date: selectedDate ? formatDate2(selectedDate) : "",
        amount: "",
        remarks: "",
        expenseHead: "",
        cashBankHead: "",
        price: "",
        expenseHeadAccAutoID: "",
        cashBankHeadAccAutoID: "",
        vehicleNumber: vehicleNumber ? vehicleNumber : "",
        route: route ? route : "",
        userCode: userCode ? userCode : "",
    });

    const [expenseList, setExpenseList] = useState<PartyItemType[]>([]);
    const [cashAccountList, setCashAccountList] = useState<PartyItemType[]>([]);

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
        }
    }, []);

    useEffect(() => {
        const fetchExpenseData = async () => {
            try {
                const response = await listAPI.getExpenseList();
                if (response) {
                    const fieldsToExclude = ["Byr_nam", "AccAutoID", "AccAutoIDClient"]; // Define fields to exclude
                    const updatedPartyList = response?.PartyList?.map((item: PartyItemType) => {
                        const combinedField = Object.keys(item)
                            .filter(
                                (key) =>
                                    !fieldsToExclude.includes(key) &&
                                    item[key as keyof PartyItemType] !== null &&
                                    item[key as keyof PartyItemType] !== undefined
                            )
                            .map((key) => item[key as keyof PartyItemType])
                            .join(" ")
                            .replace(/\s+/g, " ") // Replace multiple spaces with a single space
                            .trim();

                        return {
                            ...item,
                            combinedField,
                        };
                    });
                    setExpenseList(updatedPartyList);
                }
            } catch (error) {
                console.error(error);
            }
        };
        const fetchCashAccountData = async () => {
            try {
                const response = await listAPI.getCashAccountList();
                if (response) {
                    const fieldsToExclude = ["Byr_nam", "AccAutoID", "AccAutoIDClient"]; // Define fields to exclude
                    const updatedPartyList = response?.PartyList?.map((item: PartyItemType) => {
                        const combinedField = Object.keys(item)
                            .filter(
                                (key) =>
                                    !fieldsToExclude.includes(key) &&
                                    item[key as keyof PartyItemType] !== null &&
                                    item[key as keyof PartyItemType] !== undefined
                            )
                            .map((key) => item[key as keyof PartyItemType])
                            .join(" ")
                            .replace(/\s+/g, " ") // Replace multiple spaces with a single space
                            .trim();

                        return {
                            ...item,
                            combinedField,
                        };
                    });
                    setCashAccountList(updatedPartyList);
                }
            } catch (error) {
                console.error(error);
            }
        };
        if (session?.data?.user?.id) {
            setUserId(session?.data?.user?.id);
        }
        fetchCashAccountData();
        fetchExpenseData();
    }, []);

    useEffect(() => {
        // Function to calculate and set the max-height based on screen height
        function setMaxHeightBasedOnScreen() {
            const screenHeight = window.innerHeight;
            // Calculate max-height based on screen height
            const calculatedMaxHeight = screenHeight * 0.6; // Adjust this value according to your preference
            setMaxHeight(calculatedMaxHeight);
        }

        // Call the function initially
        setMaxHeightBasedOnScreen();

        // Listen for window resize events to dynamically adjust max-height
        window.addEventListener("resize", setMaxHeightBasedOnScreen);

        // Clean up event listener on component unmount
        return () => {
            window.removeEventListener("resize", setMaxHeightBasedOnScreen);
        };
    }, []);

    useEffect(() => {
        const filteredList = expenseList.filter((item) => item?.Byr_nam?.toLowerCase().includes(searchQuery.toLowerCase()));
        const filteredListCA = cashAccountList.filter((item) =>
            item?.Byr_nam?.toLowerCase().includes(searchQueryCA.toLowerCase())
        );

        setFilteredExpenseList(filteredList);
        setFilteredCashAccountList(filteredListCA);
    }, [searchQuery, expenseList, cashAccountList, searchQueryCA]);

    const handleOrder = async (selectedItem: PartyItemType, type: string) => {
        if (type === "expense") {
            setShowSearch(false);
            setShowSearchAcc(false);
            setSearchQuery(selectedItem?.Byr_nam);
            setFormdData({
                ...formData,
                expenseHead: selectedItem?.Byr_nam,
                expenseHeadAccAutoID: selectedItem?.AccAutoID,
            });
        } else {
            setShowSearch(false);
            setShowSearchAcc(false);
            setSearchQueryCA(selectedItem?.Byr_nam);
            setFormdData({
                ...formData,
                cashBankHead: selectedItem?.Byr_nam,
                cashBankHeadAccAutoID: selectedItem?.AccAutoID,
            });
        }
        console.log(selectedItem, "selectedItem");
        setShowModal(false);
    };

    const handleSubmission = async (e) => {
        e.preventDefault();
        console.log(formData, "submit");
        const formattedDate = formatDate2(selectedDate);
        try {
            const response = 5; // submission api

            if (response) {
                toast.success("Order created successfully");
                // router.push("/dashboard/todaysOrders");
            } else {
                toast.error("Failed to Create Order");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const newDate = new Date(inputValue);
        setSelectedDate(newDate);
        setFormdData({ ...formData, Date: formatDate2(newDate) });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormdData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        if (name === "amount") {
            setFormdData({ ...formData, price: value, amount: value });
        }
    };

    return (
        <>
            <div className="flex min-h-screen">
                <div className="w-full mt-16 md:mt-5 customHeightStock overflow-auto absolute right-0  py-9 px-8 p-4 md:p-6 lg:p-8 xl:p-10">
                    {/* Form */}
                    <BackButton />
                    <form className="bg-white shadow-md rounded px-4 md:px-8 py-4 md:py-7 mb-4">
                        <div className="lg:flex justify-between items-center">
                            <div className="flex my-2 mb-4 sm:flex-row flex-col justify-between item-center w-full">
                                <h3 className="text-2xl font-semibold">Today's Expense</h3>
                                <div className="flex justify-between gap-2">
                                    <p>
                                        <strong>Vehicle No.:</strong>
                                        {vehicleNumber}
                                    </p>
                                    <p>
                                        <strong>Route:</strong>
                                        {route}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 flex justify-start items-center">
                            <label className="block text-warning-content text-start basis-1/5 text-sm font-bold mb-2">
                                Expense Head
                            </label>
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    onClick={() => setShowSearch(true)}
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
                            <label className="block text-warning-content text-start basis-1/5 text-sm font-bold mb-2">
                                Cash Bank Head
                            </label>
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    onClick={() => setShowSearchAcc(true)}
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
                                Amount
                            </label>
                            <input
                                type="text"
                                className="shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight"
                                placeholder="Enter ..."
                                name="amount"
                                onChange={handleChange}
                                value={formData?.amount}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-auto">
                            <div className="flex justify-start items-center">
                                <div className="block text-warning-content basis-1/5 sm:basis-1/3 text-sm font-bold mb-2">
                                    <label htmlFor="">Remarks</label>
                                    <button
                                        onClick={() => setFormdData({ ...formData, remarks: "" })}
                                        className="bg-gray-400 p-2 w-fit rounded-md shadow-lg border-2 border-white justify-center items-center flex gap-2 text-white text-xs font-medium capitalize"
                                    >
                                        <FiDelete /> clear
                                    </button>
                                </div>
                                <textarea
                                    value={formData?.remarks}
                                    onChange={handleChange}
                                    name="remarks"
                                    className="shadow h-auto appearance-none border input-info rounded w-full py-2 px-3"
                                    placeholder="Enter ..."
                                ></textarea>
                            </div>
                            <div className="flex justify-start items-center">
                                <label className="block text-warning-content basis-1/5 sm:basis-1/3 text-sm font-bold mb-2">
                                    Date
                                </label>
                                <input
                                    value={formatDate(selectedDate)}
                                    onChange={handleDateChange}
                                    type="date"
                                    className="shadow appearance-none border input-info rounded w-full py-2 px-3"
                                    placeholder="Enter ..."
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="lg:flex my-2 justify-center items-center">
                                <button
                                    className=" w-full lg:w-28  font-bold py-2 px-4 mb-2 lg:mb-0 rounded mr-4 btn btn-success"
                                    type="submit"
                                    onClick={handleSubmission}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};
export default CreateExpense;
