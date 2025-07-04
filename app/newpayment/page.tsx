// @ts-nocheck
"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/salesman/Sidebar";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { ListApi, UpdateAPI } from "@/app/utils/api";
import { IoSearch } from "react-icons/io5";
import { useSearchParams } from "next/navigation";

const CreateNewPayment = () => {
    const listAPI = new ListApi();
    const updateAPI = new UpdateAPI();
    const router = useRouter();
    const session = useSession();
    const searchParams = useSearchParams();
    const [showModal, setShowModal] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [totalAmount, setTotalAmount] = useState(0);
    const [date, setDate] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [showSearchAcc, setShowSearchAcc] = useState(false);
    const [filteredPartyList, setFilteredPartyList] = useState<PartyItemType[]>([]);
    const [maxHeight, setMaxHeight] = useState(0);

    const [formData, setFormdData] = useState({
        Accid: "",
        AccountName: "",
        BillAmount: "",
        Cdate: "",
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
        PaymentID: "",
        RefNo: "",
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
    const buyerName = searchParams.get("buyerName");
    const buyerNameAdd = searchParams.get("buyerNameAdd");
    const accAutoID = searchParams.get("accAutoID");

    // Now you can use combinedInfo in your component

    const closeModal = () => {
        setShowModal(false);
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

                    console.log("Response Data", updatedPartyList);

                    setPartyList(updatedPartyList);
                }

                const masterCode = await listAPI.getPaymentMasterRecordByCode("0");
                setPaymentMasterByCodeList(masterCode || []);

                console.log(masterCode);

                if (masterCode && masterCode.length > 0) {
                    const firstPayment = masterCode[0];
                    if (firstPayment && firstPayment.CdateStr) {
                        setDate(firstPayment.CdateStr);
                    }
                }

                // Update paymentMasterByCodeList with values from URL parameters if present
                const newData = [...masterCode]; // Create a copy of masterCode
                if (buyerName) newData.forEach((item) => (item.PartyName = buyerName));
                if (accAutoID) newData.forEach((item) => (item.PartyID = accAutoID));

                setPaymentMasterByCodeList(newData);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [buyerName, buyerNameAdd, accAutoID]);

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
        // Update formData with values from searchParams
        setFormdData((prevFormData) => ({
            ...prevFormData,
            PartyName: buyerName || "",
            AccAddress: buyerNameAdd || "",
            PartyID: accAutoID || "",
        }));
    }, [buyerName, buyerNameAdd, accAutoID]);

    //console.log(partyList);

    console.log(formData);

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
        Byr_nam: string | null;
        AccAutoID: string | null;
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
            PartyID: selectedItem.AccAutoID,
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
            PartyID: selectedItem.AccAutoID,
            AccAddress: selectedItem.AccAddress,
        });

        updatePartyNameInPaymentMaster(selectedItem);

        // Close the modal after selecting an item
        setShowModal(false);
        setShowSearch(false)
    };

    const handleSubmission = async () => {
        console.log(paymentMasterByCodeList);
        console.log(formData);

        try {
            const response = await updateAPI.updateOrderPayments(paymentMasterByCodeList);
            if (response) {
                if (response[0].InfoField == "Updated" && response[0].ActionType === 0) {
                    toast.success("Payment Added successfully");
                } else {
                    toast.warning("Failed to Add Employee");
                }
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
      setSearchQuery(e)
        setFormdData({ ...formData, PartyName: e });
    };

    return (
        <>
            <div className="flex min-h-screen">
                <div className="w-full mt-16 lg:mt-0 customHeightStock overflow-auto absolute right-0 py-9 px-8 p-4 md:p-6 lg:p-8 xl:p-10">
                    {/* Form */}
                    <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                        <div className="md:flex justify-between items-center">
                            <h3 className="text-2xl mb-6 font-semibold">Create Payment</h3>
                            {/* <button
                                onClick={() => setShowModal(true)}
                                className="btn btn-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="button"
                            >
                                Select Party
                            </button> */}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Party Name</label>
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    className="shadow appearance-none input-primary rounded w-full py-2 px-3 text-gray-700 leading-tight"
                                    placeholder="Enter Party Name"
                                    onClick={()=>setShowSearch(true)}
                                    value={formData.PartyName}
                                    onChange={(e) => handleOnChangeHandlePartyName(e.target.value)}
                                />

                                <div className="absolute top-7 max-h-40 h-auto overflow-auto w-full">
                                    {showSearch &&
                                        filteredPartyList &&
                                        filteredPartyList.map((item) => (
                                            <div key={item.AccAutoID} className="w-full bg-white p-0.5 rounded">
                                                <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                                                    <div
                                                        className="text-md font-semibold text-success-content cursor-pointer"
                                                        onClick={() => {
                                                            handleOrder(item);
                                                        }}
                                                    >
                                                        {item.Byr_nam}
                                                    </div>
                                                    <div className="text-sm font-medium text-success-content">
                                                        {item.AccAddress}
                                                    </div>
                                                </div>
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

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Remarks</label>
                            <textarea
                                value={remarks}
                                onChange={(e) => handleInputChange("Remarks", e.target.value)}
                                className="shadow appearance-none textarea-primary rounded w-full py-2 px-3 text-gray-700 leading-tight"
                                placeholder="Enter Remarks"
                            ></textarea>
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
                                        onChange={(e) => handleInputChange("TotAmt", e.target.value)}
                                        readOnly
                                    />
                                </div>
                                <label className="text-gray-700 text-sm font-bold ml-2 mr-2">Discount Remarks</label>
                                <div className="flex border rounded">
                                    <input
                                        type="text"
                                        className="py-2 px-3 w-full border input-primary"
                                        value={formData.DisRemarks}
                                        onChange={(e) => handleInputChange("DisRemarks", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid md:hidden mt-6 grid-cols-1 gap-6 sm:grid-cols-2 px-2 lg:grid-cols-1 max-h-96 overflow-y-auto">
                                {/* Card representation for smaller screens */}
                                {paymentMasterByCodeList &&
                                    paymentMasterByCodeList.map((payment, paymentIndex) =>
                                        payment.PaymentDetail.map((detail, detailIndex) => (
                                            <div
                                                key={detailIndex}
                                                className="bg-blue-200 shadow-md border border-blue-200 rounded-lg mb-2 overflow-hidden"
                                                style={{
                                                    boxShadow: "5px 5px 15px 10px rgba(173, 216, 230, 0.9)",
                                                }}
                                            >
                                                <div className="p-4">
                                                    <p className="text-lg font-semibold mb-2">Sl No: {detailIndex + 1}</p>
                                                    <div className="text-gray-700 mb-2 sm:flex items-center">
                                                        <label htmlFor="modeOfPay" className="mr-2">
                                                            Mode of Pay:
                                                        </label>
                                                        <select
                                                            id="modeOfPay"
                                                            className="py-2 px-3 select-primary w-full rounded"
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
                                                    </div>
                                                    <div className="text-gray-700 mb-2 sm:flex items-center">
                                                        <label htmlFor="bank" className="mr-2">
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
                                                            <option value=""></option>
                                                            <option value="Federal bank">Federal bank</option>
                                                            <option value="CASH IN HAND">CASH IN HAND</option>
                                                            <option value="credit_card">Credit Card</option>
                                                            {/* Add more options as needed */}
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
                                                            className="py-2 px-3 select-primary w-full rounded"
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
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                            </div>
                            <div className="bg-slate-100 w-full hidden md:block  shadow overflow-hidden  sm:rounded-lg">
                                <div className="table-container table p-2 overflow-x-auto overflow-y-auto h-96">
                                    <thead className="bg-primary px-2 py-2 text-black text-center">
                                        <tr>
                                            <th className="w-20 p-2">Sl No</th>
                                            <th className="w-36 p-2">Mode of Pay</th>
                                            <th className="w-40 p-2">Bank</th>
                                            <th className="w-40 p-2">Cheque/Ref No</th>
                                            <th className="w-40 p-2">Amount</th>
                                            <th className="w-40 p-2">Cheque Date</th>
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
                                                                    className="py-2 px-3 select-primary  rounded"
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
                                                                    className="input-primary p-1 w-full"
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
                                                                    className="input-primary p-1 w-full"
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
                                                            <td className="border border-gray-400 p-2">
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
                                                                    className="input-primary p-1 w-full"
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
                                    className="btn btn-success w-full lg:w-28   text-white font-bold py-2 px-4 rounded mr-4 focus:outline-none focus:shadow-outline"
                                    type="button"
                                    onClick={handleSubmission}
                                >
                                    Submit
                                </button>
                                <button
                                    className="btn btn-error w-full lg:w-38   text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2 md:mt-0 lg:mt-0"
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
                                                onClick={() => handleOrder(item)}
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
export default CreateNewPayment;
