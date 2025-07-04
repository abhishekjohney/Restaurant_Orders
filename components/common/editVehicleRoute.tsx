// @ts-nocheck
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiDelete } from "react-icons/fi";
import { getNextDay, formatDate, formatDate2 } from "@/lib/helper-function";
import { ListApi, LoginApi, UpdateAPI } from "@/app/utils/api";
import { NewExpenseInterface, PartyItemType } from "@/types";
import { useModal } from "@/Provider";
import { Spinner } from "../Spinner";
import { RiLoader2Fill } from "react-icons/ri";

type Props = {
    route?: string;
    vehicle?: string;
    userCode?: string;
    updated?: boolean;
    setUpdated: Dispatch<SetStateAction<boolean>>;
    userId?: string;
    newExpenseData?: vehicleRouteInterface;
};

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

interface RouteInterface {
    ActionType: number;
    CLIENTPRFIX: string;
    CLIENTTRANSID: string;
    GroupType: string;
    GrpID: number;
    IsActive: boolean;
    ORGAUTOID: number;
    OldGroup: null | any; // Assuming OldGroup can be null or any type
    ProductGroup: string;
    SVRUPDYN: number;
}

const EditVehicleRoute = (Props: Props) => {
    const listAPI = new ListApi();
    const login = new LoginApi();
    const updateAPI = new UpdateAPI();
    const router = useRouter();
    const session = useSession();
    const { setClose, isOpen, setOpen } = useModal();

    const [year, setYear] = useState("");
    const [route, setRoute] = useState("");
    const [vehicleNumber, setVehicleNumber] = useState("");

    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(getNextDay());
    const [userCode, setUserCode] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [userId, setUserId] = useState("");
    const [routes, setRoutes] = useState<RouteInterface[]>([]);

    const [formData, setFormData] = useState<vehicleRouteInterface>(Props?.newExpenseData);

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
    }, [session?.data?.user?.name]);

    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            const response = await login.getLocationDetails();
            if (response) {
                setRoutes(response);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmission = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        console.log(formData, "submitted");

        try {
            const response = await updateAPI.updateVehicleAllotment(formData);
            if (response) {
                toast.success("Route added successfully");
                Props?.setUpdated(!Props?.updated);
                setSubmitted(false);
                setClose();
            } else {
                setSubmitted(false);
                setClose();
                toast.error("Failed to Add Route");
            }
            setSubmitted(false);
        } catch (error) {
            setSubmitted(false);
            setClose();
            console.error(error);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const newDate = new Date(inputValue);
        setSelectedDate(newDate);
        setFormData({ ...formData, CdateStr: formatDate2(newDate) });
    };

    return (
        <>
            <div className="flex max-h-[87vh] h-full overflow-auto w-full">
                {loading && <Spinner />}
                <div className="w-full p-1 md:p-4">
                    <div>
                        <h2 className="font-semibold text-base text-black">Name: {formData?.EMPNAME}</h2>
                        <h2 className="font-semibold text-base text-black">Code: {formData?.EMPCODE}</h2>
                    </div>
                    <form className="bg-white shadow-md rounded p-4 md:px-8 md:py-7 mb-4">
                        <div className="mb-4 flex justify-start items-center">
                            <label className="block text-warning-content text-start basis-1/5 text-sm font-bold mb-2">
                                Routes
                            </label>
                            <select
                                name=""
                                className="shadow appearance-none border input-info text-sm rounded w-full py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                                id=""
                                onChange={(e) => setFormData({ ...formData, ALTROUTE: e.target.value })}
                                value={formData?.ALTROUTE}
                            >
                                <option value="">Select</option>
                                {routes.length > 0 &&
                                    routes?.map((data, index) => {
                                        return (
                                            <option key={index} value={data?.ProductGroup}>
                                                {data?.ProductGroup}
                                            </option>
                                        );
                                    })}
                            </select>
                        </div>
                        <div className="mb-4 flex justify-start items-center">
                            <label className="block text-warning-content text-start basis-1/5 text-sm font-bold mb-2">
                                Veichle
                            </label>
                            <select
                                name=""
                                className="shadow appearance-none border input-info text-sm rounded w-full py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                                id=""
                                onChange={(e) => setFormData({ ...formData, ALTVEHNO: e.target.value })}
                                value={formData?.ALTVEHNO}
                            >
                                <option value="">Select</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-auto">
                            <div className="flex justify-start items-center">
                                <div className="block text-warning-content basis-1/5 sm:basis-1/3 text-sm font-bold mb-2">
                                    <label htmlFor="">Remarks</label>
                                    <button
                                        onClick={() => setFormData({ ...formData, REMARKS: "" })}
                                        type="button"
                                        className="bg-gray-400 p-2 w-fit rounded-md shadow-lg border-2 border-white justify-center items-center flex gap-2 text-white text-xs font-medium capitalize"
                                    >
                                        <FiDelete /> clear
                                    </button>
                                </div>
                                <textarea
                                    onChange={(e) => setFormData({ ...formData, REMARKS: e.target.value })}
                                    value={formData?.REMARKS}
                                    name="Remarks"
                                    className="shadow h-auto appearance-none border input-info rounded w-full py-2 px-3"
                                    placeholder="Enter ..."
                                ></textarea>
                            </div>
                            <div className="flex justify-start items-center">
                                <label className="block text-warning-content basis-1/5 sm:basis-1/3 text-sm font-bold mb-2">
                                    Task
                                </label>
                                <input
                                    onChange={(e) => setFormData({ ...formData, TASK: e.target.value })}
                                    value={formData?.TASK}
                                    type="text"
                                    className="shadow appearance-none border input-info rounded w-full py-2 px-3"
                                    placeholder="Enter ..."
                                />
                            </div>
                        </div>
                        {submitted ? (
                            <>
                                <div className="flex items-center justify-center">
                                    <div className="lg:flex my-2 justify-center items-center">
                                        <button
                                            className=" w-full font-bold py-2 px-4 mb-2 lg:mb-0 rounded btn btn-success"
                                            type="button"
                                        >
                                            <span>
                                                <RiLoader2Fill className="animate-spin" color="black" size="27" />
                                            </span>
                                            Loading
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-center">
                                    <div className="lg:flex my-2 justify-center items-center">
                                        <button
                                            className=" w-full font-bold py-2 px-4 mb-2 lg:mb-0 rounded btn btn-success"
                                            type="submit"
                                            onClick={handleSubmission}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
};
export default EditVehicleRoute;
