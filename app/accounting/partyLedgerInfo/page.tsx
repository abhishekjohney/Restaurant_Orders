// @ts-nocheck
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ListApi } from "@/app/utils/api";
import { UpdateAPI } from "@/app/utils/api";
import BackButton from "@/components/BackButton";
import { LocationData, PartyItemType } from "@/types";
import { formatDate, formatDate2, getNextDay } from "@/lib/helper-function";
import { useModal } from "@/Provider";
import CustomModal from "@/components/Modal";
import EditNewPayment from "@/components/common/newPayment";
import { Spinner } from "@/components/Spinner";
import partyListIcon from "../../../public/images/svg/partyList.svg";
import Image from "next/image";
import { Ledger } from "next/font/google";
import { useReactToPrint } from "react-to-print";

const PartyLedgerInfo = ({ params }: { params: { orderId: any } }) => {
    const listAPI = new ListApi();
    const { isOpen } = useModal();

    const [year, setYear] = useState("");
    const [route, setRoute] = useState("");
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [userCode, setUserCode] = useState("");
    const [userId, setUserId] = useState("");
    const componentRef = useRef();

    const [showModal, setShowModal] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSearchAcc, setShowSearchAcc] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [startDate, setStartDate] = useState<Date>(getNextDay());
    const [endDate, setEndDate] = useState<Date>(getNextDay());
    const [currentDate, setCurrentDate] = useState<Date>(getNextDay());
    const [searchQuery, setSearchQuery] = useState("");
    const [searchQueryAcc, setSearchQueryAcc] = useState("");
    const [filteredPartyList, setFilteredPartyList] = useState<PartyItemType[]>([]);
    const [filteredPartyListAcc, setFilteredPartyListAcc] = useState<PartyItemType[]>([]);
    const [accountLedger, setAccountLedger] = useState([]);
    const [maxHeight, setMaxHeight] = useState(0);
    const [showAcPartyInputs, setShowAcPartyInputs] = useState(false);
    const [creating, setCreating] = useState(true);
    const [showPartyModal, setShowPartyModal] = useState(false);
    const [choosenParty, setChoosenParty] = useState("");
    const [refresParty, setRefreshParty] = useState(false);
    const [editData, setEditData] = useState({
        UserCode: "",
        UserId: "",
        AccAutoID: "",
        date: "",
        Byr_Cd: "",
        OrderId: "",
        OrderNo: "",
        vehicleNumber: "",
        remark: "",
    });
    const [formData, setFormdData] = useState({
        BuyerName: "",
        accAddress: "",
        AccAutoID: "",
        AccAutoIDClient: "",
        Byr_Cd: "",
    });
    const [formData2, setFormdData2] = useState({
        BuyerName: "",
        accAddress: "",
        AccAutoID: "",
        AccAutoIDClient: "",
        Byr_Cd: "",
    });

    useEffect(() => {
        if (typeof window !== "undefined" && window.localStorage) {
            const userDetails = localStorage.getItem("UserYear");
            if (userDetails) {
                const parts = userDetails.split("_");
                if (parts.length >= 4) {
                    setYear(parts[1]);
                    setRoute(parts[3]);
                    setVehicleNumber(parts[2]);
                }
            }
        }
    }, []);

    const [partyList, setPartyList] = useState<PartyItemType[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await listAPI.getPartyList();
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
                    setLoading(false);
                    setPartyList(updatedPartyList);
                }
                setLoading(false)
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
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
        if (searchQuery) {
            if (partyList?.length > 0) {
                const filteredList = partyList.filter((item) =>
                    item.Byr_nam.toLowerCase().includes(searchQuery.toLowerCase())
                );
                const filteredListAcc = partyList.filter((item) =>
                    item.Byr_nam.toLowerCase().includes(searchQueryAcc.toLowerCase())
                );
                setFilteredPartyList(filteredList);
                setFilteredPartyListAcc(filteredListAcc);
            }
        } else {
            setFilteredPartyList(partyList);
            setFilteredPartyListAcc(partyList);
        }
    }, [searchQuery, partyList, searchQueryAcc]);

    const handleOrder = async (selectedItem: PartyItemType) => {
        setLoading(true);
        setShowSearch(false);
        setShowSearchAcc(false);
        setShowPartyModal(false);

        setSearchQuery(selectedItem?.Byr_nam);
        setFormdData({
            ...formData,
            BuyerName: selectedItem.Byr_nam,
            accAddress: selectedItem.combinedField,
            AccAutoID: selectedItem.AccAutoID,
            AccAutoIDClient: selectedItem.AccAutoIDClient,
            Byr_Cd: selectedItem.Byr_Cd,
        });

        const formatStart = formatDate2(startDate);
        const formatEnd = formatDate2(endDate);

        try {
            setLoading(true);
            const response = await listAPI.getpartypaymentdetailByDate(
                "0",
                selectedItem?.BuyerName,
                selectedItem?.AccAutoID,
                formatStart,
                formatEnd
            );

            if (response) {
                const sortArr = response[0]?.AccountLedger.sort((a, b) => a.seno - b.seno);
                setAccountLedger(sortArr);
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
        }

        setShowModal(false);
        setShowPartyModal(false);

        setLoading(false);
    };

    const lastItemIndex = accountLedger?.length - 1; // Get the index of the last item
    const lastItemCLR = lastItemIndex >= 0 ? accountLedger[lastItemIndex].CLR : "";

    const handleRefresh = async () => {
        setRefreshParty(true);

        const formatStart = formatDate2(startDate);
        const formatEnd = formatDate2(endDate);

        try {
            const response = await listAPI.getpartypaymentdetailByDate(
                "0",
                formData?.BuyerName,
                formData?.AccAutoID,
                formatStart,
                formatEnd
            );

            if (response) {
                const sortArr = response[0]?.AccountLedger.sort((a, b) => a.seno - b.seno);
                setAccountLedger(sortArr);
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    function getBackgroundColorClass(color) {
        switch (color) {
            case "RED":
                return "bg-red-500";
            case "BLUE":
                return "bg-blue-500";
            case "GREEN":
                return "bg-green-500";
            default:
                return ""; // No specific background color class
        }
    }

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, val: string) => {
        if (val === "start") {
            const inputValue = e.target.value;
            const newDate = new Date(inputValue);
            setStartDate(newDate);
        } else {
            const inputValue = e.target.value;
            const newDate = new Date(inputValue);
            setEndDate(newDate);
        }
    };

    const hangleModalData = (val: string) => {
        setShowPartyModal(true);
        setChoosenParty(val);
    };

    return (
        <>
            <div className="flex min-h-screen">
                {loading && <Spinner />}
                <div className="w-full mt-[75px] md:mt-20 lg:mt-0 overflow-auto absolute right-0  py-6 px-5 p-4 md:p-6 lg:p-8 xl:p-10">
                    {isOpen && (
                        <CustomModal
                            children={<EditNewPayment userCode={userCode} userId={userId} />}
                            title="New Payment"
                        ></CustomModal>
                    )}
                    {/* Form */}
                    <div className="shadow-md flex-col flex items-start justify-between mb-2 p-2 rounded-lg">
                        <div className="flex  w-full justify-between items-center">
                            <BackButton path="Party Ledger" />
                            <h3 className=" text-xl font-semibold">Party Ledger Info</h3>
                        </div>
                    </div>
                    <form className="bg-white shadow-md rounded px-3 md:px-8 py-2 md:py-7 mb-4">
                        <div className="mb-4 flex justify-start items-center">
                            <label className="block text-warning-content text-start basis-1/5 text-sm font-bold mb-2">
                                Buyer Name
                            </label>
                            <div className="relative flex gap-2 w-full">
                                <input
                                    type="text"
                                    onClick={() => setShowSearch(!showSearch)}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="shadow appearance-none border input-info rounded w-full py-2 px-3 leading-tight "
                                    placeholder="Enter Buyer Name"
                                    value={searchQuery}
                                />
                                <button type="button" onClick={() => hangleModalData("selectParty")}>
                                    <Image
                                        src={partyListIcon}
                                        height={100}
                                        width={100}
                                        className="size-10"
                                        alt="PartyIcon"
                                    />
                                </button>

                                <div className="absolute top-7 max-h-40 h-auto overflow-auto w-full">
                                    {showSearch &&
                                        filteredPartyList &&
                                        filteredPartyList.map((item) => (
                                            <div key={item.AccAutoID} className="w-full bg-white p-0.5 rounded">
                                                <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                                                    <div
                                                        className="text-md font-semibold text-success-content cursor-pointer"
                                                        onClick={() => {
                                                            // setPartySelected("selectParty");
                                                            handleOrder(item);
                                                        }}
                                                    >
                                                        {item.Byr_nam}
                                                    </div>
                                                    <div className="text-sm font-medium text-success-content">
                                                        {item.AccAddress}
                                                    </div>
                                                    <div className="text-sm font-medium text-success-content">
                                                        {item.VATNO}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                        <div className="mb-4 flex justify-start items-center">
                            <label className="block text-warning-content basis-1/5 text-start text-sm font-bold mb-2">
                                Acc Address
                            </label>
                            <input
                                type="text"
                                className="shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight"
                                placeholder="Enter Acc Address"
                                value={formData.accAddress}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3 h-auto">
                            <div className="justify-start block items-center">
                                <label htmlFor="startDate" className="block text-warning-content basis-1/5 sm:basis-1/3 text-sm font-bold mb-2">
                                    Start Date
                                </label>
                                <input
                                    value={formatDate(startDate)}
                                    onChange={(e) => handleDateChange(e, "start")}
                                    type="date"
                                    id="startDate"
                                    className="shadow appearance-none border input-info rounded w-full py-2 px-3"
                                    placeholder="Enter Remarks"
                                />
                            </div>

                            <div className="justify-start block items-center">
                                <label className="block text-warning-content basis-1/5 sm:basis-1/3 text-sm font-bold mb-2">
                                    End Date
                                </label>
                                <input
                                    value={formatDate(endDate)}
                                    onChange={(e) => handleDateChange(e, "end")}
                                    type="date"
                                    className="shadow appearance-none border input-info rounded w-full py-2 px-3"
                                    placeholder="Enter Remarks"
                                />
                            </div>
                        </div>
                        <div className="flex items-center w-full justify-between">
                            <div className="lg:flex mt-1 justify-center items-center">
                                <button
                                    className=" w-full lg:w-28  font-bold py-2 px-4 mb-2 lg:mb-0 rounded mr-4 btn btn-success"
                                    type="button"
                                    onClick={handleRefresh}
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {accountLedger.length > 0 && (
                            <>
                                <button
                                    onClick={handlePrint}
                                    type="button"
                                    className="bg-primary font-semibold my-2 rounded-md shadow-lg px-3 py-2"
                                >
                                    Print
                                </button>

                                <div ref={componentRef} className="container mt-10 max-w-screen w-[95%] mx-auto">
                                    <div className="h-auto w-full rounded-lg">
                                        <label className="block text-warning-content text-lg font-bold mb-2">
                                            Party Accounts Details
                                        </label>
                                        <div className="flex mb-3 flex-col justify-center font-semibold text-base gap-3 items-start">
                                            <h2>{formData?.BuyerName}</h2>
                                            <h2>{formData?.accAddress}</h2>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 max-h-full shadow-lg">
                                            <div className=" w-full   bg-white">
                                                {/* Additional details table */}
                                                <table className="bg-white  table rounded-lg shadow-md">
                                                    {/* Table headers */}
                                                    <thead className="">
                                                        <tr>
                                                            <th className="py-2 px-4 text-left text-warning-content">
                                                                Date
                                                            </th>
                                                            <th className="py-2 px-4 text-left text-warning-content">
                                                                Debit
                                                            </th>
                                                            <th className="py-2 px-4 text-left text-warning-content">
                                                                Credit
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    {/* Table body */}
                                                    <tbody>
                                                        {accountLedger &&
                                                            accountLedger.map((listItem, index) => (
                                                                <tr key={index}>
                                                                    <td className={`py-2 px-4 text-black  items-center`}>
                                                                        <div className="mr-2">
                                                                            {listItem.CT_DT
                                                                                ? new Intl.DateTimeFormat("en-IN").format(
                                                                                      new Date(
                                                                                          parseInt(
                                                                                              listItem.CT_DT.replace(
                                                                                                  "/Date(",
                                                                                                  ""
                                                                                              ).replace(")/", ""),
                                                                                              10
                                                                                          )
                                                                                      )
                                                                                  )
                                                                                : ""}
                                                                        </div>
                                                                        <div className="mr-2 text-black">
                                                                            {listItem.TRANSTYPE}
                                                                        </div>
                                                                        <div className=" text-black">
                                                                            {listItem.BALANCE}
                                                                        </div>
                                                                    </td>
                                                                    <td className={`py-2 px-4 text-black`}>
                                                                        {listItem.CDRAMOUNT}
                                                                    </td>
                                                                    <td className={`py-2 px-4 text-black`}>
                                                                        {listItem.CCRAMOUNT}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div></div>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </div>

            {showPartyModal && (
                <div
                    id="default-modal"
                    aria-hidden="true"
                    className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0"
                >
                    <div className="relative p-4 w-full h-screen flex justify-center items-center max-w-screen max-h-screen">
                        <div className="absolute inset-0 bg-black opacity-35 w-full h-full"></div>
                        <div className="relative bg-white z-[100000] w-full md:w-fit md:min-w-[80%] rounded-lg shadow-xl">
                            <div className="flex items-center w-full p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                                <h3 className="text-xl w-full font-semibold text-center mx-auto text-gray-900">
                                    Choose a Party
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowPartyModal(false)}
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                    data-modal-hide="default-modal"
                                >
                                    <svg
                                        className="w-3 h-3"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 14 14"
                                    >
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
                                <div>
                                    <>
                                        <div className="relative flex-col flex gap-2 w-full">
                                            <input
                                                type="text"
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="shadow appearance-none border input-info rounded w-full py-2 px-3 leading-tight "
                                                placeholder="Enter Buyer Name"
                                                value={searchQuery}
                                            />
                                            <div className="max-h-80 h-auto overflow-auto w-full">
                                                {filteredPartyList &&
                                                    filteredPartyList.map((item) => (
                                                        <div key={item.AccAutoID} className="w-full bg-white p-0.5 rounded">
                                                            <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                                                                <div
                                                                    className="text-md font-semibold text-success-content cursor-pointer"
                                                                    onClick={() => {
                                                                        // setPartySelected("selectParty");
                                                                        handleOrder(item);
                                                                    }}
                                                                >
                                                                    {item.Byr_nam}
                                                                </div>
                                                                <div className="text-sm font-medium text-success-content">
                                                                    {item.AccAddress}
                                                                </div>
                                                                <div className="text-sm font-medium text-success-content">
                                                                    {item.VATNO}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDetail && (
                <>
                    <div
                        id="default-modal"
                        tabindex="-1"
                        aria-hidden="true"
                        className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0"
                    >
                        <div className="relative p-4 w-full h-screen flex justify-center items-center max-w-screen max-h-screen">
                            <div className="absolute inset-0 bg-black opacity-35 w-full h-full"></div>
                            <div className="relative bg-white z-[100000] w-full md:w-fit md:min-w-[80%] rounded-lg shadow-xl">
                                <div className="flex items-center w-full p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                                    <h3 className="text-xl w-full font-semibold text-center mx-auto text-gray-900">
                                        {formData?.BuyerName}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowDetail(false)}
                                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                        data-modal-hide="default-modal"
                                    >
                                        <svg
                                            className="w-3 h-3"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 14 14"
                                        >
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
                                {/* content starts */}
                                <div className="p-4 md:p-5 space-y-4">
                                    <div className="grid md:hidden mt-6 grid-cols-1 w-full gap-6 px-2 max-h-96 overflow-y-auto">
                                        <div className=" w-full   bg-gray-100">
                                            {/* Additional details table */}
                                            <table className="bg-white  table rounded-lg shadow-md">
                                                {/* Table headers */}
                                                <thead className="bg-primary">
                                                    <tr>
                                                        <th className="py-2 px-4 text-left text-warning-content">Date</th>
                                                        <th className="py-2 px-4 text-left text-warning-content">Debit</th>
                                                        <th className="py-2 px-4 text-left text-warning-content">Credit</th>
                                                    </tr>
                                                </thead>
                                                {/* Table body */}
                                                <tbody>
                                                    {accountLedger &&
                                                        accountLedger.map((listItem, index) => (
                                                            <tr key={index}>
                                                                <td
                                                                    className={`py-2 px-4 ${getBackgroundColorClass(
                                                                        listItem.CLR
                                                                    )}  items-center`}
                                                                >
                                                                    <div className="mr-2">
                                                                        {listItem.CT_DT
                                                                            ? new Intl.DateTimeFormat("en-US").format(
                                                                                  new Date(
                                                                                      parseInt(
                                                                                          listItem.CT_DT.replace(
                                                                                              "/Date(",
                                                                                              ""
                                                                                          ).replace(")/", ""),
                                                                                          10
                                                                                      )
                                                                                  )
                                                                              )
                                                                            : ""}
                                                                    </div>
                                                                    <div className="mr-2">{listItem.TRANSTYPE}</div>
                                                                    <div>{listItem.BALANCE}</div>
                                                                </td>
                                                                <td
                                                                    className={`py-2 px-4 ${
                                                                        listItem.DRAMOUNT > 0 ? "bg-red-500 text-white" : ""
                                                                    }`}
                                                                >
                                                                    {listItem.CDRAMOUNT}
                                                                </td>
                                                                <td
                                                                    className={`py-2 px-4 ${
                                                                        listItem.CRAMOUNT > 0
                                                                            ? "bg-green-500 text-white"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    {listItem.CCRAMOUNT}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="hidden md:block lg:block overflow-x-auto ">
                                        <div className=" h-64 w-full overflow-scroll  bg-gray-100">
                                            {/* Additional details table */}
                                            <table className="bg-white table rounded-lg shadow-md">
                                                {/* Table headers */}
                                                <thead className="bg-primary">
                                                    <tr>
                                                        <th className="py-2 px-4 text-left text-warning-content">SI.No</th>
                                                        <th className="py-2 px-4 text-left text-warning-content">Date</th>
                                                        <th className="py-2 px-4 text-left text-warning-content">
                                                            Ref/VchNo
                                                        </th>
                                                        <th className="py-2 px-4 text-left text-warning-content">Nature</th>
                                                        <th className="py-2 px-4 text-left text-warning-content">Debit</th>
                                                        <th className="py-2 px-4 text-left text-warning-content">Credit</th>
                                                        <th className="py-2 px-4 text-left text-warning-content">
                                                            Balance
                                                        </th>
                                                    </tr>
                                                </thead>
                                                {/* Table body */}
                                                <tbody>
                                                    {accountLedger &&
                                                        accountLedger.map((listItem, index) => (
                                                            <tr key={index}>
                                                                <td className="py-2 px-4">{index + 1}</td>
                                                                <td className="py-2 px-4">
                                                                    {listItem.CT_DT
                                                                        ? new Intl.DateTimeFormat("en-US").format(
                                                                              new Date(
                                                                                  parseInt(
                                                                                      listItem.CT_DT.replace(
                                                                                          "/Date(",
                                                                                          ""
                                                                                      ).replace(")/", ""),
                                                                                      10
                                                                                  )
                                                                              )
                                                                          )
                                                                        : ""}
                                                                </td>
                                                                <td className="py-2 px-4">{listItem.vchno}</td>
                                                                <td className="py-2 px-4">{listItem.TRANSTYPE}</td>
                                                                <td
                                                                    className={`py-2 px-4 ${
                                                                        listItem.DRAMOUNT > 0 ? "bg-red-500 text-white" : ""
                                                                    }`}
                                                                >
                                                                    {listItem.CDRAMOUNT}
                                                                </td>
                                                                <td
                                                                    className={`py-2 px-4 ${
                                                                        listItem.CRAMOUNT > 0
                                                                            ? "bg-green-500 text-white"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    {listItem.CCRAMOUNT}
                                                                </td>
                                                                <td
                                                                    className={`py-2 px-4 ${getBackgroundColorClass(
                                                                        listItem.CLR
                                                                    )}`}
                                                                >
                                                                    {listItem.BALANCE}
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
                </>
            )}
        </>
    );
};
export default PartyLedgerInfo;
