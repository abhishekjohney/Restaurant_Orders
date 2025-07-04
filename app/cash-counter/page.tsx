"use client";
import BackButton from "@/components/BackButton";
import PdfViewer from "@/components/common/PdfViewer";
import CustomFunctionalModal from "@/components/FunctionalModal";
import { Spinner } from "@/components/Spinner";
import {
  convertInputDateToSendFormat,
  convertSendFormatIntoInputFormat,
  getCurrentDateFormatted,
  getCurrentDateFormattedToInput,
} from "@/lib/helper-function";
import useRestoStore from "@/store/resto";
import { OrderItemTypeTodayOrder, SalesListInterface } from "@/types";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import billCounter from "../instant-bill/svg/billCounter.svg";
import { stateCode } from "../restaurants-bill/_components/help";
import OrderList from "../restaurants-bill/_components/OrderList";
import SaleList from "../restaurants-bill/_components/SalesList";
import {
  CalculateAndUpdateResBill,
  GetAccountAndPartyListSearch,
  GetAccountGroupMasterList,
  GetOrderDetailsByCode,
  GetPartyMasterByCode,
  GetRestSalesBillByCode,
  GetSalesRestBillingList,
  PrintRestOrderByCodeJson,
  PrintRestRetailInvoiceByCode,
  UpdateAccountBook,
  UpdateBillPaidStatus,
} from "../restaurants-bill/action";
import orderIcon from "../restaurants-bill/svg/order.svg";
import saleIcon from "../restaurants-bill/svg/sale.svg";
import {
  AccOrgAutoIdType,
  AccountInterface,
  AccountLedgerInterface,
  OrderDataInterface,
  RestoBlankItemInterface,
  RestoOrderDetailsInterface,
} from "../restaurants-bill/types";
import { ListApi } from "../utils/api";

const TodayOrders = () => {
  const { removeAll, restoDetails, setRestoDetails, setRestoProductContainer } = useRestoStore.getState();
  const componentRef = useRef<HTMLDivElement>(null);
  const listAPI = new ListApi();

  const [todayOrdersList, setTodayOrdersList] = useState<SalesListInterface[]>([]);
  const [filteredOrderList, setFilteredOrderList] = useState<SalesListInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<string>(getCurrentDateFormattedToInput());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [totalSum, setTotalSum] = useState("0");
  const [suggestion, setSuggestion] = useState<SalesListInterface[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [year, setYear] = useState("");
  const [userName, setUserName] = useState("");
  const [svrCode, setSvrCode] = useState<number>(0);
  const [pdfModal, setPdfModal] = useState<boolean>(false);
  const [pdfLink, setPdfLink] = useState("");
  const [pdfModal2, setPdfModal2] = useState<boolean>(false);
  const [pdfLink2, setPdfLink2] = useState("");
  const [saveModal, setSaveModal] = useState<boolean>(false);
  const [type, setType] = useState("");
  const [mopData, setMopData] = useState<SalesListInterface | Partial<SalesListInterface>>();
  const [mopModal, setMopModal] = useState<boolean>(false);
  const [todayOrders, setTodayOrders] = useState<OrderItemTypeTodayOrder[]>([]);
  const [todaySales, setTodaySales] = useState<SalesListInterface[]>([]);
  const [orderModal, setOrderModal] = useState(false);
  const [saleModal, setSaleModal] = useState(false);
  const [printInvoiceId, setPrintInvoiceId] = useState<number>(0);
  const [showMorePaymentOptions, setShowMorePaymentOptions] = useState(false);
  const [checkoutData, setCheckoutData] = useState<SalesListInterface | Partial<SalesListInterface>>();
  const [restoCurrCart, setRestoCurrCart] = useState<RestoBlankItemInterface[]>([]);
  const [confirmPopupOpen, setConfirmPopupOpen] = useState(false);
  const [salesView, setSalesView] = useState(false);
  const [searchQueryAcc, setSearchQueryAcc] = useState("");
  const [partyList, setPartyList] = useState<AccountInterface[]>([]);
  const [bankList, setBankList] = useState<AccountInterface[]>([]);
  const [filteredPartyList, setFilteredPartyList] = useState<AccountInterface[]>([]);
  const [showSearchAcc, setShowSearchAcc] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [addParty, setAddParty] = useState<AccountLedgerInterface | Partial<AccountLedgerInterface>>({});
  const [addPartyModal, setAddPartyModal] = useState(false);
  const [selectedgroupitemm, setSelectedGroupItem] = useState<AccOrgAutoIdType[]>([]);
  const [isCrChecked, setIsCrChecked] = useState(false);
  const [PopupView, setPopupView] = useState(false);
  const [restoCurrCartView, setRestoCurrCartView] = useState<RestoBlankItemInterface[]>([]);
  const [restoOrderView, setRestoOrderView] = useState<RestoOrderDetailsInterface | Partial<RestoOrderDetailsInterface>>({});
  const [totalGstPer, setTotalGstPer] = useState<number>(0);
  const [totalIgstPer, setTotalIgstPer] = useState<number>(0);
  const [totaltCgstPer, setTotalCGSTPer] = useState<number>(0);
  const [totalSgstPer, setTotalSGSTPer] = useState<number>(0);
  const [formData, setFormData] = useState<{ orderId: string }>({
    orderId: "",
  });

  const paymentOptions = [
    { label: "Cash", key: "CashPay" },
    { label: "UPI", key: "UPIPay" },
    { label: "Online", key: "OnlinePay" },
    { label: "Card", key: "CardPay" },
    { label: "Cheque", key: "ChequePay" },
    { label: "Credit", key: "CreditPay" },
  ];

  const primaryOptions = paymentOptions.slice(0, 2);
  const moreOptions = paymentOptions.slice(2);

  const [orderData, setOrderData] = useState<OrderDataInterface>({
    SeatNos: "",
    ModeOfDelivery: "DINE-IN",
    name: "",
    phone: "",
    DelPhoneNo: "",
    OrderAddress: "",
    OrderAddress2: "",
    OrderPin: "",
    OrderPlace: "",
    OrderCity: "",
    OrderDist: "",
    OrderDate: "",
    MOP: "Cash",
    Counter: "",
    CashPay: "0",
    CashPayAcc: "",
    CardPay: "",
    CardPayAcc: "",
    OnlinePay: "",
    OnlinePayAcc: "",
    UPIPay: "",
    UPIPayAcc: "",
    ChequePay: "",
    ChequePayAcc: "",
    CreditPay: "",
    CreditPayAcc: "",
    ModeofTax: "",
    MOTIndex: 0,
    ReqStatusType: "",
    ReqSvrCode: 0,
    employeeSelect: "",
    employeeCode: "",
    PartyID: 0,
    PartyName: "",
    PartyAddress: "",
    PartyPhone: "",
  });

  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    const selected = localStorage.getItem("salesType") || "";
    setType(selected);
  }, []);

  useEffect(() => {
    if (session.data?.user) {
      const nameToUse = session.data.user.name;
      const isAdmin = session.data.user.role;
      if (isAdmin === "admin") {
        setOrderData((prev) => ({
          ...prev,
          OrderDate: session.data.user.systemDate,
        }));

        setDate(convertSendFormatIntoInputFormat(session.data.user.systemDate));
      } else {
        setOrderData((prev) => ({
          ...prev,
          employeeSelect: nameToUse as string,
          OrderDate: session.data.user.systemDate,
        }));

        setDate(convertSendFormatIntoInputFormat(session.data.user.systemDate));
      }
    }
  }, [session.data?.user]);

  useEffect(() => {
    if (restoCurrCartView.length > 0) {
      const totalIgstGstP = restoCurrCartView.reduce((acc: number, conc: RestoBlankItemInterface) => acc + Number(conc.TrnIGSTPer || 0), 0);
      const totalSGstP = restoCurrCartView.reduce((acc: number, conc: RestoBlankItemInterface) => acc + Number(conc.TrnSGSTPer || 0), 0);
      const totalCGstP = restoCurrCartView.reduce((acc: number, conc: RestoBlankItemInterface) => acc + Number(conc.TrnCGSTPer || 0), 0);
      const totalGstAmP = restoCurrCartView.reduce((acc: number, conc: RestoBlankItemInterface) => acc + Number(conc.TrnGSTPer || 0), 0);

      setTotalCGSTPer(parseFloat(totalCGstP.toFixed(2)));
      setTotalSGSTPer(parseFloat(totalSGstP.toFixed(2)));
      setTotalIgstPer(parseFloat(totalIgstGstP.toFixed(2)));
      setTotalGstPer(parseFloat(totalGstAmP.toFixed(2)));
    }
  }, [restoCurrCartView]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetAccountAndPartyListSearch();
        const partyList = response?.PartyList || [];
        console.log(partyList);
        const sundry = partyList.filter((item: AccountInterface) => item.Groups === "Sundry Creditors" || item.Groups === "Sundry Debtors");
        const others = partyList.filter((item: AccountInterface) => item.Groups === "Bank Account");
        console.log(sundry);
        console.log(others);
        setPartyList(sundry);
        setBankList(others);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetAccountGroupMasterList();
        const action = response[0]?.ActionType;
        if (action > 0) {
          const JSONData1 = JSON.parse(response[0]?.JSONData1);
          setSelectedGroupItem(JSONData1);
        } else {
          let ErrorMessage = response[0]?.ErrorMessage;
          toast.warn(ErrorMessage);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const fetchPrintInvoice = async () => {
    try {
      const storedUserYear = localStorage.getItem("UserYear") as string;
      const parts = storedUserYear.split("_");
      const year = parts[1];
      setLoading(true);

      const response = await PrintRestRetailInvoiceByCode(printInvoiceId.toString(), year, orderData.employeeSelect);
      const action = response[0]?.ActionType;
      if (action > 0) {
        const JSONData1 = response[0]?.JSONData1;
        const url = `${process.env.NEXT_PUBLIC_WEBSERVICE_URL}${JSONData1}`;
        setPdfLink(url);
        setPdfModal(true);
      } else {
        let ErrorMessage = response[0]?.ErrorMessage;
        toast.error(ErrorMessage);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setPrintInvoiceId(0);
    }
  };

  useEffect(() => {
    if (printInvoiceId > 0) {
      fetchPrintInvoice();
    }
  }, [printInvoiceId]);

  useEffect(() => {
    if (searchQueryAcc) {
      if (partyList?.length > 0) {
        const filteredList = partyList.filter(
          (item) =>
            item.Byr_nam.toLowerCase().includes(searchQueryAcc.toLowerCase()) ||
            item?.AccAddress?.toLocaleLowerCase().includes(searchQueryAcc?.toLocaleLowerCase())
        );
        setFilteredPartyList(filteredList);
      }
    } else {
      setFilteredPartyList(partyList);
    }
  }, [partyList, searchQueryAcc]);

  const handlePartyItemChange2 = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value !== "" && filteredPartyList.length > 0) {
      const newList = filteredPartyList.filter(
        (item) => item.Byr_nam.toLowerCase().includes(value.toLowerCase()) || item.AccAddress.toLowerCase().includes(value.toLowerCase())
      );

      console.log(newList, "length");

      if (newList.length > 0) {
        setFilteredPartyList(newList);
        setShowSearchAcc(true);
        // console.log(newList);
      } else {
        setFilteredPartyList([]);
        setShowSearchAcc(false);
      }
    } else {
      setFilteredPartyList([]);
      setShowSearchAcc(false);
    }
  };

  const handleOrder = async (selectedItem: AccountInterface, itemSelect: string) => {
    setShowSearchAcc(false);
    setSearchQueryAcc(selectedItem?.Byr_nam);
    setOrderData({
      ...orderData,
      PartyName: selectedItem.Byr_nam,
      PartyID: selectedItem.AccAutoID,
      PartyAddress: selectedItem.AccAddress,
      PartyPhone: selectedItem.PhoneNo,
    });
  };

  const showSearchItems2 = () => {
    if (showSearchAcc) {
      return (
        <div className="absolute top-7 max-h-40 h-auto overflow-auto w-full">
          {showSearchAcc &&
            filteredPartyList &&
            filteredPartyList.map((item) => (
              <div key={item.AccAutoID} className="w-full bg-white p-0.5 rounded">
                <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                  <div
                    className="text-md font-semibold text-success-content cursor-pointer"
                    onClick={() => {
                      // setPartySelected("selectParty");
                      handleOrder(item, "selectAccParty");
                    }}
                  >
                    {item.Byr_nam}
                  </div>
                  <div className="text-sm font-medium text-success-content">{item.AccAddress}</div>
                  <div className="text-sm font-medium text-success-content">{item.VATNO}</div>
                </div>
              </div>
            ))}
        </div>
      );
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const user = session?.data?.user;
      const userType = user?.UserType;
      const userName = user?.name || "";

      const isManager = userType === "2";
      const requestUserName = isManager && orderData.employeeCode ? orderData.employeeSelect : userName;

      const currentDate = getCurrentDateFormatted();
      const ordersData = await listAPI.GetStockOrderMasterListJason(currentDate, requestUserName);
      const todayOrd = ordersData?.length > 0 ? ordersData : [];
      setTodayOrders(todayOrd);
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataCurrSales = async () => {
    setLoading(true);
    const currentDate = getCurrentDateFormattedToInput();
    const formattedDate = convertInputDateToSendFormat(date) === currentDate ? currentDate : convertInputDateToSendFormat(date);
    const user = session?.data?.user;
    const userName = user?.name || "";

    const data = await GetSalesRestBillingList(formattedDate, "", userName);
    const action = data[0]?.ActionType;
    if (action >= 0) {
      const JSONData1 = JSON.parse(data[0]?.JSONData1);
      setTodaySales(JSONData1);
      setTodayOrdersList(JSONData1);
      setLoading(false);
    } else {
      setTodaySales([]);
      setTodayOrdersList([]);
      setLoading(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
    fetchDataCurrSales();
  }, []);

  const fetchGetOrderDetailsByCode = async () => {
    try {
      setLoading(true);
      const currentDate = getCurrentDateFormatted();
      const orderId = formData.orderId || "0";
      const user = session?.data?.user;
      const userType = user?.UserType;
      const userName = user?.name || "";
      const userYearStr = localStorage.getItem("UserYear") || "";
      const [_, year = "", __, counter = ""] = userYearStr.split("_");

      const isManager = userType === "2";
      const requestUserName = isManager ? orderData.employeeSelect : userName;
      const requestUserCode = isManager && orderData.employeeCode ? orderData.employeeCode : userName;

      const res = await GetOrderDetailsByCode(orderId, requestUserName, currentDate, year, requestUserCode);
      const response = res[0];
      const action = response?.ActionType;
      if (action > 0) {
        const js1: RestoOrderDetailsInterface[] = JSON.parse(response.JSONData1);
        const js2: RestoBlankItemInterface[] = JSON.parse(response.JSONData2);
        let da = js1[0] as RestoOrderDetailsInterface;

        setOrderData({
          ...orderData,
          SeatNos: da.SeatNos ?? orderData.SeatNos,
          ModeOfDelivery: orderData.ModeOfDelivery,
          name: da.PartyName,
          phone: da.OrderPhoneNo,
          DelPhoneNo: da.DelPhoneNo,
          OrderAddress: da.OrderAddress,
          OrderAddress2: da.OrderAddress2,
          OrderPin: da.OrderPin,
          OrderPlace: da.OrderPlace,
          OrderCity: da.OrderCity,
          OrderDist: da.OrderDist,
          CashPay: orderData.CashPay >= "0" ? "0" : "",
          UPIPay: orderData.UPIPay >= "0" ? "0" : "",
          OnlinePay: orderData.OnlinePay >= "0" ? "0" : "",
          CardPay: orderData.CardPay >= "0" ? "0" : "",
          ChequePay: orderData.ChequePay >= "0" ? "0" : "",
          CreditPay: orderData.CreditPay >= "0" ? "0" : "",
          MOP: "Cash",
        });

        da.Counter = counter;

        if (js1.length > 0) setRestoDetails(da);
        if (js2.length > 0) {
          setRestoProductContainer(js2);
          setRestoCurrCart(js2);
        }
        if (js2.length === 0) setRestoProductContainer([]);
      } else {
        const err = response?.ErrorMessage;
        toast.warn(err);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGetOrderDetailsByCode();
  }, [formData.orderId]);

  useEffect(() => {
    if (searchQuery?.length > 0) {
      if (searchQuery?.length === 0) setSuggestion([]);
      setShowSearch(true);
      const filteredList: SalesListInterface[] = filteredOrderList?.filter((item) =>
        item?.PartyName.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSuggestion(filteredList);
    }
  }, [searchQuery, filteredOrderList]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const userDetails = localStorage.getItem("UserYear");
      if (userDetails) {
        const parts = userDetails.split("_");
        if (parts.length >= 4) {
          setYear(parts[1]);
          setUserName(parts[0]);
        }
      }
    }
  }, []);

  const handleItem = (item: SalesListInterface) => {
    setSubmitted(true);
    const tempId = Date.now().toString();
    sessionStorage.setItem(`salesData_${tempId}`, JSON.stringify(item));
    setSubmitted(false);
    // router.push(`/resto-sales/${tempId}`);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDate(inputValue);
    if (session?.data?.user?.role === "admin") {
      setSelectedUserType("");
    }
  };

  useEffect(() => {
    const filteredList = todayOrdersList?.filter((item) => item?.PartyName.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredOrderList(filteredList);
  }, [searchQuery, todayOrdersList]);

  const generateSums = (filterlist: any) => {
    let advanceSum = 0;

    filterlist?.forEach((item: any) => {
      const balance = parseFloat(item?.BILLAMOUNT);
      advanceSum += balance;
    });

    const totalSum = advanceSum;
    return totalSum.toFixed(2).toString();
  };

  useEffect(() => {
    if (filteredOrderList?.length > 0) {
      const response = generateSums(filteredOrderList);
      setTotalSum(response);
    }
  }, [filteredOrderList]);

  const PrintInvoiceByCodeAPI = async (svrCode: number) => {
    try {
      setLoading(true);
      const response = await PrintRestRetailInvoiceByCode(svrCode.toString(), year, orderData.employeeSelect);
      const action = response[0]?.ActionType;
      if (action) {
        const JSONData1 = response[0]?.JSONData1;
        const pre = process.env.NEXT_PUBLIC_WEBSERVICE_URL as string;
        const url = `${pre}${JSONData1}`;
        console.log(url);
        setPdfLink(url);
        setPdfModal(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMOP = async (id: number, which: string) => {
    const storedUserYear = localStorage.getItem("UserYear") as string;
    const parts = storedUserYear.split("_");
    const year = parts[1];

    const res = await GetRestSalesBillByCode(id.toString(), year, orderData.employeeSelect);
    const response = res[0];
    const action = response?.ActionType;
    setSvrCode(id);
    if (action > 0) {
      const js1: SalesListInterface[] = JSON.parse(response.JSONData1);
      let da = js1[0] as SalesListInterface;
      setOrderData({
        ...orderData,
        CashPay: da.CashPay > 0 ? da.CashPay.toString() : da.BillEstimateAmount.toString(),
        UPIPay: da.UPIPay > 0 ? da.UPIPay.toString() : "",
        OnlinePay: da.OnlinePay > 0 ? da.OnlinePay.toString() : "",
        CardPay: da.CardPay > 0 ? da.CardPay.toString() : "",
        ChequePay: da.ChequePay > 0 ? da.ChequePay.toString() : "",
        CreditPay: da.CreditPay > 0 ? da.CreditPay.toString() : "",
        ModeofTax: da.ModeofTax,
        MOTIndex: da.ModeofTax === "Estimate" ? 0 : 1,
        ReqSvrCode: da.SvrCode,
        PartyID: da.partycode,
        PartyName: da.PartyName,
        ReqStatusType: da.PaymentStatus === "Credit" ? "Credit" : "Paid",
      });
      setSaleModal(false);
      setMopData(da);
      setMopModal(true);
    } else {
      const err = response?.ErrorMessage;
      toast.warn(err);
    }
    // setMopModal(true);
  };

  useEffect(() => {
    const discount = parseFloat(mopData?.disper || "0") || 0;
    const originalAmount = mopData?.BillEstimateAmount || 0;

    if (discount > 0 && mopData?.BILLAMOUNT !== originalAmount - discount) {
      setMopData((prev) => ({
        ...prev,
        BILLAMOUNT: parseFloat((originalAmount - discount).toFixed(2)),
      }));
    } else if (discount === 0 && mopData?.BILLAMOUNT !== originalAmount) {
      setMopData((prev) => ({
        ...prev,
        BILLAMOUNT: originalAmount,
      }));
    }
  }, [mopData?.disper, mopData?.BLLTaxableAmt, mopData?.BillEstimateAmount]);

  const handleMOPSubmit = async () => {
    try {
      setLoading(true);

      const fullData: SalesListInterface = { ...mopData } as SalesListInterface;

      // Map payments from orderData
      const cash = Number(orderData.CashPay) || 0;
      const card = Number(orderData.CardPay) || 0;
      const upi = Number(orderData.UPIPay) || 0;
      const credit = Number(orderData.CreditPay) || 0;
      const cheque = Number(orderData.ChequePay) || 0;
      const online = Number(orderData.OnlinePay) || 0;

      const totalPaid = cash + card + upi + credit + cheque + online;
      const totalBill = Number(mopData?.BILLAMOUNT) || 0;

      // ✅ Validate total payment
      if (totalPaid < totalBill) {
        toast.warn("Insufficient payment: total is less than the bill amount.");
        return;
      } else if (totalPaid > totalBill) {
        toast.warn("Overpayment detected: total exceeds the bill amount.");
        return;
      }

      // ✅ Validate credit party selection
      if (credit > 0 && (orderData.PartyName.trim() === "" || orderData.PartyID === 0)) {
        toast.warn("Please select a party for credit payment.");
        return;
      }

      // ✅ Validate bank selection if amount is paid via any bank method
      type BankPaymentKey = "UPIPay" | "OnlinePay" | "CardPay" | "ChequePay";
      const bankPaymentMethods: BankPaymentKey[] = ["UPIPay", "OnlinePay", "CardPay", "ChequePay"];

      for (const method of bankPaymentMethods) {
        const amount = Number(orderData[method] || 0);
        const accKey = `${method}Acc` as keyof typeof orderData;
        const accValue = orderData[accKey];

        if (amount > 0 && (!accValue || accValue === "")) {
          toast.warn(`Please select a bank for ${method.replace("Pay", "")} payment.`);
          return;
        }
      }

      // Continue processing after validation
      fullData.ModeofTax = orderData.ModeofTax ?? fullData.ModeofTax;
      fullData.MOTIndex = orderData.MOTIndex ?? fullData.MOTIndex;
      fullData.CashPay = cash;
      fullData.CardPay = card;
      fullData.UPIPay = upi;
      fullData.CreditPay = credit;
      fullData.ChequePay = cheque;
      fullData.OnlinePay = online;

      if (credit > 0) {
        fullData.partycode = orderData.PartyID ?? fullData.partycode;
        fullData.PartyName = orderData.PartyName ?? fullData.PartyName;
      }

      const response = await CalculateAndUpdateResBill(fullData);
      const result = response?.[0];

      if (result?.ActionType > 0) {
        const updatePayResponse = await UpdateBillPaidStatus(fullData.SvrCode, orderData.ReqStatusType);
        const updateResult = updatePayResponse?.[0];

        if (updateResult?.ActionType <= 0) {
          toast.warn(updateResult?.ErrorMessage || "Failed to update payment status.");
          return;
        }

        toast.success("Payment updated");
        await removeAll();
        setSaveModal(true);
        setFormData({ orderId: "0" });
        fetchDataCurrSales();
        setMopModal(false);

        if (result?.JSONData1) {
          toast.success(result.JSONData1);
        }
      } else {
        toast.warn(result?.ErrorMessage || "Unknown error occurred");
      }
    } catch (error) {
      console.error("handleMOPSubmit error:", error);
      toast.error("Something went wrong during payment processing.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintOrder = async (Id: string) => {
    try {
      setLoading(true);
      const response = await PrintRestOrderByCodeJson(Id);
      const action = response[0]?.ActionType;
      if (action > 0) {
        const JSONData1 = response[0]?.JSONData1;
        const url = `${process.env.NEXT_PUBLIC_WEBSERVICE_URL}${JSONData1}`;
        setPdfLink(url);
        setPdfModal(true);
      } else {
        const ErrorMessage = response[0]?.ErrorMessage;
        toast.error(ErrorMessage);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalesView = async (id: string) => {
    try {
      const storedUserYear = localStorage.getItem("UserYear") as string;
      const parts = storedUserYear.split("_");
      const year = parts[1];
      const res = await GetRestSalesBillByCode(id.toString(), year, orderData.employeeSelect);
      const response = res[0];
      const action = response?.ActionType;
      if (action > 0) {
        const js1: SalesListInterface[] = JSON.parse(response.JSONData1);
        let da = js1[0] as SalesListInterface;

        setCheckoutData(da);
        setSalesView(true);
        setSaleModal(false);
      } else {
        const err = response?.ErrorMessage;
        toast.warn(err);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleMOPRefrsh = async () => {
    let fullData: SalesListInterface = { ...mopData } as SalesListInterface;

    fullData.ModeofTax = orderData.ModeofTax ?? fullData.ModeofTax;
    fullData.MOTIndex = orderData.MOTIndex ?? fullData.MOTIndex;

    const response = await CalculateAndUpdateResBill(fullData);
    const action = response[0]?.ActionType;

    if (action > 0) {
      const storedUserYear = localStorage.getItem("UserYear") as string;
      const parts = storedUserYear.split("_");
      const year = parts[1];
      const res = await GetRestSalesBillByCode(orderData.ReqSvrCode.toString(), year, orderData.employeeSelect);
      const response = res[0];
      const action = response?.ActionType;
      if (action > 0) {
        const js1: SalesListInterface[] = JSON.parse(response.JSONData1);
        let da = js1[0] as SalesListInterface;

        setMopData(da);
        setOrderData({
          ...orderData,
          CashPay: da.CashPay > 0 ? da.CashPay.toString() : da.BillEstimateAmount.toString(),
          UPIPay: da.UPIPay > 0 ? da.UPIPay.toString() : "",
          OnlinePay: da.OnlinePay > 0 ? da.OnlinePay.toString() : "",
          CardPay: da.CardPay > 0 ? da.CardPay.toString() : "",
          ChequePay: da.ChequePay > 0 ? da.ChequePay.toString() : "",
          CreditPay: da.CreditPay > 0 ? da.CreditPay.toString() : "",
          ModeofTax: da.ModeofTax,
          MOTIndex: da.ModeofTax === "Estimate" ? 0 : 1,
          ReqSvrCode: da.SvrCode,
          ReqStatusType: da.PaymentStatus,
        });
      }
      const JSONData1 = response[0]?.JSONData1;
      toast.success(JSONData1);
      fetchDashboardData();
      fetchDataCurrSales();
    } else {
      const err = response[0]?.ErrorMessage;
      toast.warn(err);
    }
  };

  const handleAddParty = async () => {
    try {
      const response = await GetPartyMasterByCode("0");
      const action = response[0]?.ActionType;
      if (action > 0) {
        const JSONData1 = JSON.parse(response[0]?.JSONData1 || "[]");
        const data = JSONData1[0] as AccountLedgerInterface;
        data.GROUPS = "Sundry Debtors";
        setAddParty(data);
        setAddPartyModal(true);
      } else {
        const ErrorMessage = response[0]?.ErrorMessage;
        toast.error(ErrorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitParty = async () => {
    try {
      const JSONData = JSON.stringify([addParty]);
      const response = await UpdateAccountBook(JSONData);
      const action = response[0]?.ActionType;
      console.log(response, "UpdateAccountBook response");
      if (action > 0) {
        let JSONData1Remarks = response[0]?.JSONData1Remarks;
        toast.success(JSONData1Remarks);
        setOrderData({ ...orderData, PartyName: addParty.Byr_nam || "", PartyID: 0 });
        setAddParty({});
        setAddPartyModal(false);
      } else {
        let ErrorMessage = response[0]?.ErrorMessage;
        toast.error(ErrorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleOrderView = async (id: number) => {
    const currentDate = getCurrentDateFormatted();
    const user = session?.data?.user;
    const userType = user?.UserType;
    const userName = user?.name || "";
    const userYearStr = localStorage.getItem("UserYear") || "";
    const [_, year = "", __, counter = ""] = userYearStr.split("_");

    const isManager = userType === "2";
    const requestUserName = isManager ? orderData.employeeSelect : userName;
    const requestUserCode = isManager && orderData.employeeCode ? orderData.employeeCode : userName;

    const res = await GetOrderDetailsByCode(id.toString(), requestUserName, currentDate, year, requestUserCode);
    const response = res[0];
    const action = response?.ActionType;
    if (action > 0) {
      const js1: RestoOrderDetailsInterface[] = JSON.parse(response.JSONData1);
      const js2: RestoBlankItemInterface[] = JSON.parse(response.JSONData2);
      let da = js1[0] as RestoOrderDetailsInterface;

      if (js1.length > 0) setRestoOrderView(da);
      if (js2.length > 0) setRestoCurrCartView(js2);
      setPopupView(true);
      setOrderModal(false);
    } else {
      const err = response?.ErrorMessage;
      toast.warn(err);
    }
  };

  return (
    <>
      <div className=" bg-slate-100 min-h-[91vh] mt-24 sm:mt-16 md:mt-20 lg:mt-0 shadow-md flex justify-center">
        {loading && <Spinner />}

        <Dialog open={saveModal} as="div" className="relative z-50 focus:outline-none" onClose={setSaveModal}>
          <div className="fixed inset-0 z-50 w-screen bg-black/15 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <DialogPanel
                transition
                className="w-full md:w-fit md:max-w-3xl lg:max-w-5xl max-w-full rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
              >
                <>
                  <DialogTitle as="h3" className="text-base/7 font-medium text-black">
                    Print Option
                  </DialogTitle>
                  <div className="py-4">
                    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
                      <div className="grid grid-cols-1">
                        <div className="flex justify-center items-center">
                          <div className="pro-detail w-full lg:pl-8 xl:pl-16 max-lg:mx-auto max-lg:mt-8">
                            <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-2">
                              <div className="p-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    PrintInvoiceByCodeAPI(svrCode);
                                  }}
                                  className="px-3 py-2 rounded-md bg-green-700 text-white font-medium"
                                >
                                  Print
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              </DialogPanel>
            </div>
          </div>
        </Dialog>

        {saleModal && (
          <>
            <CustomFunctionalModal close={setSaleModal} title="Current Sales">
              <SaleList
                handleMOP={handleMOP}
                setPrintInvoiceId={setPrintInvoiceId}
                data={todaySales}
                close={setSaleModal}
                setFormData={setFormData}
                handleRefresh={fetchDataCurrSales}
                handleView={handleSalesView}
              />
            </CustomFunctionalModal>
          </>
        )}

        {orderModal && (
          <>
            <CustomFunctionalModal close={setOrderModal} title="Current Orders">
              <OrderList
                handleMOP={handleMOP}
                data={todayOrders}
                close={setOrderModal}
                handleView={handleOrderView}
                setFormData={setFormData}
                handleRefresh={fetchDashboardData}
                handlePrintOrder={handlePrintOrder}
              />
            </CustomFunctionalModal>
          </>
        )}

        {pdfModal && (
          <CustomFunctionalModal close={setPdfModal} title="Print Date Wise Sales Report">
            <div className="min-w-96 md:min-w-[800px] w-full">
              <PdfViewer url={pdfLink} />
            </div>
          </CustomFunctionalModal>
        )}

        {pdfModal2 && (
          <CustomFunctionalModal close={setPdfModal2} title="Print Date Wise Sales Report">
            <div className="min-w-96 md:min-w-[800px] w-full">
              <PdfViewer url={pdfLink2} />
            </div>
          </CustomFunctionalModal>
        )}

        <div className="w-full md:p-6">
          <div className="bg-slate-100 shadow-md flex-col flex items-start justify-between mb-2 p-2 rounded-lg">
            <div className="flex w-full justify-between items-center">
              <BackButton />
              {session?.data?.user.role === "admin" ? (
                <h3 className="md:text-3xl text-xl font-semibold">All Staff</h3>
              ) : (
                <h3 className="md:text-3xl text-xl font-semibold">{session?.data?.user?.name}</h3>
              )}
            </div>
            <div className="flex w-full justify-between flex-wrap items-center my-1 gap-2">
              <div className="flex gap-2 justify-between items-center flex-wrap">
                {session.data?.user.role === "admin" ? (
                  <>
                    <div className="flex justify-start items-center">
                      <label className="text-warning-content me-2 text-center md:block hidden whitespace-nowrap basis-1/5 text-sm font-semibold">
                        Select Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={handleDateChange}
                        className="shadow appearance-none border input-info text-sm rounded w-fit py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex justify-start items-center">
                    <label className="text-warning-content me-2 text-center md:block hidden whitespace-nowrap basis-1/5 text-sm font-semibold">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={handleDateChange}
                      className="shadow appearance-none border input-info text-sm rounded w-fit py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                    />
                  </div>
                )}
                <button
                  onClick={fetchDataCurrSales}
                  className="btn md:block hidden btn-primary md:text-base h-fit sm:text-sm text-xs btn-sm md:btn-md text-white font-semibold md:font-bold p-2 md:px-4  rounded"
                >
                  Filter
                </button>
                <div
                  onClick={() => setSaleModal(true)}
                  className="font-montserrat md:flex hidden gap-2 items-center font-medium text-sm bg-white px-2 py-1 rounded shadow-sm border border-gray-300 cursor-pointer"
                >
                  <Image src={saleIcon} height={200} width={200} alt="order icon" className="size-8 z-10" />
                  Sales
                </div>
                <div
                  onClick={() => setOrderModal(true)}
                  className="font-montserrat md:flex hidden gap-2 items-center font-medium text-sm bg-white px-2 py-1 rounded shadow-sm border border-gray-300 cursor-pointer"
                >
                  <Image src={orderIcon} height={200} width={200} alt="order icon" className="size-8 z-10" />
                  Order
                </div>
                <div
                  onClick={() => {
                    router.push("/instant-bill");
                  }}
                  className="font-montserrat md:flex hidden gap-2 items-center font-medium text-sm bg-white px-2 py-1 rounded shadow-sm border border-gray-300 cursor-pointer"
                >
                  <Image src={billCounter} height={200} width={200} alt="order icon" className="size-8 z-10" />
                </div>
              </div>
              <div className="flex gap-1">
                <div
                  onClick={() => setSaleModal(true)}
                  className="font-montserrat md:hidden flex gap-2 items-center font-medium text-xs bg-white px-2 py-1 rounded shadow-sm border border-gray-300 cursor-pointer"
                >
                  <Image src={saleIcon} height={200} width={200} alt="order icon" className="size-8 z-10" />
                  Sales
                </div>
                <div
                  onClick={() => setOrderModal(true)}
                  className="font-montserrat md:hidden flex gap-2 items-center font-medium text-xs bg-white px-2 py-1 rounded shadow-sm border border-gray-300 cursor-pointer"
                >
                  <Image src={orderIcon} height={200} width={200} alt="order icon" className="size-8 z-10" />
                  Order
                </div>
                <div
                  onClick={() => {
                    router.push("/instant-bill");
                  }}
                  className="font-montserrat md:hidden flex gap-2 items-center font-medium text-xs bg-white px-2 py-1 rounded shadow-sm border border-gray-300 cursor-pointer"
                >
                  <Image src={billCounter} height={200} width={200} alt="order icon" className="size-8 z-10" />
                </div>
                <button
                  onClick={fetchDataCurrSales}
                  className="btn md:hidden block btn-primary md:text-base h-fit sm:text-sm text-xs btn-sm md:btn-md text-white font-semibold md:font-bold p-2 md:px-4  rounded"
                >
                  Filter
                </button>
              </div>
            </div>
          </div>
          <div className="w-full flex gap-2">
            <div className="bg-slate-100 shadow-md w-full flex items-center gap-2 justify-between mb-4 p-2 rounded-lg">
              <div className="flex justify-start relative basis-1/2 items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onClick={() => setShowSearch(!showSearch)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search here"
                  className="shadow appearance-none border input-info rounded w-full py-2 px-3  leading-tight"
                />
                <div className="absolute top-10 max-h-40 h-auto z-40 overflow-auto left-0 mx-auto">
                  {showSearch &&
                    suggestion.length > 0 &&
                    suggestion.map((item, index) => (
                      <div key={index} className="w-full bg-white p-0.5 rounded">
                        <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                          <div className="text-md font-semibold text-success-content cursor-pointer" onClick={() => handleItem(item)}>
                            {item.PartyName}
                          </div>
                          <div className="text-sm font-medium text-success-content">{item.PartyName}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="flex justify-end basis-1/2 w-full items-center">
                <span className="w-fit font-medium text-base border-black p-0.5 border border-solid bg-[#f0f0f0]">
                  {filteredOrderList?.length} / {totalSum}
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:hidden mt-6 grid-cols-1 gap-6 px-2 sm:grid-cols-2 max-h-[32rem] overflow-y-auto lg:grid-cols-1">
            {filteredOrderList &&
              filteredOrderList?.map((item, ind) => (
                <div
                  key={ind}
                  className="bg-gradient-to-tr from-indigo-400 via-sky-300 to-blue-200 shadow-md rounded-lg overflow-hidden"
                  style={{
                    boxShadow: "5px 5px 0px 2px rgba(173, 216, 230, 0.9)",
                  }}
                >
                  <div className="p-4">
                    <h4 className="text-lg font-semibold mb-2">Bill No: {item.billno}</h4>
                    <h4 className="text-lg font-semibold mb-2">Order No: {item.OrderNO}</h4>
                    <p className="text-warning-content mb-2">Seat: {item.SeatNos}</p>
                    <p className="text-warning-content mb-2">Name: {item.PartyName ?? "-"}</p>
                    <p className=" text-warning-content mb-2">Date: {item.BillDate.split("T")[0]}</p>
                    <p className=" text-warning-content mb-2">Amount: {item.BILLAMOUNT}</p>
                    {item.ModeofTax !== "Estimate" && <p className=" text-warning-content mb-2">Tax: {item.ModeofTax}</p>}
                    <p className=" text-warning-content mb-2">Status: {item.PaymentStatus}</p>
                    <p className="text-warning-content mb-2">
                      Payment:
                      {item.PaymentStatus === "Pending" ? (
                        <button
                          className="px-3 py-1 bg-blue-700 text-white font-montserrat font-normal rounded-md shadow-md"
                          onClick={() => {
                            handleMOP(item.SvrCode, "sale");
                          }}
                        >
                          Pay
                        </button>
                      ) : (
                        "Paid"
                      )}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <button
                        className="bg-blue-500 text-black rounded px-3 py-2 mb-2"
                        type="button"
                        onClick={() => {
                          setSvrCode(item.SvrCode);
                          setSaveModal(true);
                        }}
                      >
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="bg-slate-100 w-full hidden md:block max-h-96  shadow overflow-auto  sm:rounded-lg">
            <table className=" divide-gray-200 table overflow-x-visible">
              <thead className="bg-sky-500 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Bill No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Order No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">CMPRefNo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Seat No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Tax</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-warning-content uppercase tracking-wider">Print</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrderList &&
                  filteredOrderList?.map((item, ind) => {
                    return (
                      <tr key={ind}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.billno}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.OrderNO}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.CMPRefNo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.SeatNos}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.PartyName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.BillDate.split("T")[0]}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.BILLAMOUNT}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.ModeofTax !== "Estimate" && <div className="text-sm text-gray-900">{item.ModeofTax}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.PaymentStatus}</div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.PaymentStatus === "Pending" ? (
                            <button
                              className="px-4 py-2 bg-blue-500 rounded-md"
                              type="button"
                              onClick={() => {
                                handleMOP(item.SvrCode, "sale");
                              }}
                            >
                              Pay
                            </button>
                          ) : (
                            "Paid"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex gap-1">
                          <button
                            className="px-4 py-2 bg-blue-500 rounded-md"
                            type="button"
                            onClick={() => {
                              setSvrCode(item.SvrCode);
                              setSaveModal(true);
                            }}
                          >
                            Print
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {PopupView && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white w-[95vw] max-w-4xl rounded-xl p-4 shadow-lg max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold">Order #{restoOrderView?.OrderNo ?? "New"}</h3>
              <h3 className="text-xl font-semibold">Table #{restoOrderView?.SeatNos ?? ""}</h3>
            </div>

            {/* Order Table */}
            <div className="border rounded overflow-auto max-h-[300px]">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 text-left">
                  <tr className="border-b">
                    <th className="px-2 py-1 w-[5%]">#</th>
                    <th className="px-2 py-1">Item</th>
                    <th className="px-2 py-1 text-right">Rate</th>
                    <th className="px-2 py-1 text-center">Qty</th>
                    <th className="px-2 py-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {restoCurrCartView?.map((item, idx) => {
                    if (item.OrderQty <= 0) return null;
                    return (
                      <tr key={idx} className="border-b">
                        <td className="px-2 py-1">{idx + 1}</td>
                        <td className="px-2 py-1">{item.itm_NAM}</td>
                        <td className="px-2 py-1 text-right">₹{item.OrderRate.toFixed(2)}</td>
                        <td className="px-2 py-1 text-center">{item.OrderQty}</td>
                        <td className="px-2 py-1 text-right">₹{(item.OrderQty * item.OrderRate).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bill Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 font-montserrat font-medium">
              <div className="col-span-1">GST: {totalGstPer}%</div>
              <div className="col-span-1 grid grid-rows-3 font-normal">
                <p>CGST: {totaltCgstPer}%</p>
                <p>SGST: {totalSgstPer}%</p>
                <p>IGST: {totalIgstPer}%</p>
              </div>
              <div className="col-span-1">Gross Total: {restoOrderView.GrossAmount}</div>
              <div className="col-span-1">
                GST Amount:
                {(restoOrderView.CGSTAmt ?? 0) + (restoOrderView.SGSTAmt ?? 0) + (restoOrderView.IGSTAmt ?? 0)}
              </div>
              <div className="col-span-2">
                Round Off:
                {(
                  (restoOrderView.NetAmount ?? 0) -
                  ((restoOrderView.GrossAmount ?? 0) +
                    ((restoOrderView.CGSTAmt ?? 0) + (restoOrderView.SGSTAmt ?? 0) + (restoOrderView.IGSTAmt ?? 0)) +
                    (restoOrderView.CessAmt ?? 0))
                ).toFixed(2)}
              </div>
              <div className="col-span-2 font-semibold text-lg">Total: {restoOrderView.NetAmount}</div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6 font-montserrat font-normal">
              <button
                type="button"
                onClick={() => {
                  setPopupView(false);
                  setRestoCurrCartView([]);
                  setRestoOrderView({});
                  setOrderModal(true);
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {mopModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl p-6 max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-semibold text-center mb-1">PAYMENT</h2>
            <p className="text-center font-medium mb-2">Amount : ₹{mopData?.BillEstimateAmount?.toFixed(2) ?? "0.00"}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 sm:grid-cols-3 gap-2 text-sm border p-1 rounded my-2">
              <div>Gross Total: ₹{mopData?.BLLTaxableAmt ?? "0.00"}</div>
              <div>GST Amount: ₹{mopData?.BLLGSTAmt ?? "0.00"}</div>
              <div>Round Off: ₹{mopData?.ROFAMT ?? "0.00"}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              {/* ✅ Main 6 Payment Options First */}
              {[...primaryOptions, ...(showMorePaymentOptions ? moreOptions : [])].map(({ label, key }) => {
                const isSelected = !!orderData[key as keyof typeof orderData];
                const isCredit = key === "CreditPay";

                return (
                  <div key={label} className="flex flex-col gap-1 col-span-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setOrderData((prev) => ({
                            ...prev,
                            [key]: isChecked ? "0" : "",
                            ReqStatusType: isCredit && !isChecked && prev.ReqStatusType === "Credit" ? "Paid" : prev.ReqStatusType,
                          }));
                        }}
                        className="accent-green-600"
                      />
                      <span>{label}</span>
                    </label>

                    {isSelected && (
                      <input
                        type="number"
                        placeholder={`Enter ${label} Amount`}
                        value={orderData[key as keyof typeof orderData]}
                        onChange={(e) => {
                          const value = e.target.value;
                          const isCreditAmount = key === "CreditPay" && parseFloat(value) > 0;
                          setOrderData((prev) => ({
                            ...prev,
                            [key]: value,
                            ReqStatusType: isCreditAmount
                              ? "Credit"
                              : key === "CreditPay" && prev.ReqStatusType === "Credit"
                              ? "Paid"
                              : prev.ReqStatusType,
                          }));
                        }}
                        className="border rounded px-2 py-1 text-sm"
                      />
                    )}
                  </div>
                );
              })}
              {["UPIPay", "OnlinePay", "CardPay", "ChequePay"].map((key) => {
                if (!orderData[key as keyof OrderDataInterface]) return null;

                return (
                  <div key={key} className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Select Bank for {key.replace("Pay", "")}</label>
                    <select
                      value={orderData[`${key}Acc` as keyof typeof orderData] || ""}
                      onChange={(e) => {
                        const selectedBank = e.target.value;
                        const selectedBankName = bankList.find((bank) => bank.AccAutoID.toString() === e.target.value);

                        setOrderData((prev) => ({
                          ...prev,
                          [`${key}Acc`]: selectedBank,
                          PartyName: selectedBankName?.Byr_nam ?? "",
                          PartyID: selectedBankName?.AccAutoID ?? 0,
                        }));
                      }}
                      className="border rounded px-2 py-1 text-sm w-full"
                    >
                      <option value="">Select Bank</option>
                      {bankList.map((bank) => (
                        <option key={bank.AccAutoID} value={bank.AccAutoID}>
                          {bank.Byr_nam}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
              {orderData.CreditPay && (
                <div className="col-span-2 grid grid-cols-2 gap-2 mt-2">
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={searchQueryAcc}
                      placeholder="party name"
                      onChange={(e) => {
                        setSearchQueryAcc(e.target.value);
                        setOrderData({
                          ...orderData,
                          PartyID: 0,
                          PartyName: e.target.value,
                        });
                        handlePartyItemChange2(e);
                      }}
                      className="border rounded px-2 py-1 text-sm w-full"
                    />
                    {showSearchItems2()}
                  </div>
                  <input
                    type="text"
                    value={orderData.PartyAddress}
                    className="border rounded px-2 py-1 text-sm"
                    placeholder="party address"
                  />
                  <input value={orderData.PartyPhone} type="text" placeholder="party phone" className="border rounded px-2 py-1 text-sm" />
                  <div className="flex justify-center items-center">
                    <button
                      className="flex px-2 py-1 text-xs font-montserrat bg-yellow-300 text-white font-medium rounded cursor-pointer tracking-wider"
                      type="button"
                      onClick={handleAddParty}
                    >
                      ADD PARTY
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-1 col-span-1"></div>

              <div className="mt-1 col-span-1">
                <button
                  type="button"
                  onClick={() => setShowMorePaymentOptions((prev) => !prev)}
                  className="text-blue-600 underline text-sm"
                >
                  {showMorePaymentOptions ? "Hide Extra Options" : "More Payment Methods"}
                </button>
              </div>

              <div className=" col-span-2 bg-gray-200 rounded-md shadow-lg">
                {/* Accordion Header */}
                <div
                  className="flex items-center justify-between p-1 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                >
                  <h3 className="font-medium text-gray-700">GST</h3>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isAccordionOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Accordion Content */}
                {isAccordionOpen && (
                  <div className="mt-2 p-1 border rounded flex justify-between bg-gray-200 items-center">
                    <div className="flex items-center justify-center gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          checked={orderData.MOTIndex === 1}
                          onChange={() => setOrderData({ ...orderData, MOTIndex: 1, ModeofTax: "GST" })}
                          type="checkbox"
                          className="accent-green-600"
                        />
                        <span>GST</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          checked={orderData.MOTIndex === 0}
                          onChange={() => setOrderData({ ...orderData, MOTIndex: 0, ModeofTax: "Estimate" })}
                          type="checkbox"
                          className="accent-green-600"
                        />
                        <span>KOT</span>
                      </label>
                    </div>
                    <div>
                      <button
                        onClick={handleMOPRefrsh}
                        className="text-sm px-2 py-1 bg-indigo-500 text-white font-montserrat font-normal rounded"
                        type="button"
                      >
                        refresh
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="font-montserrat font-medium col-span-2">
                <h4 className="text-md font-semibold mb-1">Payment Update</h4>

                <div className="flex gap-1">
                  <label className="flex items-center gap-2">
                    <input
                      checked={orderData.ReqStatusType === "Paid"}
                      onChange={() => {
                        setOrderData({
                          ...orderData,
                          ReqStatusType: "Paid",
                        });
                      }}
                      type="checkbox"
                      className="accent-green-600"
                    />
                    <span>Paid</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      checked={orderData.ReqStatusType === "Pending"}
                      onChange={() => {
                        setOrderData({
                          ...orderData,
                          ReqStatusType: "Pending",
                        });
                      }}
                      type="checkbox"
                      className="accent-green-600"
                    />
                    <span>Pending</span>
                  </label>
                  {(orderData.ReqStatusType === "Credit" || orderData.CreditPay > "0") && (
                    <label className="flex items-center gap-2">
                      <input
                        checked={orderData.ReqStatusType === "Credit"}
                        onChange={() => {
                          setOrderData({
                            ...orderData,
                            ReqStatusType: "Credit",
                          });
                        }}
                        type="checkbox"
                        className="accent-green-600"
                      />
                      <span>Credit</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="border-t pt-1 text-sm space-y-2 col-span-2">
                <div className="flex justify-between font-montserrat font-medium text-sm">
                  <label>Discount (%):</label>
                  <input
                    value={mopData?.disper || ""}
                    onChange={(e) => {
                      setMopData((prev) => ({
                        ...prev,
                        disper: e.target.value,
                      }));
                    }}
                    type="number"
                    className="border px-2 py-1 w-24 text-right"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex justify-between font-montserrat font-semibold text-base">
                  <label>Total Received:</label>
                  <span>
                    ₹
                    {["CashPay", "UPIPay", "OnlinePay", "CardPay", "ChequePay", "CreditPay"]
                      .map((k) => parseFloat((orderData?.[k as keyof typeof orderData] as string) || "0"))
                      .reduce((a, b) => a + b, 0)
                      .toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between font-montserrat font-semibold text-base">
                  <label>Change Return:</label>
                  <span>
                    ₹
                    {(
                      ["CashPay", "UPIPay", "OnlinePay", "CardPay", "ChequePay", "CreditPay"]
                        .map((k) => parseFloat((orderData?.[k as keyof typeof orderData] as string) || "0"))
                        .reduce((a, b) => a + b, 0) - (mopData?.BILLAMOUNT || 0)
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between font-montserrat font-semibold text-base">
                  <label>Total Amount:</label>
                  <span>₹{mopData?.BILLAMOUNT?.toFixed(2) ?? "0.00"}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => {
                  setMopModal(false);
                  setShowMorePaymentOptions(false);
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleMOPSubmit();
                  setShowMorePaymentOptions(false);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {salesView && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white w-[90vw] max-w-full rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4">Checkout</h3>
            {(checkoutData?.SalesItems ?? []).length > 0 && (
              <>
                {/* Scrollable table with items */}
                <div className="border rounded-t-lg max-h-[40vh] overflow-auto border-gray-300">
                  <table className="min-w-full rounded-xl">
                    <thead>
                      <tr className="bg-white sticky top-0 z-10">
                        {["Item", "Qty", "Rate", "Discount", "Grs Amt", "GST Per", "GST Amount", "Net Amount"].map((item, ind) => (
                          <th key={ind} scope="col" className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize">
                            {item}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y bg-slate-100 divide-gray-300">
                      {checkoutData?.SalesItems?.map((item, indx) => {
                        if (item.SvrEntid > 0 && (item.Qty === 0 || item.Rate === 0)) {
                          return null;
                        }

                        return (
                          <tr key={indx} className="bg-gray-200">
                            <td className="p-5 text-sm font-medium text-gray-900">{item.itm_NAM}</td>
                            <td className="p-5 text-sm font-medium text-gray-900">{item.Qty}</td>
                            <td className="p-5 text-sm font-medium text-gray-900">{item?.ItemMRP}</td>
                            <td className="p-5 text-sm font-medium text-gray-900">{item.Disper}</td>
                            <td className="p-5 text-sm font-medium text-gray-900">{item?.Grsamt}</td>
                            <td className="p-5 text-sm font-medium text-gray-900">{item?.TrnGSTRate}%</td>
                            <td className="p-5 text-sm font-medium text-gray-900">{item?.TrnGSTAmt}</td>
                            <td className="p-5 text-sm font-medium text-gray-900">{item?.NetNVAT}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 font-montserrat font-medium">
              <div className="col-span-1">Gross Total: {checkoutData!.BLLTaxableAmt}</div>
              <div className="col-span-1">
                GST Amount:
                {checkoutData!.BLLGSTAmt ?? 0}
              </div>
              <div className="col-span-1">
                Round Off:
                {checkoutData!.ROFAMT ?? 0}
              </div>
              <div className="col-span-1 font-semibold text-lg">Total: {checkoutData!.BILLAMOUNT}</div>
            </div>

            <div className="flex justify-end gap-3 flex-row">
              {checkoutData?.PaymentStatus === "Pending" && (
                <button
                  onClick={() => {
                    const payload = {
                      svrCode: checkoutData!.SvrCode,
                      orderID: 0,
                    };
                    sessionStorage.setItem("checkoutData", JSON.stringify(payload));
                    router.push("/instant-bill");
                  }}
                  type="button"
                  className="px-4 py-1 rounded-md bg-violet-600 text-white"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => {
                  setSalesView(false);
                  setSaleModal(true);
                }}
                className="px-4 py-1 rounded-md bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmPopupOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white w-[95vw] max-w-4xl rounded-xl p-4 shadow-lg max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold">Order #{restoDetails?.OrderNo ?? "New"}</h3>
              <h3 className="text-xl font-semibold">Table #{restoDetails?.SeatNos ?? ""}</h3>
            </div>

            {/* Order Table */}
            <div className="border rounded overflow-auto max-h-[300px]">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 text-left">
                  <tr className="border-b">
                    <th className="px-2 py-1 w-[5%]">#</th>
                    <th className="px-2 py-1">Item</th>
                    <th className="px-2 py-1 text-right">Rate</th>
                    <th className="px-2 py-1 text-center">Qty</th>
                    <th className="px-2 py-1 text-right">Amount</th>
                    <th className="px-2 py-1 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {restoCurrCart?.map((item, idx) => {
                    if (item.OrderQty <= 0) return null;
                    return (
                      <tr key={idx} className="border-b">
                        <td className="px-2 py-1">{idx + 1}</td>
                        <td className="px-2 py-1">{item.itm_NAM}</td>
                        <td className="px-2 py-1 text-right">₹{item.OrderRate.toFixed(2)}</td>
                        <td className="px-2 py-1 text-center"></td>
                        <td className="px-2 py-1 text-right">₹{(item.OrderQty * item.OrderRate).toFixed(2)}</td>
                        <td className="px-2 py-1 text-center"></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6 font-montserrat font-normal">
              <button
                type="button"
                onClick={() => {
                  setConfirmPopupOpen(false);
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {addPartyModal && (
        <div className="fixed inset-0 z-[52] bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg w-full max-w-4xl p-6 max-h-[80vh] overflow-auto relative">
            <h2 className="text-xl font-semibold text-center mb-4">Party Master</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label>Code</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  value={addParty?.Byr_Cd}
                  onChange={(e) => setAddParty({ ...(addParty as AccountLedgerInterface), Byr_Cd: e.target.value })}
                />
              </div>

              <div>
                <label>Account Head</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  value={addParty?.Byr_nam}
                  onChange={(e) =>
                    setAddParty((prevData) => ({
                      ...(prevData as AccountLedgerInterface),
                      Byr_nam: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label>Group Name</label>
                <select
                  value={addParty?.GROUPS}
                  onChange={(e) => setAddParty({ ...addParty, GROUPS: e.target.value })}
                  className="border rounded px-2 py-1 w-full text-sm"
                >
                  <option value="">Select Group</option>
                  <option value="Sundry Debtors">Sundry Debtors</option>
                  <option value="Sundry Creditors">Sundry Creditors</option>
                </select>
              </div>
              <div className="lg:flex mt-3 items-center">
                <label>Opening</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full text-sm ms-2"
                  value={addParty?.OPCRBLC}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    let val: number = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      setAddParty({ ...(addParty as AccountLedgerInterface), OPCRBLC: val });
                    }
                  }}
                />
                <label className="w-full lg:flex items-center">
                  <input
                    type="checkbox"
                    className="ml-2 size-4"
                    checked={isCrChecked}
                    onChange={(e) => {
                      setIsCrChecked(!isCrChecked);
                      let checkVal = e.target.checked;
                      setAddParty((prevData) => {
                        if (!prevData) return prevData;
                        const newOPCRBLC = checkVal ? prevData.OPCRBLC : prevData.OPDRBLC;
                        const newOPDRBLC = checkVal ? prevData.OPDRBLC : prevData.OPCRBLC;
                        return {
                          ...prevData,
                          OPCRBLC: newOPCRBLC,
                          OPDRBLC: newOPDRBLC,
                        };
                      });
                    }}
                  />
                  Cr
                </label>
              </div>

              <div>
                <label>Address 1</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  value={addParty?.AccAddress}
                  onChange={(e) =>
                    setAddParty((prevData) => ({
                      ...(prevData as AccountLedgerInterface),
                      AccAddress: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label>GST No</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  value={addParty?.VATNO}
                  onChange={(e) =>
                    setAddParty((prevData) => ({
                      ...(prevData as AccountLedgerInterface),
                      VATNO: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label>State</label>
                <select
                  className="border rounded px-2 py-1 w-full text-sm"
                  value={addParty?.RELID}
                  onChange={(e) => {
                    const selectedIndex = e.target.selectedIndex;
                    const selectedOption = e.target.options[selectedIndex];
                    const stateName = selectedOption.text;
                    const stateCode: number = parseInt(e.target.value);

                    setAddParty((prevData) => ({
                      ...(prevData as AccountLedgerInterface),
                      AccState: stateName,
                      RELID: stateCode,
                    }));
                  }}
                >
                  <option value="" disabled>
                    -- Select Group --
                  </option>
                  {stateCode.map(
                    (
                      item: {
                        code: number;
                        name: string;
                      },
                      index: number
                    ) => {
                      return (
                        <option key={index} value={item.code}>
                          {item.name}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

              <div>
                <label>City/Location</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  value={addParty?.AccCity}
                  onChange={(e) =>
                    setAddParty((prevData) => ({
                      ...(prevData as AccountLedgerInterface),
                      AccCity: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label>PIN Code</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  value={addParty?.PinCode}
                  onChange={(e) =>
                    setAddParty((prevData) => ({
                      ...(prevData as AccountLedgerInterface),
                      PinCode: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label>Max Credit Days</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-full"
                  value={addParty?.MaxCreditDays}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setAddParty((prevData) => ({
                      ...(prevData as AccountLedgerInterface),
                      MaxCreditDays: val,
                    }));
                  }}
                />
              </div>

              <div>
                <label>Phone</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  value={addParty?.PhoneNo}
                  onChange={(e) =>
                    setAddParty((prevData) => ({
                      ...(prevData as AccountLedgerInterface),
                      PhoneNo: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label>Max Credit Amount</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-full"
                  value={addParty?.MaxCreditAmount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setAddParty((prevData) => ({
                      ...(prevData as AccountLedgerInterface),
                      MaxCreditAmount: val,
                    }));
                  }}
                />
              </div>

              <div>
                <label>Discount %</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  value={addParty?.REFNO1}
                  onChange={(e) =>
                    setAddParty((prevData) => ({
                      ...(prevData as AccountLedgerInterface),
                      REFNO1: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label>Contact Person</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  value={addParty?.CONTACTPERSON}
                  onChange={(e) =>
                    setAddParty((prevData) => ({
                      ...(prevData as AccountLedgerInterface),
                      CONTACTPERSON: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label>Bank Account Details</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  value={addParty?.ACCOUNTNO}
                  onChange={(e) =>
                    setAddParty((prevData) => ({
                      ...(prevData as AccountLedgerInterface),
                      ACCOUNTNO: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setAddPartyModal(false);
                  setMopModal(true);
                }}
                type="button"
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-1 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSubmitParty();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TodayOrders;
