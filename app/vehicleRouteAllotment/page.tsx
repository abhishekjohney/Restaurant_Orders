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
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { RiLoader2Fill } from "react-icons/ri";
import EditVehicleRoute from "@/components/common/editVehicleRoute";

interface vehicleRouteInterface {
    ALTROUTE: string;
    ALTVEHNO: string;
    ActionType: number;
    Cdate: string; // Assuming this is a date string format
    CdateStr: string;
    EMPAUTOID: number;
    EMPCODE: string;
    EMPNAME: string;
    REMARKS: string;
    TASK: string;
    USERID: number;
    WRALTID: number;
}

const TodayExpense = () => {
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

    const [todayExpense, setTodayExpense] = useState<vehicleRouteInterface[]>([]);
    const [filteredExpenseList, setFilteredExpenseList] = useState<vehicleRouteInterface[]>([]);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<any>(getNextDay());
    const [showSearchUser, setShowSearchUser] = useState(false);
    const [userTypes, setUserTypes] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUserType, setSelectedUserType] = useState<string>("");
    const [totalSum, setTotalSum] = useState("0");
    const [newExpenseData, setNewExpenseData] = useState<vehicleRouteInterface>();
    const [submitted, setSubmitted] = useState(false);
    const [updated, setUpdated] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const formattedDate = date ? formatDate2(date) : "";

        if (session.data?.user.role === "admin") {
            const data = await listAPI.getVehicleRouteList(formattedDate, selectedUserType);
            console.log(data, "result");
            if (data?.length > 0) {
                setTodayExpense(data);
                setLoading(false);
            }
            setLoading(false);
        } else {
            if (session?.data?.user?.name) {
                const data = await listAPI.getVehicleRouteList(formattedDate, session?.data?.user?.name);
                if (data?.length > 0) {
                    setTodayExpense(data);
                    setLoading(false);
                }
            }
            setLoading(false);
        }
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
        fetchData();
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

    const handleUserCombo = async (value: string) => {
        if (value === "null") {
            setSelectedUserType("");
        } else {
            setSelectedUserType(value);
        }
        setShowSearchUser(!showSearchUser);
    };

    useEffect(() => {
        if (searchQuery) {
            if (todayExpense?.length > 0) {
                const filteredList = todayExpense?.filter(
                    (item) =>
                        item?.EMPNAME?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item?.EMPCODE?.toLowerCase().includes(searchQuery.toLowerCase())
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

    const handleItem = (item: vehicleRouteInterface) => {
        setNewExpenseData(item);
        setOpen();
    };
    
    useEffect(() => {
        fetchData()
    },[updated])

    return (
        <>
            {isOpen && (
                <CustomModal
                    children={
                        <EditVehicleRoute
                            route={route}
                            updated={updated}
                            setUpdated={setUpdated}
                            userCode={userCode}
                            newExpenseData={newExpenseData}
                            userId={userId}
                            vehicle={vehicleNumber}
                        />
                    }
                    title="Vehicle Route Allotment"
                ></CustomModal>
            )}
            <div className=" bg-slate-100 min-h-screen mt-24 sm:mt-20 md:mt-20 lg:mt-2 shadow-md flex justify-center">
                {loading && <Spinner />}
                <div className="w-full md:p-6 p-1">
                    <div className="bg-slate-100 shadow-md flex-col flex items-start justify-between mb-2 p-2 rounded-lg">
                        <div className="flex w-full justify-between items-center">
                            <BackButton />
                            <h3 className="md:text-3xl text-xl font-semibold">Vehicle Route</h3>
                        </div>
                        <div className="flex w-full flex-wrap justify-between items-center my-1 gap-2">
                            {/* <div className="flex gap-2 justify-between items-center">
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
                                                    onClick={() => setShowSearchUser(!showSearchUser)}
                                                    onChange={(e) => handleSelectUserType(e.target.value)}
                                                    className="shadow appearance-none border input-info text-sm rounded max-w-32 w-fit py-1 px-1.5 my-auto sm:py-2 sm:px-3  leading-tight "
                                                    placeholder="select"
                                                    value={selectedUserType}
                                                />
                                                <div
                                                    className={`max-w-48 ${
                                                        showSearchUser
                                                            ? "max-h-40 h-auto z-[300] overflow-auto w-[230px] absolute top-8"
                                                            : ""
                                                    } `}
                                                >
                                                    {showSearchUser &&
                                                        userTypes &&
                                                        userTypes.map((item, ind) => (
                                                            <div key={ind} className="w-full bg-white p-0.5 rounded">
                                                                <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                                                                    <div
                                                                        className="text-sm font-medium whitespace-nowrap text-success-content cursor-pointer"
                                                                        onClick={() => {
                                                                            // setPartySelected("selectParty");
                                                                            handleUserCombo(item?.EMPCODE);
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
                                <button
                                    onClick={fetchData}
                                    className="btn btn-primary btn-sm md:btn-md font-semibold md:font-bold p-2 md:px-4   rounded"
                                >
                                    Filter
                                </button>
                            </div> */}
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
                        </div>
                    </div>

                    <div className="grid md:hidden mt-6 grid-cols-1 gap-6 px-2 sm:grid-cols-2 max-h-[32rem] overflow-y-auto lg:grid-cols-1">
                        {/* Card representation for smaller screens */}
                        {filteredExpenseList &&
                            filteredExpenseList?.map((item, ind) => (
                                <div key={ind} className="bg-primary shadow-md rounded-lg overflow-hidden">
                                    <div className="p-4">
                                        <h4 className="text-lg font-semibold mb-2">Date: {item.CdateStr}</h4>
                                        <p className=" text-warning-content mb-2">User Code: {item.EMPCODE}</p>
                                        <p className="text-warning-content font-semibold mb-2">User Name: {item.EMPNAME}</p>
                                        <p className=" text-warning-content mb-2">Route: {item.ALTROUTE}</p>
                                        <p className=" text-warning-content mb-2">Vehicle No.: {item.ALTVEHNO}</p>
                                        <p className=" text-warning-content mb-2">Task: {item.TASK}</p>
                                        <p className=" text-warning-content mb-2">Remark: {item.REMARKS}</p>
                                        <button
                                            className="bg-white font-semibold rounded shadow-lg px-3 py-2 mb-2"
                                            type="button"
                                            onClick={() => handleItem(item)}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>

                    <div className="bg-slate-100 w-full hidden md:block my-2 shadow overflow-auto  sm:rounded-lg">
                        <table className=" divide-gray-200 overflow-hidden table ">
                            <thead className="bg-primary sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        EMP CODE
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Route
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Vehicle No.
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Task
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">
                                        Remark
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredExpenseList &&
                                    filteredExpenseList?.map((item, ind) => (
                                        <tr key={ind}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {item.CdateStr ? item.CdateStr : "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {item.EMPCODE ? item.EMPCODE : "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {item.EMPNAME ? item.EMPNAME : "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {item.ALTROUTE ? item.ALTROUTE : "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {item.ALTVEHNO ? item.ALTVEHNO : "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.TASK ? item.TASK : "-"}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {item.REMARKS ? item.REMARKS : "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    className="mt-4 px-4 py-2 bg-primary rounded shadow-lg"
                                                    onClick={() => handleItem(item)}
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
        </>
    );
};

export default TodayExpense;
