// @ts-nocheck
"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { IoSearch } from "react-icons/io5";
import { ListApi, UpdateAPI } from "@/app/utils/api";
import { getNextDay, formatDate, formatDate2, swapDate, swapDateBack, getCurrentTime } from "@/lib/helper-function";
import { LocationData, NewPaymentInterface, PartyItemType } from "@/types";
import { useModal } from "@/Provider";
import { Spinner } from "../Spinner";
import { FcViewDetails } from "react-icons/fc";
import { RiLoader2Fill } from "react-icons/ri";
import SubmitButton from "./SubmitButton";
import { IoIosArrowDown } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";

interface Params {
  PaymentID: any;
}

type Props = {
  route?: string;
  vehicle?: string;
  userCode?: string;
  userId?: string;
  params?: Params;
  paymentId?: string;
  partyId?: string;
};

const EditNewPayment = (Props: Props) => {
  const listAPI = new ListApi();
  const updateAPI = new UpdateAPI();
  const router = useRouter();
  const session = useSession();

  const [year, setYear] = useState("");
  const [route, setRoute] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [userCode, setUserCode] = useState("");
  const [userId, setUserId] = useState("");

  const { setClose } = useModal();
  const storedUserYear = localStorage.getItem("UserYear");
  const parts = storedUserYear.split("_");
  const UserId = parts[0];
  const [showModal, setShowModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [date, setDate] = useState("");
  const [filteredPartyList, setFilteredPartyList] = useState<NewPaymentInterface[]>([]);
  const [maxHeight, setMaxHeight] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(getNextDay());
  const [currentDate, setCurrentDate] = useState<Date>(getNextDay());
  const [selectedParty, setSelectedParty] = useState([]);
  const [selectedBillItem, setSelectedBillItem] = useState([]);
  const [accountLedger, setAccountLedger] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [collapse, setCollapse] = useState([1]);
  const [visibleBillArray, setVisibleBillArray] = useState(2);

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
    PaymentID: Props?.paymentId || "",
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

  const [partyList, setPartyList] = useState<NewPaymentInterface[]>([]);

  const [paymentMasterByCodeList, setPaymentMasterByCodeList] = useState([]);
  const [cashAccountList, setCashAccountList] = useState<PartyItemType[]>([]);

  const closeModal = () => {
    setShowModal(false);
  };
  const [locationData, setLocationData] = useState<LocationData>({
    EntLocID: "0",
    AccAutoID: "0",
    CDateStr: formatDate2(currentDate),
    LocLatLong: "",
    LocationString: "",
    LocPlace: "",
    AprUser: "",
    Module: "",
    Reason: "",
    Remarks: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const userDetails = localStorage.getItem("UserYear");
      if (userDetails) {
        const parts = userDetails.split("_");
        if (parts.length >= 4) {
          setYear(parts[1]);
          setUserCode(parts[0]);
          setRoute(parts[3]);
          setVehicleNumber(parts[2]);
        }
      }
    }

    if (session?.data?.user?.id) {
      setUserId(session?.data?.user?.id);
    }
  }, [session?.data?.user?.name]);

  const updateFormDataFromResponse = (responseData) => {
    setFormdData((prevFormData) => ({
      ...prevFormData,
      Accid: responseData?.Accid || "",
      AccountName: responseData?.AccountName || "",
      BillAmount: responseData?.BillAmount || "",
      Cdate: responseData?.Cdate || "",
      ChequeNo: responseData?.ChequeNo || "",
      CrdtAmt: responseData?.CrdtAmt || "",
      DbtAmt: responseData?.DbtAmt || "",
      DisAcrel: responseData?.DisAcrel || "",
      DisRemarks: responseData?.DisRemarks || "",
      Discount: responseData?.Discount || "",
      ModeOfPayment: responseData?.ModeOfPayment || "",
      OthAmount: responseData?.OthAmount || "",
      OthRemarks: responseData?.OthRemarks || "",
      PAYSLNO: responseData?.PAYSLNO || "",
      PartyID: responseData?.PartyID || "",
      PartyName: responseData?.PartyName || "",
      PayModel: responseData?.PayModel || "",
      RefNo: UserId,
      Remarks: responseData?.Remarks || "",
      Remarks1: responseData?.Remarks1 || "",
      TotAmt: responseData?.TotAmt || "",
      TransType: responseData?.TransType || "",
      CdateStr: formatDate2(selectedDate) || responseData?.CdateStr,
    }));
  };

  const fetchPaymentData = async () => {
    if (!Props?.paymentId) {
      setLoading(true);
      const masterCode = await listAPI.getPaymentMasterRecordByCode("0");

      if (masterCode) {
        setPaymentMasterByCodeList(masterCode || []);

        if (masterCode && masterCode?.length > 0) {
          const firstPayment = masterCode[0];
          if (firstPayment && firstPayment?.CdateStr) {
            setDate(firstPayment?.CdateStr);
          }
        }
      }
      setLoading(false);
    } else {
      setLoading(true);
      const masterCode = await listAPI.getPaymentMasterRecordByCode(Props?.paymentId);

      if (!paymentMasterByCodeList?.length && masterCode) {
        setPaymentMasterByCodeList(masterCode || []);

        if (masterCode && masterCode?.length > 0) {
          const firstPayment = masterCode[0];
          if (firstPayment && firstPayment?.CdateStr) {
            setDate(firstPayment?.CdateStr);
          }
          updateFormDataFromResponse(firstPayment);
        }
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await listAPI.getPartyList();
        const response2 = await listAPI.getCashAccountList();

        if (response) {
          const fieldsToExclude = ["Byr_nam", "AccAutoID", "AccAutoIDClient"]; // Define fields to exclude

          const updatedPartyList = response?.PartyList?.map((item: NewPaymentInterface) => {
            const combinedField = Object.keys(item)
              .filter(
                (key) =>
                  !fieldsToExclude.includes(key) &&
                  item[key as keyof NewPaymentInterface] !== null &&
                  item[key as keyof NewPaymentInterface] !== undefined
              )
              .map((key) => item[key as keyof NewPaymentInterface])
              .join(" ")
              .replace(/\s+/g, " ") // Replace multiple spaces with a single space
              .trim();

            return {
              ...item,
              combinedField,
            };
          });

          setPartyList(updatedPartyList);
          setLoading(false);
        }
        if (response2) {
          const fieldsToExclude = ["Byr_nam", "AccAutoID", "AccAutoIDClient"]; // Define fields to exclude
          const updatedPartyList = response2?.PartyList?.map((item: PartyItemType) => {
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

    fetchData();
    if (paymentMasterByCodeList?.length === 0) {
      fetchPaymentData();
    }
  }, [Props?.paymentId]);

  useEffect(() => {
    if (Props?.partyId && partyList.length > 0) {
      const result = partyList?.filter((item) => item?.AccAutoID == Props?.partyId);
      if (result) {
        setSelectedParty(result);
      } else {
        if (partyList.length > 0) {
          toast.info("Select party location to get details");
        }
      }
    }
  }, [Props?.partyId, partyList]);

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

  const updatePaymentMasterByCodeList = (field, value) => {
    const updatedPaymentMasterByCodeList = paymentMasterByCodeList.map((item) => ({
      ...item,
      [field]: value,
    }));

    setPaymentMasterByCodeList(updatedPaymentMasterByCodeList);
  };

  const updatePartyNameInPaymentMaster = (selectedItem) => {
    if (selectedItem) {
      const updatedPaymentMaster = paymentMasterByCodeList.map((item) => ({
        ...item,
        PartyName: selectedItem.Byr_nam,
        DisRemarks: selectedItem.DisRemarks,
        Discount: selectedItem.Discount,
        PartyID: selectedItem.AccAutoID,
        PayModel: selectedItem.PayModel,
        PaymentID: selectedItem.PaymentID,
        PAYSLNO: selectedItem.PAYSLNO,
        RefNo: UserId,
        Route: route,
        UserAutoID: userId,
        UserCode: userCode,
        VehicleNo: vehicleNumber,
      }));

      setPaymentMasterByCodeList(updatedPaymentMaster);
    } else {
      console.log("No data found in selectedItem");
    }
  };

  const handleInputChange = (field, value) => {
    setFormdData({
      ...formData,
      [field]: value,
    });

    updatePaymentMasterByCodeList(field, value);
  };

  const handleOrder = async (selectedItem: NewPaymentInterface) => {
    setLoading(true);
    const getLocationPlace = (response) => {
      if (response?.address) {
        return response.address.neighbourhood || response.address.town || response.address.village;
      }

      return undefined;
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const response = await listAPI.getUserLocationDetails(latitude, longitude);
          setLocationData({
            LocationString: response?.display_name,
            LocLatLong: `${latitude},${longitude}`,
            AccAutoID: selectedItem?.AccAutoIDClient,
            LocPlace: getLocationPlace(response),
            AprUser: session.data?.user.name,
            CDateStr: formatDate2(currentDate),
            EntLocID: "0",
            Module: "PAYMENT",
            Reason: "",
            Remarks: remarks || getCurrentTime(),
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.warn("Please allow location");
          setLocationData({
            LocationString: "Location not allowded",
            LocLatLong: `NA`,
            AccAutoID: selectedItem?.AccAutoIDClient,
            LocPlace: "NA",
            AprUser: session.data?.user.name,
            CDateStr: formatDate2(currentDate),
            EntLocID: "0",
            Module: "PAYMENT",
            Reason: "",
            Remarks: remarks || getCurrentTime(),
          });
          setLoading(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }

    setFormdData({
      ...formData,
      PartyName: selectedItem?.Byr_nam,
      BillAmount: selectedItem?.BillAmount,
      TotAmt: selectedItem?.TotAmt,
      DisRemarks: selectedItem?.DisRemarks,
      Discount: selectedItem?.Discount,
      PartyID: selectedItem?.AccAutoID,
      PayModel: selectedItem?.PayModel,
      PaymentID: selectedItem?.PaymentID,
      PAYSLNO: selectedItem?.PAYSLNO,
      AccAddress: selectedItem?.AccAddress,
      RefNo: UserId,
    });

    updatePartyNameInPaymentMaster(selectedItem);
    const storedUserYear = localStorage.getItem("UserYear");
    const yearArray = storedUserYear.split("_");
    const numericYear = yearArray[1];
    try {
      const response = await listAPI.getpartypaymentdetail(numericYear, selectedItem.Byr_nam, selectedItem.AccAutoID);
      if (response) {
        setSelectedBillItem(response);
        const sortArr = response[0]?.AccountLedger.sort((a, b) => b.seno - a.seno);
        setAccountLedger(sortArr);
      }
    } catch (error) {
      console.error(error);
    }
    setShowSearch(false);
    setLoading(false);
  };

  useEffect(() => {
    if (selectedParty?.length > 0) {
      console.log("handle party order usereffect");
      handleOrder(selectedParty[0]);
    }
  }, [selectedParty]);

  const handleSubmission = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    console.log(paymentMasterByCodeList);
    if (locationData.LocPlace === "NA") toast.warn("Please allow location in site settings");

    if (
      paymentMasterByCodeList[0]?.PartyName === "" ||
      paymentMasterByCodeList[0]?.PartyID === 0 ||
      paymentMasterByCodeList[0]?.TotAmt === 0
    ) {
      toast.warn("Please enter valid inputs");
      setSubmitted(false);
      // setClose(); //make this available after test
      return;
    }

    let count = 0;
    let err = 0;

    paymentMasterByCodeList[0]?.PaymentDetail.forEach((obj) => {
      if (obj?.DTLMOP) {
        count++;
        if (obj.DTLMOP === "Cash") {
          if (obj.PayCrAmt === 0 || obj.PayCrAmt === "") {
            toast.warn("Please enter the amount");
            err++;
            setSubmitted(false);
            return;
          }
        }
        if (obj.DTLMOP === "Cheque") {
          if (obj.PayCrAmt === 0 || obj.PayCrAmt === "" || obj.DtlAccName === "" || obj.DtlChqNo === "" || obj.DtlChQDated === "") {
            err++;
            toast.warn("Please enter the amount, mode of payment, cheque date and cheque ref no");
            setSubmitted(false);
            return;
          } else if (obj.DtlChqNo === "0" || obj.DtlChqNo === 0) {
            err++;
            toast.warn("Cheque ref no should not be 0");
            setSubmitted(false);
            return;
          }
        }
        if (obj.DTLMOP === "credit_card" || obj.DTLMOP === "Online/UPI") {
          if (obj.PayCrAmt === 0 || obj.PayCrAmt === "" || obj.DtlAccName === "") {
            err++;
            toast.warn("Please enter the amount and credentials");
            setSubmitted(false);
            return;
          }
        }
      }
    });

    if (count === 0) {
      toast.warn("Please select a mode of payment");
      setSubmitted(false);
      return;
    }
    if (err > 0) {
      return;
    }

    paymentMasterByCodeList[0].CdateStr = formatDate2(selectedDate);

    try {
      const response = await updateAPI.updateOrderPayments(paymentMasterByCodeList, [locationData]); // submitting data

      if (response) {
        toast.success("Payment Added successfully");
        setSubmitted(false);
        setClose();
        router.push("/todaysPayment");
        // window.location.reload();
      }
    } catch (error) {
      setSubmitted(false);
      console.error(error);
    }
  };

  const handleDetailInputChange = (paymentIndex, detailIndex, field, value) => {
    const updatedPaymentMasterByCodeList = [...paymentMasterByCodeList];
    if (field === "DtlChQDated") {
      value = swapDateBack(value);
    }
    if (field === "DtlAccName") {
      const thatId = cashAccountList.find((id) => id.Byr_nam === value);
      updatedPaymentMasterByCodeList[paymentIndex].PaymentDetail[detailIndex]["DtlAccid"] = thatId?.AccAutoIDClient;
    }
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

    const updatedAmount = updatedPaymentMasterByCodeList?.map((item) => ({
      ...item,
      BillAmount: newTotalAmount,
      TotAmt: newTotalAmount,
    }));

    setPaymentMasterByCodeList(updatedAmount);
  };

  const lastItemIndex = accountLedger?.length - 1; // Get the index of the last item
  const lastItemCLR = lastItemIndex >= 0 ? accountLedger[lastItemIndex].CLR : "";

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

  const handleCollapse = (index: number) => {
    const indexInList = collapse.indexOf(index);
    if (indexInList !== -1) {
      const updatedList = collapse.filter((item) => item !== index);
      setCollapse(updatedList);
    } else {
      setCollapse([...collapse, index]);
    }
  };

  return (
    <>
      <div className="flex max-h-[87vh] h-full w-full">
        {loading && <Spinner />}
        <div className="w-full p-0.5 md:p-2 overflow-auto">
          <form className="">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-0.5">Party Name</label>
              <div className="relative w-full">
                <input
                  type="text"
                  className="shadow appearance-none input-primary rounded w-full py-2 px-3 text-gray-700 leading-tight"
                  placeholder="Party Detail"
                  onClick={() => setShowSearch(!showSearch)}
                  value={formData?.PartyName}
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
                          type="button"
                          className="flex flex-col w-full shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start"
                        >
                          <h3 className="text-md font-semibold text-success-content cursor-pointer">{item.Byr_nam}</h3>
                          <p className="text-sm font-medium text-success-content">{item.AccAddress}</p>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="mb-4">
              {/* <label className="block text-gray-700 text-sm font-bold mb-2">Acc Address</label> */}
              <input
                type="text"
                className="shadow appearance-none input-primary rounded w-full py-2 px-3 text-gray-700 leading-tight"
                placeholder="Party Address"
                value={formData?.AccAddress}
              />
            </div>
            <div className="flex w-full gap-1 md:gap-3 ">
              <div className="mb-1 flex w-full md:gap-0 gap-2">
                <label className="block text-gray-700 text-sm font-bold mb-0 md:mb-2">Date</label>
                <input
                  value={formatDate(selectedDate)}
                  onChange={handleDateChange}
                  type="date"
                  className="shadow appearance-none input-primary rounded w-full py-2 px-3 text-gray-700 leading-tight"
                  placeholder="Enter Remarks"
                />
                <div className="flex gap-2">
                  {selectedBillItem &&
                    selectedBillItem?.map((item, index) => (
                      <div key={index} className="w-fit z-30 mx-2 flex my-auto">
                        <h2
                          onClick={() => setShowDetail(!showDetail)}
                          className={`text-md rounded-md flex gap-3 shadow-lg whitespace-nowrap font-semibold p-3 ${getBackgroundColorClass(
                            lastItemCLR
                          )}`}
                        >
                          {item.OPDRBLC && item.OPDRBLC > 0 ? `₹: ${item.OPDRBLC}` : `₹: ${item.OPCRBLC}`}
                          <span>
                            <FcViewDetails size="25" />
                          </span>
                        </h2>
                      </div>
                    ))}
                </div>
              </div>
              {/* <div className="mb-4 md:block flex md:gap-0 gap-2">
                <label className="block text-gray-700 text-sm font-bold mb-0 md:mb-2">Remarks</label>
                <textarea
                  value={formData.Remarks}
                  onChange={(e) => handleInputChange("Remarks", e.target.value)}
                  className="shadow appearance-none input-primary rounded w-full py-2 px-3 text-gray-700 leading-tight"
                  placeholder="Enter Remarks"
                  rows={1}
                ></textarea>
              </div> */}
            </div>

            <div className=" w-full   shadow-md shadow-gray-400 rounded-md mt-1 md:mt-4 lg:mt-12 mx-auto">
              {/* <div className="w-full bg-primary text-white font-semibold text-base md:text-xl  text-center p-1 md:px-3 md:py-4">
                Mode of Pay Details Selection {date}
              </div> */}

              <div className="grid md:hidden mt-2 md:mt-6 grid-cols-1 gap-3 px-2 max-h-96 overflow-y-auto ">
                {paymentMasterByCodeList &&
                  paymentMasterByCodeList.map((payment, paymentIndex) => {
                    return (
                      <React.Fragment key={paymentIndex}>
                        {payment.PaymentDetail?.slice(0, visibleBillArray)?.map((detail, detailIndex) => {
                          return (
                            <div key={detailIndex} className="bg-blue-200 shadow-md rounded-lg mb-1 border border-blue-200 overflow-hidden">
                              <div className="p-1">
                                <div className="flex justify-between w-full items-center rounded bg-blue-600">
                                  <p className="text-lg font-semibold ps-2">Mode Of Pay: {detailIndex + 1}</p>
                                  {!collapse?.includes(detailIndex + 1) && visibleBillArray < payment?.PaymentDetail?.length ? (
                                    <>
                                      <button
                                        className="h-full text-black"
                                        type="button"
                                        onClick={() => {
                                          handleCollapse(detailIndex + 1);
                                          setVisibleBillArray(visibleBillArray + 1);
                                        }}
                                      >
                                        {!collapse?.includes(detailIndex + 1) && visibleBillArray < payment?.PaymentDetail?.length ? (
                                          <FaPlus
                                            size={25}
                                            className={`m-2 ${
                                              collapse?.includes(detailIndex + 1)
                                                ? "rotate-180 transition-all duration-300 ease-in-out"
                                                : "rotate-0 transition-all duration-300 ease-in-out"
                                            }`}
                                          />
                                        ) : (
                                          <IoIosArrowDown
                                            size={25}
                                            className={`m-2 ${
                                              collapse?.includes(detailIndex + 1)
                                                ? "rotate-180 transition-all duration-300 ease-in-out"
                                                : "rotate-0 transition-all duration-300 ease-in-out"
                                            }`}
                                          />
                                        )}
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        className="h-full text-black"
                                        type="button"
                                        onClick={() => {
                                          handleCollapse(detailIndex + 1);
                                          setVisibleBillArray(detailIndex + 1);
                                        }}
                                      >
                                        {!collapse?.includes(detailIndex + 1) && visibleBillArray < payment?.PaymentDetail?.length ? (
                                          <FaPlus
                                            size={25}
                                            className={`m-2 ${
                                              collapse?.includes(detailIndex + 1)
                                                ? "rotate-180 transition-all duration-300 ease-in-out"
                                                : "rotate-0 transition-all duration-300 ease-in-out"
                                            }`}
                                          />
                                        ) : (
                                          <IoIosArrowDown
                                            size={25}
                                            className={`m-2 ${
                                              collapse?.includes(detailIndex + 1)
                                                ? "rotate-180 transition-all duration-300 ease-in-out"
                                                : "rotate-0 transition-all duration-300 ease-in-out"
                                            }`}
                                          />
                                        )}
                                      </button>
                                    </>
                                  )}

                                  {/* {!collapse?.includes(detailIndex + 1) && visibleBillArray < payment?.PaymentDetail?.length && (
                                    <button
                                      className="bg-gradient-to-r from-cyan-500 to-blue-500 mb-2 mx-auto cursor-pointer w-fit hover:scale-110 text-white py-2 px-4 rounded"
                                      type="button"
                                      onClick={() => setVisibleBillArray(visibleBillArray + 1)}
                                    >
                                      Add
                                    </button>
                                  )} */}
                                </div>

                                <div
                                  className={`flex flex-col w-full p-2 ${
                                    collapse?.includes(detailIndex + 1)
                                      ? "transition-all duration-500 ease-in-out"
                                      : "hidden transition-all duration-500 ease-in-out"
                                  }`}
                                >
                                  <div className="text-gray-700 mb-2 flex w-full items-center">
                                    <label htmlFor="modeOfPay" className="mr-2 basis-[40%] md:text-base text-sm">
                                      Mode of Pay:
                                    </label>
                                    <select
                                      id="modeOfPay"
                                      className="border input-primary p-1 rounded w-full"
                                      value={detail.DTLMOP}
                                      onChange={(e) => handleDetailInputChange(paymentIndex, detailIndex, "DTLMOP", e.target.value)}
                                    >
                                      <option value=""></option>
                                      <option value="Cash">Cash</option>
                                      <option value="Cheque">Cheque</option>
                                      <option value="credit_card">Credit Card</option>
                                      <option value="Online/UPI">Online/UPI</option>
                                    </select>
                                  </div>
                                  <div className="text-gray-700 mb-2 flex w-full items-center">
                                    <label htmlFor="bank" className="mr-2 basis-[40%] md:text-base text-sm">
                                      Bank:
                                    </label>
                                    <select
                                      id="bank"
                                      className="border input-primary p-1 rounded w-full"
                                      value={detail.DtlAccName}
                                      onChange={(e) => handleDetailInputChange(paymentIndex, detailIndex, "DtlAccName", e.target.value)}
                                    >
                                      <option value=""></option>
                                      {cashAccountList?.map((data, ind) => (
                                        <option key={ind} value={data?.Byr_nam}>
                                          {data?.Byr_nam}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="text-gray-700 mb-2 flex w-full items-center">
                                    <label htmlFor="chequeRefNo" className="mr-2 basis-[40%] md:text-base text-sm">
                                      Cheque/RefNo:
                                    </label>
                                    <input
                                      type="text"
                                      id="chequeRefNo"
                                      className="border input-primary p-1 rounded w-full"
                                      value={detail.DtlChqNo}
                                      onChange={(e) => handleDetailInputChange(paymentIndex, detailIndex, "DtlChqNo", e.target.value)}
                                    />
                                  </div>

                                  <div className="text-gray-700 mb-2 w-full flex items-center">
                                    <label htmlFor="amount" className="mr-2 basis-[40%] md:text-base text-sm">
                                      Amount:
                                    </label>
                                    <input
                                      type="text"
                                      id="amount"
                                      className="border input-primary rounded p-1 w-full"
                                      value={detail.PayCrAmt}
                                      onClick={(e) => {
                                        e.target.value = "";
                                        handleDetailInputChange(paymentIndex, detailIndex, "PayCrAmt", e.target.value);
                                      }}
                                      onChange={(e) => handleDetailInputChange(paymentIndex, detailIndex, "PayCrAmt", e.target.value)}
                                    />
                                  </div>

                                  <div className="text-gray-700 mb-2 w-full flex items-center">
                                    <label htmlFor="cheque" className="mr-2 basis-[40%] md:text-base text-sm">
                                      Cheque Date:
                                    </label>
                                    <input
                                      type="date"
                                      id="cheque"
                                      className="border input-primary rounded p-1 w-full"
                                      value={swapDate(detail.DtlChQDated)}
                                      onChange={(e) => handleDetailInputChange(paymentIndex, detailIndex, "DtlChQDated", e.target.value)}
                                    />
                                  </div>

                                  <div className="text-gray-700 w-full flex items-center">
                                    <label htmlFor="remarks" className="mr-2 basis-[40%] md:text-base text-sm">
                                      Remark:
                                    </label>
                                    <input
                                      type="text"
                                      id="remarks"
                                      className="border input-primary rounded p-1 w-full"
                                      value={detail.DtlRemark}
                                      onChange={(e) => handleDetailInputChange(paymentIndex, detailIndex, "DtlRemark", e.target.value)}
                                    />
                                  </div>

                                  {/* <div className="text-gray-700 mb-2 flex items-center">
                                    <label htmlFor="cashTrans" className="mr-2 basis-[40%]">
                                      Cash Trans:
                                    </label>
                                    <select
                                      id="cashTrans"
                                      className="py-2 px-3 select-primary basis-[60%] rounded"
                                      value={detail.AutNo}
                                      onChange={(e) => handleDetailInputChange(paymentIndex, detailIndex, "AutNo", e.target.value)}
                                    >
                                      <option value=""></option>
                                      <option value="0">Cash</option>
                                      <option value="1">Bill</option>
                                      <option value="2">Other</option>
                                    </select>
                                  </div> */}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
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
                      {/* <th className="w-40 p-2">Cash Trans</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {paymentMasterByCodeList &&
                      paymentMasterByCodeList.map((payment, paymentIndex) =>
                        payment.PaymentDetail.map((detail, detailIndex) => (
                          <>
                            <tr key={detailIndex}>
                              <td className="border border-gray-400 p-2">{detailIndex + 1}</td>
                              <td className="border border-gray-400 p-2">
                                <select
                                  className="py-2 px-3 select-primary  rounded"
                                  value={detail.DTLMOP}
                                  onChange={(e) => handleDetailInputChange(paymentIndex, detailIndex, "DTLMOP", e.target.value)}
                                >
                                  <option value=""></option>
                                  <option value="Cash">Cash</option>
                                  <option value="Cheque">Cheque</option>
                                  <option value="credit_card">Credit Card</option>
                                  <option value="Online/UPI">Online/UPI</option>
                                </select>
                              </td>
                              <td className="border border-gray-400 p-2">
                                <select
                                  className="py-2 px-3 select-primary rounded"
                                  value={detail.DtlAccName}
                                  onChange={(e) => handleDetailInputChange(paymentIndex, detailIndex, "DtlAccName", e.target.value)}
                                >
                                  <option value=""></option>
                                  {cashAccountList?.map((data, ind) => (
                                    <option key={ind} value={data?.Byr_nam}>
                                      {data?.Byr_nam}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="border border-gray-400 p-2">
                                <input
                                  type="text"
                                  className=" input-primary p-1 w-full"
                                  value={detail.DtlChqNo}
                                  onChange={(e) => handleDetailInputChange(paymentIndex, detailIndex, "DtlChqNo", e.target.value)}
                                />
                              </td>
                              <td className="border border-gray-400 p-2">
                                <input
                                  type="text"
                                  className=" input-primary p-1 w-full"
                                  value={detail.PayCrAmt}
                                  onClick={(e) => {
                                    e.target.value = "";
                                    handleDetailInputChange(paymentIndex, detailIndex, "PayCrAmt", e.target.value);
                                  }}
                                  onChange={(e) => handleDetailInputChange(paymentIndex, detailIndex, "PayCrAmt", e.target.value)}
                                />
                              </td>
                              <td className="border  border-gray-400 p-2">
                                <input
                                  type="date"
                                  className="input-primary p-1 w-full"
                                  value={swapDate(detail.DtlChQDated)}
                                  onChange={(e) => handleDetailInputChange(paymentIndex, detailIndex, "DtlChQDated", e.target.value)}
                                />
                              </td>
                              <td className="border border-gray-400 p-2">
                                <input
                                  type="text"
                                  className=" input-primary p-1 w-full"
                                  value={detail.DtlRemark}
                                  onChange={(e) => handleDetailInputChange(paymentIndex, detailIndex, "DtlRemark", e.target.value)}
                                />
                              </td>
                              {/* <td className="border border-gray-400 p-2">
                                <select
                                  className="py-2 px-3 input-primary  rounded"
                                  value={detail.AutNo}
                                  onChange={(e) => handleDetailInputChange(paymentIndex, detailIndex, "AutNo", e.target.value)}
                                >
                                  <option value=""></option>
                                  <option value="0">Cash</option>
                                  <option value="1">Bill</option>
                                  <option value="2">Other</option>
                                </select>
                              </td> */}
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
                <SubmitButton submitted={submitted} onClick={handleSubmission} type="submit" />
                <button
                  className="btn btn-error w-full lg:w-38  text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2 md:mt-0 lg:mt-0"
                  type="button"
                  onClick={RemoveText}
                >
                  Clear Remarks
                </button>
              </div>
            </div>
            <div>
              <div className="lg:flex items-center gap-1 p-2 py-2">
                <div className="md:block flex md:gap-0 gap-2 w-full">
                  <label className="text-gray-700 text-sm font-bold mr-2 basis-[40%]">Amount Paid:</label>
                  <div className="flex border rounded w-full">
                    <input type="text" className="py-2 px-3 w-full border input-primary" value={formData.BillAmount} readOnly />
                  </div>
                </div>

                <div className="md:block flex md:gap-0 gap-2 w-full">
                  <label className="text-gray-700 text-sm font-bold mr-2 basis-[40%]">Total</label>
                  <div className="flex border rounded w-full">
                    <input type="text" className="py-2 px-3 w-full border input-primary" value={formData.TotAmt} readOnly />
                  </div>
                </div>

                <div className="md:block flex md:gap-0 gap-2 w-full">
                  <label className="text-gray-700 text-sm font-bold mr-2 basis-[40%]">Discount Remarks</label>
                  <div className="flex border rounded w-full">
                    <input type="text" className="py-2 px-3 w-full border input-primary" value={formData.DisRemarks} readOnly />
                  </div>
                </div>
                <div className="md:block flex md:gap-0 gap-2 w-full">
                  <label className="text-gray-700 text-sm font-bold mr-2 basis-[40%]">Remarks</label>
                  <div className="flex border rounded w-full">
                    <textarea
                      type="text"
                      className="py-2 px-3 w-full border input-primary"
                      onChange={(e) => handleInputChange("Remarks", e.target.value)}
                      rows={1}
                      value={formData.Remarks}
                    />
                  </div>
                </div>
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
                      <div className="text-md font-semibold text-success-content cursor-pointer" onClick={() => item}>
                        {item.Byr_nam}
                      </div>
                      <div className="text-sm font-medium text-success-content">{item.AccAddress}</div>
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
                          <div className="ml-4 text-lg font-semibold text-success-content cursor-pointer" onClick={() => handleOrder(item)}>
                            {item.Byr_nam}
                          </div>
                          <div className="text-sm font-medium ml-3 text-success-content ">{item.combinedField}</div>
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
                  <h3 className="text-xl w-full font-semibold text-center mx-auto text-gray-900">{formData?.BuyerName}</h3>
                  <button
                    type="button"
                    onClick={() => setShowDetail(false)}
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    data-modal-hide="default-modal"
                  >
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
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
                                <td className={`py-2 px-4 ${getBackgroundColorClass(listItem.CLR)}  items-center`}>
                                  <div className="mr-2">
                                    {listItem.CT_DT
                                      ? new Intl.DateTimeFormat("en-IN").format(
                                          new Date(parseInt(listItem.CT_DT.replace("/Date(", "").replace(")/", ""), 10))
                                        )
                                      : ""}
                                  </div>
                                  <div className="mr-2">{listItem.TRANSTYPE}</div>
                                  <div>{listItem.BALANCE}</div>
                                </td>
                                <td className={`py-2 px-4 ${listItem.DRAMOUNT > 0 ? "bg-red-500 text-white" : ""}`}>
                                  {listItem.CDRAMOUNT}
                                </td>
                                <td className={`py-2 px-4 ${listItem.CRAMOUNT > 0 ? "bg-green-500 text-white" : ""}`}>
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
                            <th className="py-2 px-4 text-left text-warning-content">Ref/VchNo</th>
                            <th className="py-2 px-4 text-left text-warning-content">Nature</th>
                            <th className="py-2 px-4 text-left text-warning-content">Debit</th>
                            <th className="py-2 px-4 text-left text-warning-content">Credit</th>
                            <th className="py-2 px-4 text-left text-warning-content">Balance</th>
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
                                        new Date(parseInt(listItem.CT_DT.replace("/Date(", "").replace(")/", ""), 10))
                                      )
                                    : ""}
                                </td>
                                <td className="py-2 px-4">{listItem.vchno}</td>
                                <td className="py-2 px-4">{listItem.TRANSTYPE}</td>
                                <td className={`py-2 px-4 ${listItem.DRAMOUNT > 0 ? "bg-red-500 text-white" : ""}`}>
                                  {listItem.CDRAMOUNT}
                                </td>
                                <td className={`py-2 px-4 ${listItem.CRAMOUNT > 0 ? "bg-green-500 text-white" : ""}`}>
                                  {listItem.CCRAMOUNT}
                                </td>
                                <td className={`py-2 px-4 ${getBackgroundColorClass(listItem.CLR)}`}>{listItem.BALANCE}</td>
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
export default EditNewPayment;
