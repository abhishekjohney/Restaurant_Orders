import { useModal } from "@/Provider";
import { UpdateAPI } from "@/app/utils/api";
import { EmpAttendanceType } from "@/types";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { RiLoader2Fill } from "react-icons/ri";
import { toast } from "react-toastify";

type Props = {
    modalData: EmpAttendanceType[];
    updated: Boolean;
    setUpdated: Dispatch<SetStateAction<boolean>>;
    extraDuty: AttendanceData;
};

type AttendanceData = {
    OTDay: string | any;
    AllAmt: string | any;
    DedAmt: string | any;
    TotAmt: string | any;
    OTWHrs: string | any;
    OTWMins: string | any;
};

const initialAttendanceData: AttendanceData = {
    OTDay: "",
    AllAmt: "",
    DedAmt: "",
    TotAmt: "",
    OTWHrs: "",
    OTWMins: "",
};

const AttendanceForm = ({ modalData, setUpdated, updated, extraDuty }: Props) => {
    const updateAPI = new UpdateAPI();
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<EmpAttendanceType>(modalData[0]);
    const [submitted, setSubmitted] = useState(false);
    const [attendanceData, setAttendanceData] = useState<AttendanceData>(extraDuty);

    useEffect(() => {
        setAttendanceData(extraDuty);
    }, [extraDuty]);
    console.log(data,'data');

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === "Extra-duty") {
            if (e.target.checked) setOpen(true);
            else setOpen(false);
        } else {
            setData({
                ...data,
                AttType1: e.target.value,
            });
        }
    };

    useEffect(() => {
        setData(modalData[0]);
    }, [modalData[0]]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const valNum = parseInt(value);

        if (name === "OTDay" && isNaN(valNum) && valNum >= 2) {
            setAttendanceData((prev) => ({
                ...prev,
                OTDay: "",
            }));
            return toast.warn("Day should not be morethan 1");
        }
        if (name === "OTWHrs" && isNaN(valNum) && valNum >= 24) {
            setAttendanceData((prev) => ({
                ...prev,
                OTWHrs: "",
            }));
            return toast.warn("Hour should not be morethan 24");
        }
        if (name === "OTWMins" && isNaN(valNum) && valNum >= 60) {
            setAttendanceData((prev) => ({
                ...prev,
                OTWMins: "",
            }));
            return toast.warn("Day should not be morethan 60");
        }

        setAttendanceData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        setData({
            ...data,
            [name]: value,
        });
    };

    const handleSubmission = async () => {
        setSubmitted(true);
        if (!data?.AttType1) {
            return toast.warn("choose a attendance type");
        }

        const obj: any = data;
        try {
            const response = await updateAPI.UpdateDailyAttendance(obj);
            if (response) {
                setUpdated(!updated);
                toast.success("success fully updated Attendance");
                setSubmitted(false);
            }
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div>
            <div className="w-full">
                <div className="max-h-96 h-full flex flex-wrap gap-3 w-full">
                    <div className="flex justify-start w-fit items-center">
                        <label className="block text-warning-content text-start me-2 text-sm font-bold">Present</label>
                        <input
                            onChange={(e) => handleInput(e)}
                            type="radio"
                            className=""
                            value="P"
                            placeholder="Enter ..."
                            name="group1"
                        />
                    </div>
                    <div className="flex justify-start w-fit items-center">
                        <label className="block text-warning-content text-start me-2 text-sm font-bold">Absent</label>
                        <input
                            onChange={(e) => handleInput(e)}
                            type="radio"
                            className=""
                            value="AB"
                            placeholder="Enter ..."
                            name="group1"
                        />
                    </div>
                    <div className="flex justify-start w-fit items-center">
                        <label className="block text-warning-content text-start me-2 text-sm font-bold">Paid Leave</label>
                        <input
                            onChange={(e) => handleInput(e)}
                            type="radio"
                            className=""
                            value="LV"
                            placeholder="Enter ..."
                            name="group1"
                        />
                    </div>
                    <div className="flex justify-start w-fit items-center">
                        <label className="block text-warning-content text-start me-2 text-sm font-bold">Half day</label>
                        <input
                            onChange={(e) => handleInput(e)}
                            type="radio"
                            className=""
                            value="HD"
                            placeholder="Enter ..."
                            name="group1"
                        />
                    </div>
                    <div className="flex justify-start w-fit items-center">
                        <label className="block text-warning-content text-start me-2 text-sm font-bold">Holiday</label>
                        <input
                            onChange={(e) => handleInput(e)}
                            type="radio"
                            className=""
                            value="H"
                            placeholder="Enter ..."
                            name="group1"
                        />
                    </div>
                    <div className="flex justify-start w-fit items-center">
                        <label className="block text-warning-content text-start me-2 text-sm font-bold">Weekly Off</label>
                        <input
                            onChange={(e) => handleInput(e)}
                            type="radio"
                            className=""
                            value="WO"
                            placeholder="Enter ..."
                            name="group1"
                        />
                    </div>
                    <div className="flex justify-start w-fit items-center">
                        <label className="block text-warning-content text-start me-2 text-sm font-bold">Extra duty</label>
                        <input
                            onChange={(e) => handleInput(e)}
                            type="checkbox"
                            className=""
                            value="Extra-duty"
                            placeholder="Enter ..."
                            name=""
                        />
                    </div>
                    <div className="flex gap-2 items-center justify-center">
                        <label className="block text-warning-content text-start me-2 text-sm font-semibold">
                            Deduction
                        </label>
                        <input
                            type="text"
                            className="shadow appearance-none border rounded w-fit min-w-10 max-w-32 py-2 px-3  leading-tight"
                            placeholder="Enter ..."
                            value={attendanceData?.DedAmt}
                            onChange={handleChange}
                            name="DedAmt"
                        />
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center">
                <div className="flex flex-col gap-2 my-2 w-full justify-between items-start">
                    {open && (
                        <div className="w-full flex flex-1 gap-3 flex-wrap">
                            <div className="flex gap-2 items-center justify-center">
                                <label className="block text-warning-content text-start me-2 text-sm font-semibold">
                                    Day
                                </label>
                                <input
                                    type="text"
                                    className="shadow appearance-none border rounded w-fit min-w-10 max-w-32 py-2 px-3  leading-tight"
                                    placeholder="Enter ..."
                                    max={1}
                                    value={attendanceData?.OTDay}
                                    onChange={handleChange}
                                    name="OTDay"
                                />
                            </div>
                            <div className="flex gap-2 items-center justify-center">
                                <label className="block text-warning-content text-start me-2 text-sm font-semibold">
                                    Hrs
                                </label>
                                <input
                                    type="text"
                                    className="shadow appearance-none border rounded w-fit min-w-10 max-w-32 py-2 px-3  leading-tight"
                                    placeholder="Enter ..."
                                    value={attendanceData?.OTWHrs}
                                    onChange={handleChange}
                                    name="OTWHrs"
                                />
                            </div>
                            <div className="flex gap-2 items-center justify-center">
                                <label className="block text-warning-content text-start me-2 text-sm font-semibold">
                                    Mnts
                                </label>
                                <input
                                    type="text"
                                    className="shadow appearance-none border rounded w-fit min-w-10 max-w-32 py-2 px-3  leading-tight"
                                    placeholder="Enter ..."
                                    value={attendanceData?.OTWMins}
                                    onChange={handleChange}
                                    name="OTWMins"
                                />
                            </div>
                            <div className="flex gap-2 items-center justify-center">
                                <label className="block text-warning-content text-start me-2 text-sm font-semibold">
                                    Total
                                </label>
                                <input
                                    type="text"
                                    className="shadow appearance-none border rounded w-fit min-w-10 max-w-32 py-2 px-3  leading-tight"
                                    placeholder="Enter ..."
                                    value={attendanceData?.TotAmt}
                                    onChange={handleChange}
                                    name="TotAmt"
                                />
                            </div>
                            {/* <div className="flex gap-2 items-center justify-center">
                                <label className="block text-warning-content text-start me-2 text-sm font-semibold">
                                    Deduction
                                </label>
                                <input
                                    type="text"
                                    className="shadow appearance-none border rounded w-fit min-w-10 max-w-32 py-2 px-3  leading-tight"
                                    placeholder="Enter ..."
                                    value={attendanceData?.DedAmt}
                                    onChange={handleChange}
                                    name="DedAmt"
                                />
                            </div> */}
                            {/* <div className="flex gap-2 items-center justify-center">
                                <label className="block text-warning-content text-start me-2 text-sm font-semibold">
                                    Allowance
                                </label>
                                <input
                                    type="text"
                                    className="shadow appearance-none border rounded w-fit min-w-10 max-w-32 py-2 px-3  leading-tight"
                                    placeholder="Enter ..."
                                    value={attendanceData?.AllAmt}
                                    onChange={handleChange}
                                    name="AllAmt"
                                />
                            </div> */}
                        </div>
                    )}

                    {submitted ? (
                        <button className="font-bold py-2 px-4 mb-2 lg:mb-0 rounded btn btn-success" type="submit">
                            Loading
                            <span>
                                <RiLoader2Fill className="animate-spin" color="black" size="27" />
                            </span>
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmission}
                            className="font-bold py-2 px-4 mb-2 lg:mb-0 rounded btn btn-success"
                            type="submit"
                        >
                            Submitted
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceForm;
