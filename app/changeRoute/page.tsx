"use client";
import { useModal } from "@/Provider";
import { LoginApi } from "@/app/utils/api";
import BackButton from "@/components/BackButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { FiLoader } from "react-icons/fi";
import { RiLoader2Fill } from "react-icons/ri";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

type Props = {};
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
const ChangeRoute = (props: Props) => {
    const login = new LoginApi();
    const session = useSession();
    const router = useRouter();
    const { setClose, isOpen, setOpen } = useModal();

    const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
    const routeRef = useRef<HTMLSelectElement>(null);
    const [routes, setRoutes] = useState<RouteInterface[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    const [year, setYear] = useState("");
    const [route, setRoute] = useState("");
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [userCode, setUserCode] = useState("");
    const [userId, setUserId] = useState("");

    useEffect(() => {
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
    }, []);

    const handleSubmission = async () => {
        if (!selectedRoute) {
            Swal.fire({
                title: "Do you want to select all location ?",
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: "Yes",
                denyButtonText: `No`,
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const username = userCode;
                    const userYear = year;
                    const userSelectedVehicle = vehicleNumber;
                    const userSelectedRoute = selectedRoute;

                    if (username && userYear && userSelectedVehicle) {
                        const userKey = `${username}_${userYear}_${userSelectedVehicle}_${userSelectedRoute}`;
                        localStorage.setItem("UserYear", userKey);
                        toast.success("successfully updated");
                        router.back();
                    }
                } else if (result.isDenied) {
                    toast.warn("Changes are not saved");
                }
            });
        } else {
            const username = userCode;
            const userYear = year;
            const userSelectedVehicle = vehicleNumber;
            const userSelectedRoute = selectedRoute

            if (username && userYear && userSelectedVehicle) {
                const userKey = `${username}_${userYear}_${userSelectedVehicle}_${userSelectedRoute}`;
                localStorage.setItem("UserYear", userKey);
                toast.success("successfully updated");
                router.back();
            }
        }
    };
    return (
        <div className="flex w-full bg-white  justify-center items-start pt-24 sm:pt-20 md:pt-20 lg:pt-8 h-screen">
            <div className="w-full p-4 h-fit flex flex-col justify-center items-center overflow-auto">
                <div className="bg-slate-100 shadow-md mb-20 w-full flex-col flex items-start justify-between p-2 rounded-lg">
                    <div className="flex w-full justify-between items-center">
                        <BackButton />

                        <h3 className="md:text-3xl text-xl font-semibold">Update Route</h3>
                    </div>
                </div>
                <div className="mb-4 shadow-lg rounded-md p-8">
                    <div className=" flex w-full justify-between">
                        <label className="text-gray-600 basis-1/2">
                            Select Route: <span className="text-xs">(optional)</span>
                        </label>

                        <div className="flex mb-5 justify-center basis-1/2">
                            {loading ? (
                                <button className=" px-3 py-2 flex gap-2 w-full bg-slate-50 border border-gray-100 rounded-md text-black font-semibold  shadow-sm transition duration-30">
                                    <FiLoader color="black" size={20} className="animate-spin" /> Loading
                                </button>
                            ) : (
                                <select
                                    ref={routeRef}
                                    className="mx-auto rounded-md text-black shadow-sm w-full flex justify-center bg-slate-50 border border-gray-100 py-3 px-4 placeholder-gray-600 focus:outline-none focus:border-slate-500"
                                    value={selectedRoute || ""}
                                    onChange={(e) => setSelectedRoute(e.target.value)}
                                >
                                    <option value="">Select</option>
                                    {routes.length > 0 &&
                                        routes?.map((data, index) => {
                                            return (
                                                <option className="text-black" key={index} value={data?.ProductGroup}>
                                                    {data?.ProductGroup}
                                                </option>
                                            );
                                        })}
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="lg:flex  justify-center items-center">
                            {!submitted ? (
                                <>
                                    <button
                                        className="w-full lg:w-28  font-bold py-2 px-4 mb-2 lg:mb-0 rounded mr-4 btn btn-success"
                                        type="button"
                                        onClick={handleSubmission}
                                    >
                                        Submit
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className=" w-full lg:w-fit flex flex-row font-bold py-2 px-4 mb-2 lg:mb-0 rounded mr-4 btn btn-success"
                                        type="submit"
                                    >
                                        <span>
                                            <RiLoader2Fill className="animate-spin" color="black" size="27" />
                                        </span>
                                        Loading
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangeRoute;
