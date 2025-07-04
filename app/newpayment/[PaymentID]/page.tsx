// @ts-nocheck
"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/salesman/Sidebar";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { log } from "console";
import { ListApi } from "@/app/utils/api";
import { UpdateAPI } from "@/app/utils/api";
import { IoSearch } from "react-icons/io5";
import BackButton from "@/components/BackButton";

const getNextDay = (): Date => {
    const currentDate = new Date();
    const tomorrow = new Date(currentDate);
    // tomorrow.setDate(currentDate.getDate() + 1); // Get tomorrow's date
    tomorrow.setDate(currentDate.getDate());

    // Check if tomorrow is Sunday (day of the week === 0)
    if (tomorrow.getDay() === 0) {
        tomorrow.setDate(currentDate.getDate() + 2); // If tomorrow is Sunday, get Monday's date
    }

    return tomorrow;
};

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Add leading zero if necessary
    const day = ("0" + date.getDate()).slice(-2); // Add leading zero if necessary
    return `${year}-${month}-${day}`;
};
const formatDate2 = (date: Date): string => {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Add leading zero if necessary
    const day = ("0" + date.getDate()).slice(-2); // Add leading zero if necessary
    return `${day}-${month}-${year}`;
};

const EditNewPayment = ({ params }: { params: { PaymentID: any } }) => {
    console.log(params?.PaymentID, "payment id");
    const listAPI = new ListApi();
    const updateAPI = new UpdateAPI();
    const router = useRouter();
    const session = useSession();
    const storedUserYear = localStorage.getItem("UserYear");
    const parts = storedUserYear.split("_");
    const UserId = parts[0];

    const [showModal, setShowModal] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [date, setDate] = useState("");
    const [filteredPartyList, setFilteredPartyList] = useState<PartyItemType[]>([]);
    const [maxHeight, setMaxHeight] = useState(0);
    const [selectedDate, setSelectedDate] = useState<Date>(getNextDay());

    const [formData, setFormdData] = useState({
        Accid: "",
        AccountName: "",
        BillAmount: "",
        Cdate: "",
        CdateStr: "",
        ChequeNo: "",
        CrdtAmt: "",
        DbtAmt: "",
        DisAcrel: "",
        DisRemarks: "",
        Discount: "",
        ModeOfPayment: "",
        OthAmount: "",
        OthRemarks: "",
        PAYSLNO: "",
        PartyID: "",
        PartyName: "",
        PayModel: "",
        PaymentID: params.PaymentID,
        RefNo: UserId,
        Remarks: "",
        Remarks1: "",
        TotAmt: "",
        TransType: "",
        inact: "",
        AutNo: "",
        BncCharges: "",
        BounceAcrel: "",
        ChqSts: "",
        DTLMOP: "",
        DtlAccName: "",
        DtlAccid: "",
        DtlChQDated: "",
        DtlChqNo: "",
        DtlRemark: "",
        Entid: "",
        PartyCode: "",
        PayAcrel: "",
        PayCrAmt: "",
        PayDrAmt: "",
        PayID: "",
        PayRemarks: "",
        SVRCode: "",
        AccAddress: "",
    });

    const [partyList, setPartyList] = useState<PartyItemType[]>([]);

    const [paymentMasterByCodeList, setPaymentMasterByCodeList] = useState([]);

    const closeModal = () => {
        setShowModal(false);
    };

    const updateFormDataFromResponse = (responseData) => {
        setFormdData((prevFormData) => ({
            ...prevFormData,
            Accid: responseData.Accid || "",
            AccountName: responseData.AccountName || "",
            BillAmount: responseData.BillAmount || "",
            Cdate: responseData.Cdate || "",
            ChequeNo: responseData.ChequeNo || "",
            CrdtAmt: responseData.CrdtAmt || "",
            DbtAmt: responseData.DbtAmt || "",
            DisAcrel: responseData.DisAcrel || "",
            DisRemarks: responseData.DisRemarks || "",
            Discount: responseData.Discount || "",
            ModeOfPayment: responseData.ModeOfPayment || "",
            OthAmount: responseData.OthAmount || "",
            OthRemarks: responseData.OthRemarks || "",
            PAYSLNO: responseData.PAYSLNO || "",
            PartyID: responseData.PartyID || "",
            PartyName: responseData.PartyName || "",
            PayModel: responseData.PayModel || "",
            RefNo: UserId,
            Remarks: responseData.Remarks || "",
            Remarks1: responseData.Remarks1 || "",
            TotAmt: responseData.TotAmt || "",
            TransType: responseData.TransType || "",
            CdateStr: formatDate2(selectedDate) || responseData.CdateStr,
        }));
    };

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

                const masterCode = await listAPI.getPaymentMasterRecordByCode(params.PaymentID);

                if (masterCode) {
                    setPaymentMasterByCodeList(masterCode || []);

                    if (masterCode && masterCode.length > 0) {
                        const firstPayment = masterCode[0];
                        if (firstPayment && firstPayment.CdateStr) {
                            setDate(firstPayment.CdateStr);
                        }
                        updateFormDataFromResponse(firstPayment);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [params.PaymentID]);

    useEffect(() => {
        function setMaxHeightBasedOnScreen() {
            const screenHeight = window.innerHeight;
            const calculatedMaxHeight = screenHeight * 0.6; // Adjust this value according to your preference
            setMaxHeight(calculatedMaxHeight);
        }
        setMaxHeightBasedOnScreen();
        window.addEventListener("resize", setMaxHeightBasedOnScreen);
        return () => {
            window.removeEventListener("resize", setMaxHeightBasedOnScreen);
        };
    }, []);

    useEffect(() => {
        const filteredList = partyList.filter((item) => item.Byr_nam.toLowerCase().includes(searchQuery.toLowerCase()));
        setFilteredPartyList(filteredList);
    }, [searchQuery, partyList]);

    const handleSearch = () => {
        setFilteredPartyList(partyList.filter((item) => item.Byr_nam.toLowerCase().includes(searchQuery.toLowerCase())));
    };

    interface PartyItemType {
        Accid: number | null;
        AccountName: string | null;
        BillAmount: number | null;
        Cdate: string | null;
        ChequeNo: string | null;
        CrdtAmt: number | null;
        DbtAmt: number | null;
        DisAcrel: number | null;
        DisRemarks: string | null;
        Discount: number | null;
        ModeOfPayment: string | null;
        OthAmount: number | null;
        OthRemarks: null;
        PAYSLNO: number | null;
        PartyID: number | null;
        PartyName: string | null;
        PayModel: number | null;
        PaymentID: number | null;
        RefNo: string | null;
        Remarks: string | null;
        Remarks1: string | null;
        TotAmt: number | null;
        TransType: string | null;
        inact: null;
        AccAddress: string | null;
    }

    const updatePaymentMasterByCodeList = (field, value) => {
        const updatedPaymentMasterByCodeList = paymentMasterByCodeList.map((item) => ({
            ...item,
            [field]: value,
        }));
        setPaymentMasterByCodeList(updatedPaymentMasterByCodeList);
    };

    const updatePartyNameInPaymentMaster = (selectedItem) => {
        //console.log(selectedItem);

        // Update the partyName in each item of paymentMasterByCodeList
        const updatedPaymentMaster = paymentMasterByCodeList.map((item) => ({
            ...item,
            PartyName: selectedItem.Byr_nam,
            DisRemarks: selectedItem.DisRemarks,
            Discount: selectedItem.Discount,
            PartyID: selectedItem.AccAutoID,
            PayModel: selectedItem.PayModel,
            PaymentID: selectedItem.PaymentID,
            TransType: selectedItem.TransType,
            PAYSLNO: selectedItem.PAYSLNO,
            RefNo: UserId,
        }));

        // Set the updated paymentMasterByCodeList
        setPaymentMasterByCodeList(updatedPaymentMaster);
    };

    const handleInputChange = (field, value) => {
        setFormdData({
            ...formData,
            [field]: value,
        });

        updatePaymentMasterByCodeList(field, value);
    };

    const handleOrder = (selectedItem: PartyItemType) => {
        setFormdData({
            ...formData,
            PartyName: selectedItem.Byr_nam,
            BillAmount: selectedItem.BillAmount,
            TotAmt: selectedItem.TotAmt,
            DisRemarks: selectedItem.DisRemarks,
            Discount: selectedItem.Discount,
            PartyID: selectedItem.AccAutoID,
            PayModel: selectedItem.PayModel,
            PaymentID: selectedItem.PaymentID,
            TransType: selectedItem.TransType,
            PAYSLNO: selectedItem.PAYSLNO,
            AccAddress: selectedItem.AccAddress,
            RefNo: UserId,
        });

        updatePartyNameInPaymentMaster(selectedItem);

        // Close the modal after selecting an item
        setShowModal(false);
        setShowSearch(false);
    };

    const handleSubmission = async (e) => {
        e.preventDefault();

        try {
            const response = await updateAPI.updateOrderPayments(paymentMasterByCodeList);

            if (response) {
                toast.success("Payment Added successfully");
                console.log("RESPONSE", response);
                router.push("/todaysPayment");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDetailInputChange = (paymentIndex, detailIndex, field, value) => {
        const updatedPaymentMasterByCodeList = [...paymentMasterByCodeList];
        updatedPaymentMasterByCodeList[paymentIndex].PaymentDetail[detailIndex][field] = value;

        const newTotalAmount = updatedPaymentMasterByCodeList.reduce(
            (total, payment) =>
                total +
                payment.PaymentDetail.reduce(
                    (detailTotal, detail) => detailTotal + parseFloat(detail.PayCrAmt || 0), // Assuming PayCrAmt is the field you want to sum
                    0
                ),
            0
        );

        setTotalAmount(newTotalAmount);

        setFormdData({
            ...formData,
            TotAmt: newTotalAmount,
            BillAmount: newTotalAmount,
        });

        const updatedAmount = updatedPaymentMasterByCodeList.map((item) => ({
            ...item,
            BillAmount: newTotalAmount,
            TotAmt: newTotalAmount,
        }));

        setPaymentMasterByCodeList(updatedAmount);

        // updatePaymentMasterByCodeList("BillAmount", newTotalAmount);
        // updatePaymentMasterByCodeList("TotAmt", newTotalAmount);

        // const editedDetail =
        //   updatedPaymentMasterByCodeList[paymentIndex].PaymentDetail[detailIndex];
        // setFormdData({
        //   ...formData,
        //   DTLMOP: editedDetail.DTLMOP,
        //   DtlAccName: editedDetail.DtlAccName,
        //   DtlChqNo: editedDetail.DtlChqNo,
        //   PayCrAmt: editedDetail.PayCrAmt,
        //   DtlChQDated: editedDetail.DtlChQDated,
        //   DtlRemark: editedDetail.DtlRemark,
        //   AutNo: editedDetail.AutNo,
        //   BillAmount: newTotalAmount,
        //   TotAmt: newTotalAmount,
        // });
    };

    const RemoveText = () => {
        setRemarks("");
    };

    const handleOnChangeHandlePartyName = (e) => {
        setSearchQuery(e);
        setFormdData({ ...formData, PartyName: e, RefNo: UserId });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const newDate = new Date(inputValue);
        setSelectedDate(newDate);
        handleInputChange("CdateStr", formatDate2(newDate));
        setFormdData({ ...formData, CdateStr: formatDate2(newDate) });
    };

    return (
        <>
            <div className="flex min-h-screen">
                <div className="w-full lmt-16 lg:mt-0 customHeightStock overflow-auto absolute right-0  py-9 px-8 p-4 md:p-6 lg:p-8 xl:p-10">
                    <BackButton />
                    {/* Form */}
                    <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                        <div className="md:flex justify-between items-center">
                            <h3 className="text-2xl mb-6 font-semibold">Create Payment</h3>
                            <button
                                onClick={() => setShowModal(true)}
                                className="btn btn-primary text-white font-bold py-2 px-4 rounded"
                                type="button"
                            >
                                Select Party
                            </button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Party Name</label>
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    className="shadow appearance-none input-primary rounded w-full py-2 px-3 text-gray-700 leading-tight"
                                    placeholder="Enter Party Name"
                                    onClick={() => setShowSearch(!showSearch)}
                                    value={formData.PartyName}
                                    onChange={(e) => handleOnChangeHandlePartyName(e.target.value)}
                                />

                                <div className="absolute top-8 max-h-40 h-auto overflow-auto w-full">
                                    {showSearch &&
                                        filteredPartyList &&
                                        filteredPartyList.map((item) => (
                                            <div key={item.AccAutoID} className="w-full bg-white p-0.5 rounded">
                                                <button
                                                    onClick={() => {
                                                        handleOrder(item);
                                                    }}
                                                    className="flex flex-col w-full shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start"
                                                >
                                                    <h3 className="text-md font-semibold text-success-content cursor-pointer">
                                                        {item.Byr_nam}
                                                    </h3>
                                                    <p className="text-sm font-medium text-success-content">
                                                        {item.AccAddress}
                                                    </p>
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Acc Address</label>
                            <input
                                type="text"
                                className="shadow appearance-none input-primary rounded w-full py-2 px-3 text-gray-700 leading-tight"
                                placeholder="Enter Acc Address"
                                value={formData.AccAddress}
                            />
                        </div>
                        <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                                <input
                                    value={formatDate(selectedDate)}
                                    onChange={handleDateChange}
                                    type="date"
                                    className="shadow appearance-none input-primary rounded w-full py-2 px-3 text-gray-700 leading-tight"
                                    placeholder="Enter Remarks"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Remarks</label>
                                <textarea
                                    value={formData.Remarks}
                                    onChange={(e) => handleInputChange("Remarks", e.target.value)}
                                    className="shadow appearance-none input-primary rounded w-full py-2 px-3 text-gray-700 leading-tight"
                                    placeholder="Enter Remarks"
                                ></textarea>
                            </div>
                        </div>

                        <div className=" w-full   shadow-md shadow-gray-400 rounded-md mt-2 lg:mt-12 mx-auto">
                            <div className="w-full bg-primary text-white font-semibold text-xl  text-center px-3 py-4">
                                Mode of Pay Details Selection {date}
                            </div>
                            <div className="lg:flex items-center m-4 py-2">
                                <label className="text-gray-700 text-sm font-bold mr-2">Amount Paid:</label>
                                <div className="flex border rounded">
                                    <input
                                        type="text"
                                        className="py-2 px-3 w-full border input-primary"
                                        value={formData.BillAmount}
                                        readOnly
                                    />
                                </div>
                                <label className="text-gray-700 text-sm font-bold ml-2 mr-2">Total</label>
                                <div className="flex border rounded">
                                    <input
                                        type="text"
                                        className="py-2 px-3 w-full border input-primary"
                                        value={formData.TotAmt}
                                        readOnly
                                    />
                                </div>
                                <label className="text-gray-700 text-sm font-bold ml-2 mr-2">Discount Remarks</label>
                                <div className="flex border rounded">
                                    <input
                                        type="text"
                                        className="py-2 px-3 w-full border input-primary"
                                        value={formData.DisRemarks}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="grid md:hidden mt-6 grid-cols-1 gap-2 sm:grid-cols-2 px-2 lg:grid-cols-1 max-h-96 overflow-y-auto ">
                                {/* Card representation for smaller screens */}
                                {paymentMasterByCodeList &&
                                    paymentMasterByCodeList.map((payment, paymentIndex) =>
                                        payment.PaymentDetail.map((detail, detailIndex) => (
                                            <div
                                                key={detailIndex}
                                                className="bg-blue-200 shadow-md rounded-lg my-2 border border-blue-200 overflow-hidden"
                                                // style={{
                                                //     boxShadow: "5px 5px 15px 10px rgba(173, 216, 230, 0.9)",
                                                // }}
                                            >
                                                {
                                                    <>
                                                        <section className="w-full divide-y divide-slate-200 rounded">
                                                            <details className="group p-4">
                                                                <summary className="relative flex cursor-pointer list-none gap-4 pr-8 font-medium text-slate-700 transition-colors duration-300 focus-visible:outline-none group-hover:text-slate-900  [&::-webkit-details-marker]:hidden">
                                                                    Sl No: {detailIndex + 1}
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="absolute right-0 top-1 h-4 w-4 shrink-0 stroke-slate-700 transition duration-300 group-open:rotate-45"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                        strokeWidth="1.5"
                                                                        aria-labelledby="title-ac12 desc-ac12"
                                                                    >
                                                                        <title id="title-ac12">Open icon</title>
                                                                        <desc id="desc-ac12">
                                                                            icon that represents the state of the summary
                                                                        </desc>
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M12 4v16m8-8H4"
                                                                        />
                                                                    </svg>
                                                                </summary>
                                                                <div className="mt-3">
                                                                    <div className="text-gray-700 mb-2 justify-between flex items-center">
                                                                        <label htmlFor="modeOfPay" className="mr-2 whitespace-nowrap">
                                                                            Mode of Pay:
                                                                        </label>
                                                                        <select
                                                                            id="modeOfPay"
                                                                            className="py-2 px-3 w-full select-primary rounded"
                                                                            value={detail.DTLMOP}
                                                                            onChange={(e) =>
                                                                                handleDetailInputChange(
                                                                                    paymentIndex,
                                                                                    detailIndex,
                                                                                    "DTLMOP",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                        >
                                                                            <option value="">--select--</option>
                                                                            <option value="Cash">Cash</option>
                                                                            <option value="Cheque">Cheque</option>
                                                                            <option value="credit_card">Credit Card</option>
                                                                            <option value="Online/UPI">Online/UPI</option>
                                                                            {/* Add more options as needed */}
                                                                        </select>
                                                                    </div>
                                                                    <div className="text-gray-700 mb-2 flex justify-between items-center">
                                                                        <label htmlFor="bank" className="mr-2 whitespace-nowrap">
                                                                            Bank:
                                                                        </label>
                                                                        <select
                                                                            id="bank"
                                                                            className="py-2 px-3 w-full select-primary rounded"
                                                                            value={detail.DtlAccName}
                                                                            onChange={(e) =>
                                                                                handleDetailInputChange(
                                                                                    paymentIndex,
                                                                                    detailIndex,
                                                                                    "DtlAccName",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                        >
                                                                            <option value="">--select--</option>
                                                                            <option value="Federal bank">
                                                                                Federal bank
                                                                            </option>
                                                                            <option value="CASH IN HAND">
                                                                                CASH IN HAND
                                                                            </option>
                                                                            <option value="credit_card">Credit Card</option>
                                                                            {/* Add more options as needed */}
                                                                        </select>
                                                                    </div>

                                                                    <div className="text-gray-700 mb-2 flex items-center">
                                                                        <label htmlFor="chequeRefNo" className="mr-2">
                                                                            Cheque/RefNo:
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            id="chequeRefNo"
                                                                            className="border input-primary p-1 w-full"
                                                                            value={detail.DtlChqNo}
                                                                            onChange={(e) =>
                                                                                handleDetailInputChange(
                                                                                    paymentIndex,
                                                                                    detailIndex,
                                                                                    "DtlChqNo",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div className="text-gray-700 mb-2 flex items-center">
                                                                        <label htmlFor="amount" className="mr-2">
                                                                            Amount:
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            id="amount"
                                                                            className="border input-primary p-1 w-full"
                                                                            value={detail.PayCrAmt}
                                                                            onChange={(e) =>
                                                                                handleDetailInputChange(
                                                                                    paymentIndex,
                                                                                    detailIndex,
                                                                                    "PayCrAmt",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <div className="text-gray-700 mb-2 flex items-center">
                                                                        <label htmlFor="amount" className="mr-2">
                                                                        Cheque Date:
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            id="amount"
                                                                            className="border input-primary p-1 w-full"
                                                                            value={detail.DtlChQDated}
                                                                            onChange={(e) =>
                                                                                handleDetailInputChange(
                                                                                    paymentIndex,
                                                                                    detailIndex,
                                                                                    "DtlChQDated",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <div className="text-gray-700 mb-2 flex items-center">
                                                                        <label htmlFor="remarks" className="mr-2">
                                                                            Remarks:
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            id="remarks"
                                                                            className="border input-primary p-1 w-full"
                                                                            value={detail.DtlRemark}
                                                                            onChange={(e) =>
                                                                                handleDetailInputChange(
                                                                                    paymentIndex,
                                                                                    detailIndex,
                                                                                    "DtlRemark",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div className="text-gray-700 mb-2 flex justify-between items-center">
                                                                        <label htmlFor="cashTrans" className="mr-2 whitespace-nowrap">
                                                                            Cash Trans:
                                                                        </label>
                                                                        <select
                                                                            id="cashTrans"
                                                                            className="py-2 px-3 w-full select-primary rounded"
                                                                            value={detail.AutNo}
                                                                            onChange={(e) =>
                                                                                handleDetailInputChange(
                                                                                    paymentIndex,
                                                                                    detailIndex,
                                                                                    "AutNo",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                        >
                                                                            <option value="">--select--</option>
                                                                            <option value="0">Cash</option>
                                                                            <option value="1">Bill</option>
                                                                            <option value="2">Other</option>
                                                                            {/* Add more options as needed */}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </details>
                                                        </section>
                                                    </>
                                                }
                                                {/* <div className="p-4">
                                                    <p className="text-lg font-semibold mb-2">Sl No: {detailIndex + 1}</p>
                                                    <div className="text-gray-700 mb-2 sm:flex items-center">
                                                        <label htmlFor="modeOfPay" className="mr-2">
                                                            Mode of Pay:
                                                        </label>
                                                        <select
                                                            id="modeOfPay"
                                                            className="py-2 px-3 select-primary rounded"
                                                            value={detail.DTLMOP}
                                                            onChange={(e) =>
                                                                handleDetailInputChange(
                                                                    paymentIndex,
                                                                    detailIndex,
                                                                    "DTLMOP",
                                                                    e.target.value
                                                                )
                                                            }
                                                        >
                                                            <option value=""></option>
                                                            <option value="Cash">Cash</option>
                                                            <option value="Cheque">Cheque</option>
                                                            <option value="credit_card">Credit Card</option>
                                                            <option value="Online/UPI">Online/UPI</option>
                                                        </select>
                                                    </div>
                                                    <div className="text-gray-700 mb-2 sm:flex items-center">
                                                        <label htmlFor="bank" className="mr-2">
                                                            Bank:
                                                        </label>
                                                        <select
                                                            id="bank"
                                                            className="py-2 px-3 select-primary rounded"
                                                            value={detail.DtlAccName}
                                                            onChange={(e) =>
                                                                handleDetailInputChange(
                                                                    paymentIndex,
                                                                    detailIndex,
                                                                    "DtlAccName",
                                                                    e.target.value
                                                                )
                                                            }
                                                        >
                                                            <option value=""></option>
                                                            <option value="Federal bank">Federal bank</option>
                                                            <option value="CASH IN HAND">CASH IN HAND</option>
                                                            <option value="credit_card">Credit Card</option>
                                                        </select>
                                                    </div>

                                                    <div className="text-gray-700 mb-2 sm:flex items-center">
                                                        <label htmlFor="chequeRefNo" className="mr-2">
                                                            Cheque/RefNo:
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="chequeRefNo"
                                                            className="border input-primary p-1 w-full"
                                                            value={detail.DtlChqNo}
                                                            onChange={(e) =>
                                                                handleDetailInputChange(
                                                                    paymentIndex,
                                                                    detailIndex,
                                                                    "DtlChqNo",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="text-gray-700 mb-2 sm:flex items-center">
                                                        <label htmlFor="amount" className="mr-2">
                                                            Amount:
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="amount"
                                                            className="border input-primary p-1 w-full"
                                                            value={detail.PayCrAmt}
                                                            onChange={(e) =>
                                                                handleDetailInputChange(
                                                                    paymentIndex,
                                                                    detailIndex,
                                                                    "PayCrAmt",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <p className="text-gray-700 mb-2">
                                                        Cheque Date
                                                        <input
                                                            type="text"
                                                            className="border input-primary p-1 w-full"
                                                            value={detail.DtlChQDated}
                                                            onChange={(e) =>
                                                                handleDetailInputChange(
                                                                    paymentIndex,
                                                                    detailIndex,
                                                                    "DtlChQDated",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </p>
                                                    <div className="text-gray-700 mb-2 sm:flex items-center">
                                                        <label htmlFor="remarks" className="mr-2">
                                                            Remarks:
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="remarks"
                                                            className="border input-primary p-1 w-full"
                                                            value={detail.DtlRemark}
                                                            onChange={(e) =>
                                                                handleDetailInputChange(
                                                                    paymentIndex,
                                                                    detailIndex,
                                                                    "DtlRemark",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="text-gray-700 mb-2 sm:flex items-center">
                                                        <label htmlFor="cashTrans" className="mr-2">
                                                            Cash Trans:
                                                        </label>
                                                        <select
                                                            id="cashTrans"
                                                            className="py-2 px-3 select-primary rounded"
                                                            value={detail.AutNo}
                                                            onChange={(e) =>
                                                                handleDetailInputChange(
                                                                    paymentIndex,
                                                                    detailIndex,
                                                                    "AutNo",
                                                                    e.target.value
                                                                )
                                                            }
                                                        >
                                                            <option value=""></option>
                                                            <option value="0">Cash</option>
                                                            <option value="1">Bill</option>
                                                            <option value="2">Other</option>
                                                        </select>
                                                    </div>
                                                </div> */}
                                            </div>
                                        ))
                                    )}
                            </div>

                            <div className="bg-slate-100 w-full hidden md:block  shadow overflow-hidden  sm:rounded-lg">
                                <div className="table-container table p-2 overflow-x-auto overflow-y-auto h-96">
                                    <thead className="bg-primary text-black text-center">
                                        <tr>
                                            <th className="w-20 p-2">Sl No</th>
                                            <th className="w-36 p-2">Mode of Pay</th>
                                            <th className="w-40 p-2">Bank</th>
                                            <th className="w-40 p-2">Cheque/Ref No</th>
                                            <th className="w-40 p-2">Amount</th>
                                            <th className="w-64 p-2">Cheque Date</th>
                                            <th className="w-40 p-2">Remarks</th>
                                            <th className="w-40 p-2">Cash Trans</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentMasterByCodeList &&
                                            paymentMasterByCodeList.map((payment, paymentIndex) =>
                                                payment.PaymentDetail.map((detail, detailIndex) => (
                                                    <>
                                                        <tr key={detailIndex}>
                                                            <td className="border border-gray-400 p-2">
                                                                {detailIndex + 1}
                                                            </td>
                                                            <td className="border border-gray-400 p-2">
                                                                <select
                                                                    className="py-2 px-3 select-primary  rounded"
                                                                    value={detail.DTLMOP}
                                                                    onChange={(e) =>
                                                                        handleDetailInputChange(
                                                                            paymentIndex,
                                                                            detailIndex,
                                                                            "DTLMOP",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                >
                                                                    <option value=""></option>
                                                                    <option value="Cash">Cash</option>
                                                                    <option value="Cheque">Cheque</option>
                                                                    <option value="credit_card">Credit Card</option>
                                                                    <option value="Online/UPI">Online/UPI</option>
                                                                    {/* Add more options as needed */}
                                                                </select>
                                                            </td>
                                                            <td className="border border-gray-400 p-2">
                                                                <select
                                                                    className="py-2 px-3 select-primary rounded"
                                                                    value={detail.DtlAccName}
                                                                    onChange={(e) =>
                                                                        handleDetailInputChange(
                                                                            paymentIndex,
                                                                            detailIndex,
                                                                            "DtlAccName",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                >
                                                                    <option value=""></option>
                                                                    <option value="Federal bank">Federal bank</option>
                                                                    <option value="CASH IN HAND">CASH IN HAND</option>
                                                                    <option value="credit_card">Credit Card</option>
                                                                    {/* Add more options as needed */}
                                                                </select>
                                                            </td>
                                                            <td className="border border-gray-400 p-2">
                                                                <input
                                                                    type="text"
                                                                    className=" input-primary p-1 w-full"
                                                                    value={detail.DtlChqNo}
                                                                    onChange={(e) =>
                                                                        handleDetailInputChange(
                                                                            paymentIndex,
                                                                            detailIndex,
                                                                            "DtlChqNo",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="border border-gray-400 p-2">
                                                                <input
                                                                    type="text"
                                                                    className=" input-primary p-1 w-full"
                                                                    value={detail.PayCrAmt}
                                                                    onChange={(e) =>
                                                                        handleDetailInputChange(
                                                                            paymentIndex,
                                                                            detailIndex,
                                                                            "PayCrAmt",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="border  border-gray-400 p-2">
                                                                <input
                                                                    type="text"
                                                                    className="input-primary p-1 w-full"
                                                                    value={detail.DtlChQDated}
                                                                    onChange={(e) =>
                                                                        handleDetailInputChange(
                                                                            paymentIndex,
                                                                            detailIndex,
                                                                            "DtlChQDated",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="border border-gray-400 p-2">
                                                                <input
                                                                    type="text"
                                                                    className=" input-primary p-1 w-full"
                                                                    value={detail.DtlRemark}
                                                                    onChange={(e) =>
                                                                        handleDetailInputChange(
                                                                            paymentIndex,
                                                                            detailIndex,
                                                                            "DtlRemark",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="border border-gray-400 p-2">
                                                                <select
                                                                    className="py-2 px-3 input-primary  rounded"
                                                                    value={detail.AutNo}
                                                                    onChange={(e) =>
                                                                        handleDetailInputChange(
                                                                            paymentIndex,
                                                                            detailIndex,
                                                                            "AutNo",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                >
                                                                    <option value=""></option>
                                                                    <option value="0">Cash</option>
                                                                    <option value="1">Bill</option>
                                                                    <option value="2">Other</option>
                                                                    {/* Add more options as needed */}
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    </>
                                                ))
                                            )}
                                    </tbody>
                                </div>
                            </div>
                        </div>

                        <div className="md:flex items-center justify-center mt-3">
                            <div className="md:flex  justify-center items-center">
                                <button
                                    className="btn btn-success w-full lg:w-28  text-white font-bold py-2 px-4 rounded mr-4 focus:outline-none focus:shadow-outline"
                                    type="button"
                                    onClick={handleSubmission}
                                >
                                    Submit
                                </button>
                                <button
                                    className="btn btn-error w-full lg:w-38  text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2 md:mt-0 lg:mt-0"
                                    type="button"
                                    onClick={RemoveText}
                                >
                                    Clear Remarks
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 opacity-1 flex items-center justify-center">
                    <div className="bg-white customHeightModal shadow-md shadow-slate-400 p-8 rounded-lg text-center">
                        <div className="mb-6 flex items-center relative">
                            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 px-4 py-2 rounded input-info"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="md:hidden mt-6 overflow-y-auto" style={{ maxHeight: maxHeight }}>
                            {filteredPartyList &&
                                filteredPartyList.map((item) => (
                                    <div
                                        key={item.AccAutoID}
                                        className="bg-gray-100 shadow-md md:max-w-full max-w-xs shadow-slate-200 flex items-center p-4 rounded"
                                    >
                                        <div className="flex flex-col justify-center items-start">
                                            <div
                                                className="text-md font-semibold text-success-content cursor-pointer"
                                                onClick={() => item}
                                            >
                                                {item.Byr_nam}
                                            </div>
                                            <div className="text-sm font-medium text-success-content">
                                                {item.AccAddress}
                                            </div>
                                            <div className="text-sm font-medium text-success-content">{item.PhoneNo}</div>
                                            <div className="text-sm font-medium text-success-content">{item.VATNO}</div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                        <div className="overflow-y-auto mb-6" style={{ maxHeight: maxHeight }}>
                            <div className="hidden md:block lg:block overflow-x-auto ">
                                <div className="grid md:grid-cols-1 grid-cols-1  gap-4">
                                    {filteredPartyList &&
                                        filteredPartyList.map((item) => (
                                            <div
                                                key={item.AccAutoID}
                                                className="bg-gray-100 shadow-md md:max-w-full max-w-xs shadow-slate-200 justify-between  flex items-center p-4 rounded"
                                            >
                                                <div className="flex justify-center items-center">
                                                    <div
                                                        className="ml-4 text-lg font-semibold text-success-content cursor-pointer"
                                                        onClick={() => handleOrder(item)}
                                                    >
                                                        {item.Byr_nam}
                                                    </div>
                                                    <div className="text-sm font-medium ml-3 text-success-content ">
                                                        {item.combinedField}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <button className="px-4 py-2 btn btn-warning rounded" onClick={closeModal}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
export default EditNewPayment;
