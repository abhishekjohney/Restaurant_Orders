// @ts-nocheck
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ListApi } from "@/app/utils/api";
import PrintPartyListLedger from "./PrintPartyListLedger";
import { useReactToPrint } from "react-to-print";
import { useModal } from "@/Provider";
import CustomModal from "../Modal";
import EditNewPayment from "../common/newPayment";
import { useSession } from "next-auth/react";
import { formatDate, swapDateBack } from "@/lib/helper-function";
import { AccountLedgerItemType, SelectedPartyDetailsInterface } from "@/types";

function PartyListDetailModal({ buyerName, buyerNameAdd, gst, accAutoID }) {
  const listAPI = new ListApi();
  const router = useRouter();
  const session = useSession();
  const [selectedBillItem, setSelectedBillItem] = useState<SelectedPartyDetailsInterface[]>([]);
  const [year, setYear] = useState("");
  const [route, setRoute] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [userCode, setUserCode] = useState("");
  const [userId, setUserId] = useState("");
  const { setClose, isOpen, setOpen } = useModal();
  const [accountLedger, setAccountLedger] = useState<AccountLedgerItemType[]>([]);
  const [moreOpt, setMoreOpt] = useState(false);
  const [searchMore, setSearchMore] = useState(false);
  const [formData, setFormData] = useState({
    from: "",
    upto: "",
  });

  useEffect(() => {
    const storedUserYear = localStorage?.getItem("UserYear");

    if (storedUserYear) {
      const parts = storedUserYear.split("_");
      const loginYear = parseInt(parts[1]);

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const financialYearStart = currentMonth <= 2 ? new Date(loginYear, 3, 1) : new Date(loginYear, 3, 1);
      const formattedFrom = financialYearStart.toISOString().split("T")[0];
      const formattedUpto = currentDate.toISOString().split("T")[0];

      setFormData({
        from: formattedFrom,
        upto: formattedUpto,
      });
    } else {
      console.error("UserYear not found in localStorage");
    }
  }, []);

  const componentRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const storedUserYear = localStorage.getItem("UserYear");

      // Extract the numeric part from the string
      const yearArray = storedUserYear.split("_");
      const numericYear = yearArray[1];

      try {
        const response = await listAPI.getpartypaymentdetail(numericYear, buyerName, accAutoID, "", "");
        if (response) {
          setSelectedBillItem(response);
          const sortArr = response[0]?.AccountLedger.sort((a, b) => b.seno - a.seno);
          setAccountLedger(sortArr);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

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
  }, [session.data?.user.name]);

  const lastItemIndex = accountLedger.length - 1; // Get the index of the last item
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

  const handleMoreOption = () => {
    setMoreOpt(!moreOpt);
  };
  const handlePayment = () => {
    setOpen();
  };
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, val: string) => {
    const inputValue = e.target.value;
    const newDate = new Date(inputValue).toISOString().split("T")[0];
    if (val === "from") {
      setFormData({ ...formData, from: newDate });
    } else {
      setFormData({ ...formData, upto: newDate });
    }
  };

  const handleSearch = async () => {
    try {
      let from = swapDateBack(formData.from);
      let upto = swapDateBack(formData.upto);
      const response = await listAPI.getpartypaymentdetail(0, buyerName, accAutoID, from, upto);
      if (response) {
        setSelectedBillItem(response);
        const sortArr = response[0]?.AccountLedger.sort((a, b) => b.seno - a.seno);
        setAccountLedger(sortArr);
      }
    } catch (error) {
      console.error(error);
    }
  };

  console.log(searchMore, " in details modal");

  return (
    <>
      {isOpen && (
        <CustomModal
          children={<EditNewPayment userCode={userCode} userId={userId} partyId={accAutoID} />}
          title="New Payment"
        ></CustomModal>
      )}
      <div className="mb-4 w-[95%] mx-auto">
        <label className="block text-warning-content text-sm font-bold mb-2">Party Accounts Details</label>
        <textarea
          className="shadow appearance-none border input-info rounded w-full py-2 px-4 leading-tight"
          rows={3}
          value={`${buyerName}\n${buyerNameAdd}\n${gst}`}
          readOnly // Adding readOnly attribute to prevent editing
        />
      </div>

      <div className="container max-w-screen w-[95%] mx-auto">
        {selectedBillItem &&
          selectedBillItem.map((item, index) => (
            <div key={index} className="h-fit w-full rounded-lg">
              <div className="flex mb-3 justify-between items-center">
                <h2 className={`text-md h-fit text-white font-semibold p-2 ${getBackgroundColorClass(lastItemCLR)}`}>
                  {item.OPDRBLC && item.OPDRBLC > 0 ? `Due Amount: ${item.OPDRBLC}` : `Advance Payment: ${item.OPCRBLC}`}
                </h2>
                <div className="gap-1 flex flex-wrap h-fit items-center">
                  <button
                    className="btn btn-primary rounded-md text-white md:px-3 px-[6px] md:py-2 py-1 md:text-base sm:text-sm h-fit w-fit text-xs"
                    onClick={handleMoreOption}
                  >
                    More opt
                  </button>
                  <button
                    className="btn btn-primary rounded-md text-white md:px-3 px-[6px] md:py-2 py-1 md:text-base sm:text-sm h-fit w-fit text-xs"
                    onClick={handlePayment}
                  >
                    Payment
                  </button>
                  <button
                    className="btn btn-primary rounded-md text-white md:px-3 px-[6px] md:py-2 py-1 md:text-base sm:text-sm h-fit w-fit text-xs"
                    onClick={handlePrint}
                  >
                    Print
                  </button>
                </div>
              </div>

              {moreOpt && (
                <div className="flex flex-col md:flex-row gap-1 bg-gray-200 rounded-md shadow-md p-1 md:p-2 w-fit">
                  <div className="flex gap-1 flex-row">
                    <label
                      htmlFor="dateFrom"
                      className="text-sm block font-openSans uppercase border border-black border-solid px-2 py-2 bg-[#B70404] font-medium text-white rounded"
                    >
                      From:
                    </label>
                    <input
                      id="dateFrom"
                      value={formData.from ? formData.from : ""}
                      onChange={(e) => {
                        handleDateChange(e, "from");
                      }}
                      type="date"
                      className="shadow appearance-none border input-info rounded w-auto py-2 px-3 leading-tight placeholder:font-montserrat"
                    />
                  </div>
                  <div className="flex gap-1 flex-row">
                    <label
                      htmlFor="dateFrom"
                      className="text-sm block font-openSans uppercase border border-black border-solid px-2 py-2 bg-[#B70404] font-medium text-white rounded"
                    >
                      Upto:
                    </label>
                    <input
                      id="dateFrom"
                      value={formData.upto ? formData.upto : ""}
                      onChange={(e) => {
                        handleDateChange(e, "upto");
                      }}
                      type="date"
                      className="shadow appearance-none border input-info rounded w-auto py-2 px-3 leading-tight placeholder:font-montserrat"
                    />
                  </div>
                  <div>
                    <button onClick={handleSearch} className="md:px-3 px-2 md:py-2 py-1 text-white bg-blue-500 rounded-md" type="button">
                      search
                    </button>
                  </div>
                </div>
              )}

              <div className="grid lg:hidden mt-2 grid-cols-1 gap-6 px-2 max-h-96 shadow-lg overflow-y-auto">
                <div className=" w-full   bg-gray-100">
                  <table className="bg-white  table rounded-lg shadow-md">
                    <thead className="bg-primary sticky top-0">
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
                            <td className={`py-2 px-4 text-white ${getBackgroundColorClass(listItem.CLR)}  items-center`}>
                              <div className="mr-2">
                                {listItem.CT_DT
                                  ? new Intl.DateTimeFormat("en-IN").format(
                                      new Date(parseInt(listItem.CT_DT.replace("/Date(", "").replace(")/", ""), 10))
                                    )
                                  : ""}
                              </div>
                              <div className="mr-2 text-white">{listItem.TRANSTYPE}</div>
                              <div className=" text-white">{listItem.BALANCE}</div>
                            </td>
                            <td className={`py-2 px-4 ${listItem.DRAMOUNT > 0 ? "bg-red-500 text-white" : ""}`}>{listItem.CDRAMOUNT}</td>
                            <td className={`py-2 px-4 ${listItem.CRAMOUNT > 0 ? "bg-green-500 text-white" : ""}`}>{listItem.CCRAMOUNT}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="hidden lg:block shadow-lg overflow-x-auto ">
                <div className=" h-96 w-full overflow-scroll  bg-gray-100">
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
                                ? new Intl.DateTimeFormat("en-IN").format(
                                    new Date(parseInt(listItem.CT_DT.replace("/Date(", "").replace(")/", ""), 10))
                                  )
                                : ""}
                            </td>
                            <td className="py-2 px-4">{listItem.vchno}</td>
                            <td className="py-2 px-4">{listItem.TRANSTYPE}</td>
                            <td className={`py-2 px-4 ${listItem.DRAMOUNT > 0 ? "bg-red-500 text-white" : ""}`}>{listItem.CDRAMOUNT}</td>
                            <td className={`py-2 px-4 ${listItem.CRAMOUNT > 0 ? "bg-green-500 text-white" : ""}`}>{listItem.CCRAMOUNT}</td>
                            <td className={`py-2 px-4 ${getBackgroundColorClass(listItem.CLR)}`}>{listItem.BALANCE}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
      </div>
      <div ref={componentRef} className="print-content">
        <PrintPartyListLedger
          buyerName={buyerName}
          buyerNameAdd={buyerNameAdd}
          accountLedger={accountLedger}
          selectedBillItem={selectedBillItem}
        />
      </div>
    </>
  );
}

export default PartyListDetailModal;
