// @ts-nocheck
"use client";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { ListApi } from "@/app/utils/api";
import BackButton from "@/components/BackButton";
import { EmployeeDetailInterface } from "@/types";
import { Spinner } from "@/components/Spinner";
import partyListIcon from "../../../public/images/svg/partyList.svg";
import Image from "next/image";
import { useReactToPrint } from "react-to-print";

const EmployeeInfo = ({ params }: { params: { orderId: any } }) => {
    const listAPI = new ListApi();
    const session = useSession();

    const componentRef = useRef();

    const [showSearch, setShowSearch] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredPartyList, setFilteredPartyList] = useState<EmployeeDetailInterface[]>([]);
    const [employeeMasterList, setEmployeeMasterList] = useState<EmployeeDetailInterface[]>([]);
    const [showPartyModal, setShowPartyModal] = useState(false);
    const [attnList, setAttnList] = useState([]);

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

    const currentYear = currentDate.getFullYear();

    const [formData, setFormData] = useState({
        EMPAUTOID: "",
        EMPCODE: "",
        EmployeeName: "",
        Month: parseInt(currentDate.getMonth()),
        Year: currentYear,
    });

    const fetchData = async () => {
        setLoading(true);

        try {
            if (session?.data?.user?.name) {
                const response = await listAPI.getEmployeeMasterBalanceList();
                if (response.length > 0) {
                    if (session?.data?.user?.role !== "admin") {
                        const empData = response?.filter(
                            (data) => data?.EMPCODE === session?.data?.user?.name?.toUpperCase()
                        );
                        setEmployeeMasterList(empData);
                        setFormData({
                            ...formData,
                            EmployeeName: empData[0]?.EmployeeName,
                            EMPAUTOID: empData[0]?.EMPAUTOID,
                            EMPCODE: empData[0]?.EMPCODE,
                        });
                        setSearchQuery(empData[0]?.EmployeeName);
                    } else {
                        setEmployeeMasterList(response);
                    }
                }
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [session?.data?.user?.name]);

    useEffect(() => {
        if (searchQuery) {
            if (employeeMasterList?.length > 0) {
                const filteredList = employeeMasterList.filter(
                    (item) =>
                        item.EmployeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.EMPCODE.toLowerCase().includes(searchQuery.toLowerCase())
                );

                setFilteredPartyList(filteredList);
            }
        } else {
            setFilteredPartyList(employeeMasterList);
        }
    }, [searchQuery, employeeMasterList]);

    const handleOrder = async (selectedItem: EmployeeDetailInterface) => {
        setLoading(false);
        setShowSearch(false);
        setShowPartyModal(false);

        setSearchQuery(selectedItem?.EmployeeName);
        setFormData({
            ...formData,
            EMPAUTOID: selectedItem.EMPAUTOID,
            EMPCODE: selectedItem.EMPCODE,
            EmployeeName: selectedItem.EmployeeName,
        });

        try {
            const SelectedMonth = monthNames[formData?.Month];
            const response = await listAPI.getEmployeeAttListByCode(formData?.Year, SelectedMonth, selectedItem?.EMPAUTOID);

            if (response) {
                setAttnList(response);
            }
        } catch (error) {
            console.error(error);
        }

        setShowPartyModal(false);
        setLoading(false);
    };

    const handleSubmission = async () => {
        try {
            const SelectedMonth = monthNames[formData?.Month];
            const response = await listAPI.getEmployeeAttListByCode(formData?.Year, SelectedMonth, formData?.EMPAUTOID);

            if (response) {
                setAttnList(response);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const hangleModalData = () => {
        setShowPartyModal(true);
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    return (
        <>
            <div className="flex min-h-screen">
                {loading && <Spinner />}
                <div className="w-full mt-[75px] md:mt-20 lg:mt-0 overflow-auto absolute right-0  py-6 px-5 p-4 md:p-6 lg:p-8 xl:p-10">
                    {/* Form */}
                    <div className="shadow-md flex-col flex items-start justify-between mb-2 p-2 rounded-lg">
                        <div className="flex  w-full justify-between items-center">
                            <BackButton path="Employee Info" />
                            <h3 className=" text-xl font-semibold">Employee Info</h3>
                        </div>
                    </div>

                    <div className="bg-white shadow-md rounded px-3 md:px-8 py-2 md:py-7 mb-4">
                        <div className="mb-4 flex justify-start items-center">
                            <label className="block text-warning-content text-start basis-1/5 text-sm font-bold mb-2">
                                Employee Name
                            </label>

                            <div className="relative flex gap-2 w-full">
                                <input
                                    type="text"
                                    onClick={() => setShowSearch(!showSearch)}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="shadow appearance-none border input-info rounded w-full py-2 px-3 leading-tight "
                                    placeholder="Enter Employee Name"
                                    value={searchQuery}
                                />
                                <button type="button" onClick={hangleModalData}>
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
                                            <div key={item.EMPAUTOID} className="w-full bg-white p-0.5 rounded">
                                                <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                                                    <div
                                                        className="text-md font-semibold text-success-content cursor-pointer"
                                                        onClick={() => {
                                                            // setPartySelected("selectParty");
                                                            handleOrder(item);
                                                        }}
                                                    >
                                                        {item.EmployeeName}
                                                    </div>
                                                    <div className="text-sm font-medium text-success-content">
                                                        {item.EMPCODE}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                        <div className="mb-4 flex justify-start items-center">
                            <label className="block text-warning-content basis-1/5 text-start text-sm font-bold mb-2">
                                Year
                            </label>
                            <select
                                name=""
                                className="shadow appearance-none border input-info text-sm rounded w-full py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                                id=""
                                onChange={(e) => setFormData({ ...formData, Year: e.target.value })}
                                value={formData?.Year}
                            >
                                <option value="">Select</option>
                                <option value="2022">2022</option>
                                <option value="2023">2023</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </select>
                        </div>
                        <div className="mb-4 flex justify-start items-center">
                            <label className="block text-warning-content basis-1/5 text-start text-sm font-bold mb-2">
                                Month
                            </label>
                            <select
                                name=""
                                onChange={(e) => setFormData({ ...formData, Month: parseInt(e.target.value) })}
                                value={formData?.Month}
                                className="shadow appearance-none border input-info text-sm rounded w-full py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                                id=""
                            >
                                <option value="">Select</option>
                                <option value="0">January</option>
                                <option value="1">February</option>
                                <option value="2">March</option>
                                <option value="3">April</option>
                                <option value="4">May</option>
                                <option value="5">June</option>
                                <option value="6">July</option>
                                <option value="7">August</option>
                                <option value="8">September</option>
                                <option value="9">October</option>
                                <option value="10">November</option>
                                <option value="11">December</option>
                            </select>
                        </div>

                        <div className="flex items-center w-full justify-between">
                            <div className="lg:flex mt-1 justify-center items-center">
                                <button
                                    className=" w-full lg:w-28  font-bold py-2 px-4 mb-2 lg:mb-0 rounded mr-4 btn btn-success"
                                    type="button"
                                    onClick={handleSubmission}
                                >
                                    Refresh
                                </button>
                            </div>
                            <button
                                className="px-3 py-2 bg-primary rounded-md shadow-lg font-semibold"
                                onClick={handlePrint}
                            >
                                Print
                            </button>
                        </div>
                    </div>

                    {attnList.length > 0 && (
                        <div ref={componentRef} className="w-full block">
                            <div className="flex gap-2 p-2 sm:flex-row flex-col justify-between flex-wrap items-start sm:items-center">
                                <div>
                                    <h2 className="font-medium text-lg text-black box-border">
                                        <strong>{formData?.EmployeeName}</strong>
                                    </h2>
                                    <h2 className="font-medium text-lg text-black box-border">
                                        userCode: <strong>{formData?.EMPCODE}</strong>
                                    </h2>
                                </div>
                                <div className="font-medium text-lg text-black box-border">
                                    <h2>
                                        Month: <strong>{monthNames[formData?.Month]}</strong>
                                    </h2>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <div className=" h-full w-full overflow-x-auto  bg-gray-100">
                                    <table className="bg-white table rounded-lg shadow-md">
                                        <thead className="bg-transparent">
                                            <tr>
                                                <th className="py-2 px-4 text-left sticky text-warning-content">Date</th>
                                                <th className="py-2 px-4 text-left text-warning-content">Type</th>
                                                <th className="py-2 px-4 text-left text-warning-content">Amount</th>
                                                <th className="py-2 px-4 text-left text-warning-content">Balance</th>
                                                <th className="py-2 px-4 text-left text-warning-content">Days</th>
                                                <th className="py-2 px-4 text-left text-warning-content">Payment</th>
                                                <th className="py-2 px-4 text-left text-warning-content">Extra</th>
                                            </tr>
                                        </thead>
                                        {/* Table body */}
                                        <tbody>
                                            {attnList &&
                                                attnList.slice(1).map((listItem, index) => {
                                                    const datestr = listItem.AttDateStr.split("-");
                                                    const dayDate = datestr[0];
                                                    let day;
                                                    let time;
                                                    if (listItem?.OTDay > 0) day = listItem?.OTDay;
                                                    if (listItem?.OTWHrs > 0 || listItem?.OTWMins > 0)
                                                        time = `${listItem?.OTWHrs}:${listItem?.OTWMins}`;
                                                    return (
                                                        <tr key={index}>
                                                            <td className="py-2 px-4 sticky">{listItem?.AttDateStr}</td>
                                                            <td className={`py-2 px-4 text-black`}>{listItem.AttType1}</td>
                                                            <td className="py-2 px-4">{listItem.AttAmt}</td>
                                                            <td className={`py-2 px-4 text-black`}>{listItem.BalAmt}</td>
                                                            <td className="py-2 px-4">{listItem.AttValue}</td>
                                                            <td className="py-2 px-4">{listItem.PayAdvAmt}</td>
                                                            <td className="flex flex-col">
                                                                <td className="py-2 px-4">{day ? `${day} Day` : ""}</td>
                                                                <td className="py-2 px-4">{time ? `${time} mnts` : ""}</td>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
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
                                    Choose a Employee
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
                                                            {item.EmployeeName}
                                                        </div>
                                                        <div className="text-sm font-medium text-success-content">
                                                            {item.EMPCODE}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
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
export default EmployeeInfo;
