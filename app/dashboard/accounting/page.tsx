// @ts-nocheck
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

const Accounting = ({ params }: { params: { orderId: any } }) => {
    const listAPI = new ListApi();
    const { isOpen } = useModal();

    const [year, setYear] = useState("");
    const [route, setRoute] = useState("");
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [userCode, setUserCode] = useState("");
    const [userId, setUserId] = useState("");

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
    const [selectedBillItem, setSelectedBillItem] = useState([]);
    const [accountLedger, setAccountLedger] = useState([]);
    const [maxHeight, setMaxHeight] = useState(0);
    const [showAcPartyInputs, setShowAcPartyInputs] = useState(false);
    const [creating, setCreating] = useState(true);
    const [showPartyModal, setShowPartyModal] = useState(false);
    const [choosenParty, setChoosenParty] = useState("");
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

                    setPartyList(updatedPartyList);
                }
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

    const handleOrder = async (selectedItem: PartyItemType, itemSelect: string) => {
        setLoading(false);
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
        const storedUserYear = localStorage.getItem("UserYear");

        // Extract the numeric part from the string
        const yearArray = storedUserYear.split("_");
        const numericYear = yearArray[1];

        //console.log(numericYear);

        try {
            const response = await listAPI.getpartypaymentdetail(numericYear, selectedItem.Byr_nam, selectedItem.AccAutoID);
            if (response) {
                setSelectedBillItem(response);
                setAccountLedger(response[0].AccountLedger);
            }
        } catch (error) {
            console.error(error);
        }

        // Close the modal after selecting an item
        setShowModal(false);
        setShowPartyModal(false);

        setLoading(false);
    };

    useEffect(() => {
        if (params.orderId) {
            setLoading(false);
            const decodedOrderId = decodeURIComponent(atob(decodeURIComponent(params?.orderId)));
            const decodedInfoArray = decodedOrderId.split("--");

            if (decodedInfoArray[0] !== "0") {
                setCreating(false);
                setLoading(false);
                setEditData({
                    ...editData,
                    UserCode: decodedInfoArray[4],
                    remark: decodedInfoArray[9],
                    OrderId: decodedInfoArray[2],
                    OrderNo: decodedInfoArray[3],
                    UserId: decodedInfoArray[8],
                    AccAutoID: decodedInfoArray[1],
                    date: decodedInfoArray[6],
                    vehicleNumber: decodedInfoArray[5],
                });
                setFormdData({
                    ...formData,
                    BuyerName: decodedInfoArray[0],
                    AccAutoID: decodedInfoArray[1],
                });
                setRemarks(decodedInfoArray[9]);

                const dateString = decodedInfoArray[7];
                const dateParts = dateString.split("-");
                const year = parseInt(dateParts[2]);
                const month = parseInt(dateParts[1]) - 1;
                const day = parseInt(dateParts[0]);
                const date = new Date(year, month, day);
                // setSelectedDate(date);

                if (partyList?.length > 0) {
                    setLoading(false);
                    const result = partyList?.filter((item) => item?.AccAutoIDClient === decodedInfoArray[1]);
                    if (result?.length > 0) {
                        handleOrder(result[0], "selectParty");
                        setLoading(false);
                    }
                }
                setLoading(false);
            } else {
                setCreating(true);
                setLoading(false);
            }
        }
    }, [params?.orderId, partyList]);

    const lastItemIndex = accountLedger?.length - 1; // Get the index of the last item
    const lastItemCLR = lastItemIndex >= 0 ? accountLedger[lastItemIndex].CLR : "";

    const handleSubmission = async (e) => {
        e.preventDefault();
        const formattedDate = formatDate2(selectedDate);
        // console.log("api called");
        // if (locationData.LocPlace === "NA") toast.warn("Please allow location in site settings");

        // if (editData?.OrderNo) {
        //     console.log(" edit ");
        //     try {
        //         const response = await updateAPI.editneworder(
        //             editData?.UserCode, // userCode
        //             editData?.UserId, // userId
        //             formData?.AccAutoID,
        //             remarks,
        //             formattedDate,
        //             formData2.AccAutoID,
        //             editData?.OrderId,
        //             editData?.vehicleNumber
        //         );
        //         if (response) {
        //             toast.success("Order Updated successfully");
        //             router.push("/todaysOrders");
        //         } else {
        //             toast.error("Failed to Create Order");
        //         }
        //     } catch (error) {
        //         console.error(error);
        //     }
        // } else {
        //     console.log("new");
        //     if (!formData?.AccAutoID) return toast.warn("select a party");

        //     try {
        //         const response = await updateAPI.createneworder(
        //             session.data?.user.name, // userCode
        //             session.data?.user.id, // userId
        //             formData.AccAutoID,
        //             remarks,
        //             formattedDate,
        //             formData2.AccAutoID,
        //             [locationData]
        //         );
        //         console.log("response", response);
        //         if (response) {
        //             toast.success("Order created successfully");
        //             router.push("/todaysOrders");
        //         } else {
        //             toast.error("Failed to Create Order");
        //         }
        //     } catch (error) {
        //         console.error(error);
        //     }
        // }
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
                            <BackButton />
                            <h3 className=" text-xl font-semibold">Accounts</h3>
                        </div>
                    </div>
                    <form className="bg-white shadow-md rounded px-3 md:px-8 py-2 md:py-7 mb-4">
                        {/* <div className="lg:flex justify-between items-center">
                            <div className="flex gap-2">
                                {selectedBillItem &&
                                    selectedBillItem.map((item, index) => (
                                        <div key={index} className="w-fit mx-2 flex my-auto">
                                            <h2
                                                onClick={() => setShowDetail(!showDetail)}
                                                className={`text-md rounded-md flex gap-3 shadow-lg whitespace-nowrap font-semibold p-3 ${getBackgroundColorClass(
                                                    lastItemCLR
                                                )}`}
                                            >
                                                {item.OPDRBLC && item.OPDRBLC > 0
                                                    ? `₹: ${item.OPDRBLC}`
                                                    : `₹: ${item.OPCRBLC}`}
                                                <span>
                                                    <FcViewDetails size="25" />
                                                </span>
                                            </h2>
                                        </div>
                                    ))}
                            </div>
                        </div> */}

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
                                                            handleOrder(item, "selectParty");
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
                                value={formData2.accAddress}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-auto">
                            <div className="justify-start md:block hidden items-center">
                                <label className="block text-warning-content basis-1/5 sm:basis-1/3 text-sm font-bold mb-2">
                                    Start Date
                                </label>
                                <input
                                    value={formatDate(startDate)}
                                    onChange={(e) => handleDateChange(e, "start")}
                                    type="date"
                                    className="shadow appearance-none border input-info rounded w-full py-2 px-3"
                                    placeholder="Enter Remarks"
                                />
                            </div>

                            <div className="justify-start md:block hidden items-center">
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
                                                                        handleOrder(item, "selectParty");
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
export default Accounting;
