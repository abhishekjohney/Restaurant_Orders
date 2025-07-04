"use client";

import { ListApi } from "@/app/utils/api";
import PdfViewer from "@/components/common/PdfViewer";
import CustomFunctionalModal from "@/components/FunctionalModal";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { convertSendFormatIntoInputFormat, getCurrentDateFormatted, getCurrentDateFormattedToInput } from "@/lib/helper-function";
import useRestoStore from "@/store/resto";
import { OrderItemTypeTodayOrder, ProductGetSelectedProductDetails, SalesListInterface } from "@/types";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { HiArrowUturnLeft, HiArrowUturnRight, HiMinusSmall, HiOutlinePlus } from "react-icons/hi2";
import { IoArrowBackSharp } from "react-icons/io5";
import { RiFilter2Fill } from "react-icons/ri";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import billCounter from "../../instant-bill/svg/billCounter.svg";
import { stateCode } from "../_components/help";
import OrderList from "../_components/OrderList";
import SaleList from "../_components/SalesList";
import TableSeatSelector from "../_components/TableList";
import {
  CalculateAndUpdateResBill,
  CancelDeleteOrderByCode,
  GetAccountAndPartyListSearch,
  GetItemMasterByCode,
  GetOrderDetailsByCode,
  GetPartyMasterByCode,
  GetPrinterList,
  GetRestSalesBillByCode,
  GetSalesRestBillingList,
  GetStockItemListJasonRestarants,
  GetTableStatusList,
  PrintRestOrderByCodeJson,
  PrintRestRetailInvoiceByCode,
  PrintRestTockenByCode,
  UpdateAccountBook,
  UpdateB2BOrders,
  UpdateBillPaidStatus,
  UpdateStockOutTypeStatus,
} from "../action";
import cashcounter from "../svg/cashcounter.svg";
import dineIcon from "../svg/dine.svg";
import employee from "../svg/employee.svg";
import orderIcon from "../svg/order.svg";
import ordrnoIcon from "../svg/ordrno.svg";
import saleIcon from "../svg/sale.svg";
import tableIcon from "../svg/table.svg";
import {
  AccountInterface,
  AccountLedgerInterface,
  OrderDataInterface,
  PrinterInterface,
  RestoBlankItemInterface,
  RestoOrderDetailsInterface,
  RestuarantProductInterface,
  StockItemType,
  TableStatusType,
} from "../types";

const cocnut = "/images/noImg.jpg";

type Props = {
  params: {
    orderID: string;
  };
};

type EmployeeOrder = {
  EMPCODE: string;
  EmpName: string;
  EMPAUTOID: string;
};

const Page = ({ params }: Props) => {
  const session = useSession();
  const router = useRouter();

  const {
    removeAll,
    blankRestoProduct,
    restoDetails,
    setBlankRestoProduct,
    setRestoDetails,
    setRestoProductContainer,
    restoProductContainer,
  } = useRestoStore.getState();

  const qtyRef = useRef<HTMLInputElement | null>(null);
  const listAPI = new ListApi();

  const [categories, setCategories] = useState<string[]>([]);
  const [subCat, setSubCat] = useState<{ category: string; subCategory: string }[]>([]);
  const [fullProduct, setFullProduct] = useState<RestuarantProductInterface[]>([]);
  const [filterFullProduct, setFilterFullProduct] = useState<RestuarantProductInterface[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSub, setSelectedSub] = useState<string>("");
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [restoCurrCart, setRestoCurrCart] = useState<RestoBlankItemInterface[]>([]);
  const [restoCurrCartView, setRestoCurrCartView] = useState<RestoBlankItemInterface[]>([]);
  const [restoOrderView, setRestoOrderView] = useState<RestoOrderDetailsInterface | Partial<RestoOrderDetailsInterface>>({});
  const [selectedRestoProduct, setSelectedRestoProduct] = useState<RestoBlankItemInterface | Partial<RestoBlankItemInterface>>({});
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<TableStatusType[]>([]);
  const [popupProduct, setPopupProduct] = useState<StockItemType | null>(null);
  const [popupQty, setPopupQty] = useState<number>(1);
  const [confirmPopupOpen, setConfirmPopupOpen] = useState(false);
  const [PopupView, setPopupView] = useState(false);
  const [tableModal, setTableModal] = useState(false);
  const [date, setDate] = useState<string>(getCurrentDateFormattedToInput());
  const [todayOrders, setTodayOrders] = useState<OrderItemTypeTodayOrder[]>([]);
  const [todaySales, setTodaySales] = useState<SalesListInterface[]>([]);
  const [orderModal, setOrderModal] = useState(false);
  const [saleModal, setSaleModal] = useState(false);
  const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<SalesListInterface | Partial<SalesListInterface>>();
  const [mopData, setMopData] = useState<SalesListInterface | Partial<SalesListInterface>>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [printInvoiceId, setPrintInvoiceId] = useState<number>(0);
  const [pdfModal, setPdfModal] = useState<boolean>(false);
  const [pdfLink, setPdfLink] = useState("");
  const [totalGstPer, setTotalGstPer] = useState<number>(0);
  const [totalIgstPer, setTotalIgstPer] = useState<number>(0);
  const [totaltCgstPer, setTotalCGSTPer] = useState<number>(0);
  const [totalSgstPer, setTotalSGSTPer] = useState<number>(0);
  const [showMobileOptions, setShowMobileOptions] = useState(false);
  const [mopModal, setMopModal] = useState<boolean>(false);
  const [POSdata, setPOSData] = useState<PrinterInterface[]>([]);
  const [openLast, setOpenLast] = useState<boolean>(false);
  const [showMorePaymentOptions, setShowMorePaymentOptions] = useState(false);
  const [showSeatPopup, setShowSeatPopup] = useState(false);
  const [userTypes, setUserTypes] = useState<EmployeeOrder[]>([]);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [salesView, setSalesView] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [addParty, setAddParty] = useState<AccountLedgerInterface | Partial<AccountLedgerInterface>>({});
  const [addPartyModal, setAddPartyModal] = useState(false);
  const [isCrChecked, setIsCrChecked] = useState(false);
  const [searchQueryAcc, setSearchQueryAcc] = useState("");
  const [partyList, setPartyList] = useState<AccountInterface[]>([]);
  const [bankList, setBankList] = useState<AccountInterface[]>([]);
  const [filteredPartyList, setFilteredPartyList] = useState<AccountInterface[]>([]);
  const [showSearchAcc, setShowSearchAcc] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setShowMobileOptions(window.innerWidth > 786);
      setSidebarOpen(window.innerWidth > 786);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    userRole: "",
  });

  useEffect(() => {
    if (session.data?.user) {
      const nameToUse = session.data.user.name;
      let code = orderData.employeeCode;
      if (code === "") {
        setOrderData((prev) => ({
          ...prev,
          employeeSelect: nameToUse as string,
          OrderDate: session.data.user.systemDate,
          userRole: session.data.user.role,
        }));
        setDate(convertSendFormatIntoInputFormat(session.data.user.systemDate));
      }
    }
  }, [session.data?.user]);

  const [formData, setFormData] = useState<{ orderId: string }>({
    orderId: "",
  });

  const FetchEmployeeDetails = async () => {
    setLoading(true);
    try {
      const response = await listAPI.getEmployeeMasterListView();
      if (response?.length > 0) {
        const uniqueTodayOrder = response?.map((item: any) => ({
          EMPCODE: item?.EMPCODE,
          EmpName: item?.EmployeeName,
          EMPAUTOID: String(item?.EMPAUTOID),
        }));
        const uniqueTodayOrderArray: EmployeeOrder[] = [{ EMPCODE: "ALL", EmpName: "All" }, ...uniqueTodayOrder];
        setUserTypes(uniqueTodayOrderArray);
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await GetPrinterList();
      const action = response[0]?.ActionType;
      if (action > 0) {
        const JSONData1 = JSON.parse(response[0]?.JSONData1);
        setPOSData(JSONData1);
      }
    } catch (error) {
      console.error(error);
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

      // Step 1: Fetch Today Orders
      const currentDate = getCurrentDateFormatted();
      const ordersData = await listAPI.GetStockOrderMasterListJason(currentDate, requestUserName);
      const todayOrd = ordersData?.length > 0 ? ordersData : [];
      setTodayOrders(todayOrd);

      // Step 2: Fetch Table Status
      const response = await GetTableStatusList();
      const action = response[0]?.ActionType;
      if (action > 0) {
        const tableDataRaw = JSON.parse(response[0]?.JSONData1);

        // Step 3: Add Order Data to Table Data
        const enhancedTableData = tableDataRaw.map((table: TableStatusType) => {
          const matchingOrders = todayOrd.filter(
            (order: OrderItemTypeTodayOrder) => order.OrderID === table.OrderID && order.IsDropped !== true
          );
          const userMatched: boolean = todayOrd.some(
            (order: OrderItemTypeTodayOrder) =>
              order.OrderID === table.OrderID && order.IsDropped !== true && order.UserCode === requestUserName
          );
          return {
            ...table,
            EntryDateTimeStr: matchingOrders.length > 0 ? matchingOrders[0].EntryDateTimeStr : "",
            OrderNo: matchingOrders.length > 0 ? matchingOrders[0].OrderNo : "",
            Amount: matchingOrders.length > 0 ? matchingOrders[0].NetAmount : "0",
            isUserMatched: userMatched,
          };
        });
        console.log(enhancedTableData, "enhancedTableData");
        setTableData(enhancedTableData);
      }
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    FetchEmployeeDetails();
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const filteredList = fullProduct.filter((item) => item.itm_NAM.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilterFullProduct(filteredList);
  }, [searchQuery, fullProduct]);

  const fetchDataCurrSales = async () => {
    setLoading(true);
    const currentDate = getCurrentDateFormatted();
    const user = session?.data?.user;
    const userType = user?.UserType;
    const userName = user?.name || "";

    const userYearStr = localStorage.getItem("UserYear") || "";
    const [selectedUserCode = ""] = userYearStr.split("_");

    const isManager = userType === "2";
    const requestUserName = isManager && orderData.employeeCode ? orderData.employeeSelect : userName;

    const data = await GetSalesRestBillingList(currentDate, "", requestUserName);
    const action = data[0]?.ActionType;
    if (action >= 0) {
      const JSONData1 = JSON.parse(data[0]?.JSONData1);
      setTodaySales(JSONData1);
      setLoading(false);
    } else {
      setTodaySales([]);
      setLoading(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (restoCurrCart.length > 0) {
      const totalIgstGstP = restoCurrCart.reduce((acc: number, conc: RestoBlankItemInterface) => acc + Number(conc.TrnIGSTPer || 0), 0);
      const totalSGstP = restoCurrCart.reduce((acc: number, conc: RestoBlankItemInterface) => acc + Number(conc.TrnSGSTPer || 0), 0);
      const totalCGstP = restoCurrCart.reduce((acc: number, conc: RestoBlankItemInterface) => acc + Number(conc.TrnCGSTPer || 0), 0);
      const totalGstAmP = restoCurrCart.reduce((acc: number, conc: RestoBlankItemInterface) => acc + Number(conc.TrnGSTPer || 0), 0);

      setTotalCGSTPer(parseFloat(totalCGstP.toFixed(2)));
      setTotalSGSTPer(parseFloat(totalSGstP.toFixed(2)));
      setTotalIgstPer(parseFloat(totalIgstGstP.toFixed(2)));
      setTotalGstPer(parseFloat(totalGstAmP.toFixed(2)));
    }
  }, [restoCurrCart]);

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
    if (popupProduct && qtyRef.current) {
      qtyRef.current.focus();
      qtyRef.current.select();
    }
    fetchDashboardData();
    fetchDataCurrSales();
  }, [popupProduct]);

  const fetchFullList = async () => {
    try {
      setLoading(true);
      const response = await GetStockItemListJasonRestarants();
      const JSONData1 = JSON.parse(response[0]?.JSONData1);
      setFullProduct(JSONData1);

      const categorySet = new Set<string>();
      const subCatSet = new Set<string>();
      const subCatArr: { category: string; subCategory: string }[] = [];
      categorySet.add("All");

      JSONData1.forEach((item: RestuarantProductInterface) => {
        if (item.ProductGroup || item.subgrp) {
          categorySet.add(item.ProductGroup);

          const comboKey = `${item.ProductGroup}|${item.subgrp}`;

          if (!subCatSet.has(comboKey)) {
            subCatSet.add(comboKey);
            subCatArr.push({
              category: item.ProductGroup,
              subCategory: item.subgrp,
            });
          }
        }
      });

      const categoryArray = Array.from(categorySet);
      setCategories(categoryArray);
      setSelectedCategory(categoryArray[0] || "");
      setSubCat(subCatArr);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGetOrderDetailsByCode = async () => {
    try {
      setLoading(true);

      const currentDate = getCurrentDateFormatted();
      const user = session?.data?.user;
      const userType = user?.UserType;
      const userName = user?.name || "";

      const orderId = formData.orderId || "0";

      const userYearStr = localStorage.getItem("UserYear") || "";
      const [_, year = "", __, counter = ""] = userYearStr.split("_");

      const isManager = userType === "2";
      const requestUserName = isManager ? orderData.employeeSelect : userName;
      const requestUserCode = isManager && orderData.employeeCode ? orderData.employeeSelect : userName;

      const res = await GetOrderDetailsByCode(orderId, requestUserName, currentDate, year, requestUserCode);
      const response = res[0];

      if (response?.ActionType > 0) {
        const orderDetailsList: RestoOrderDetailsInterface[] = JSON.parse(response.JSONData1);
        const productItems: RestoBlankItemInterface[] = JSON.parse(response.JSONData2);
        const blankProduct: RestoBlankItemInterface = JSON.parse(response.JSONData3)[0];

        const orderInfo = orderDetailsList[0];

        setOrderData((prev) => ({
          ...prev,
          SeatNos: orderInfo?.SeatNos ?? prev.SeatNos,
          ModeOfDelivery: prev.ModeOfDelivery,
          name: orderInfo?.PartyName,
          phone: orderInfo?.OrderPhoneNo,
          DelPhoneNo: orderInfo?.DelPhoneNo,
          OrderAddress: orderInfo?.OrderAddress,
          OrderAddress2: orderInfo?.OrderAddress2,
          OrderPin: orderInfo?.OrderPin,
          OrderPlace: orderInfo?.OrderPlace,
          OrderCity: orderInfo?.OrderCity,
          OrderDist: orderInfo?.OrderDist,
          Counter: counter,
          CashPay: prev.CashPay >= "0" ? "0" : "",
          UPIPay: prev.UPIPay >= "0" ? "0" : "",
          OnlinePay: prev.OnlinePay >= "0" ? "0" : "",
          CardPay: prev.CardPay >= "0" ? "0" : "",
          ChequePay: prev.ChequePay >= "0" ? "0" : "",
          CreditPay: prev.CreditPay >= "0" ? "0" : "",
          MOP: "Cash",
        }));

        if (orderDetailsList.length > 0) setRestoDetails(orderInfo);
        setRestoProductContainer(productItems.length > 0 ? productItems : []);
        setBlankRestoProduct(blankProduct);
      } else {
        toast.warn(response?.ErrorMessage || "Unable to fetch order details.");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.orderId > "0") {
      fetchGetOrderDetailsByCode();
    }
  }, [formData.orderId]);

  useEffect(() => {
    fetchFullList();
  }, []);

  useEffect(() => {
    if (printInvoiceId > 0) {
      fetchPrintInvoice();
    }
  }, [printInvoiceId]);

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
        setOrderData({ ...orderData, ReqStatusType: "" });
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

  const saveChangesToStore = () => {
    setRestoProductContainer(restoCurrCart);
  };

  useEffect(() => {
    setRestoCurrCart(restoProductContainer);
  }, [restoProductContainer]);

  const mapProductDetails = (
    response: ProductGetSelectedProductDetails,
    blankRestoProduct: RestoBlankItemInterface | Partial<RestoBlankItemInterface>,
    qty: number
  ) => {
    if (!response || !blankRestoProduct) {
      console.error("Invalid input: response or blankRestoProduct is missing.");
      return null;
    }

    console.log(response, "response");
    console.log(blankRestoProduct, "blankRestoProduct");

    const orderRate = response.SalePrice || 0;
    const cess = response.OrderCesPer || 0;
    const gstPer = response.STKGSTRate || 0;
    let salRate = 0;

    if (restoDetails.OrderGstType === 1) {
      salRate = parseFloat(((orderRate / (gstPer + cess + 100)) * 100).toFixed(2));
    } else if (restoDetails.OrderGstType === 0) {
      salRate = orderRate;
    } else if (restoDetails.OrderGstType === -1) {
      salRate = orderRate;
    }

    const orderQty = qty || 0;
    const cgst = response.STKCGSTRate || 0;
    const sgst = response.STKSGSTRate || 0;
    const igst = response.STKIGSTRate || 0;
    const OrdrAmt = parseFloat((orderRate * orderQty).toFixed(2));

    const TrnAmt = parseFloat((salRate * orderQty).toFixed(2));
    const grsAmt = TrnAmt;

    const cgstAmt = restoDetails.OrderGstType === -1 ? 0 : parseFloat((grsAmt * (cgst / 100)).toFixed(2));
    const sgstAmt = restoDetails.OrderGstType === -1 ? 0 : parseFloat((grsAmt * (sgst / 100)).toFixed(2));
    const igstAmt = restoDetails.OrderGstType === -1 ? 0 : parseFloat((grsAmt * (igst / 100)).toFixed(2));
    const cessAmt = restoDetails.OrderGstType === -1 ? 0 : parseFloat((grsAmt * (cess / 100)).toFixed(2));

    const gstAmt = cgstAmt + sgstAmt;
    const netAmt = grsAmt + gstAmt;
    const totalQty = orderQty;

    const newProduct: RestoBlankItemInterface = {
      ...blankRestoProduct,
      OrderID: restoDetails?.OrderID,
      OrderQty: qty,
      OrderRate: response.SalePrice,
      OrderAmount: response.SalePrice * qty,
      TrnAmount: salRate * qty,
      TrnGrossAmt: grsAmt,
      TrnCGSTAmt: cgstAmt,
      STKSVRSTOCK: response.STKSVRSTOCK,
      STOCKCOLOR: response.STOCKCOLOR,
      itm_NAM: response.itm_NAM,
      STOCKMRP: response.MRP,
      STOCKLastRate: response.LastRate,
      STOCKSalePrice: response.SalePrice,
      STOCKWSPrice: response.WSPrice,
      SVRSTKID: response.SVRSTKID,
      TrnCGSTPer: response.STKCGSTRate,
      TrnIGSTPer: response.STKIGSTRate,
      TrnSGSTPer: response.STKSGSTRate,
      TrnGSTPer: response.STKGSTRate,
      TrnCessPer: response.OrderCesPer,
      SaleRate: salRate,
      TrnSGSTAmt: sgstAmt,
      TrnGSTAmt: gstAmt,
      TrnNetAmount: netAmt,
      TrnCessAmt: cessAmt,
    } as RestoBlankItemInterface;

    setSelectedRestoProduct(newProduct);

    return newProduct;
  };

  const addItem = async (item: RestuarantProductInterface, qty = 1) => {
    const existingItem = restoCurrCart.find((p) => p.SVRSTKID === parseInt(item.SVRSTKID));

    if (existingItem) {
      const updatedCart = restoCurrCart.map((p) =>
        p.SVRSTKID === parseInt(item.SVRSTKID) ? { ...p, OrderQty: (p.OrderQty || 0) + qty } : p
      );

      handleCartSubmit(updatedCart); // ✅ Call here
      setRestoCurrCart(updatedCart);
      return;
    }

    try {
      setLoading(true);
      const response = await GetItemMasterByCode(item.SVRSTKID, "");
      const action = response[0]?.ActionType;
      if (action > 0) {
        const JS1 = JSON.parse(response[0]?.JSONData1);
        const result: ProductGetSelectedProductDetails = JS1[0];
        const product = mapProductDetails(result, blankRestoProduct, qty);
        console.log(product, "product");
        if (!product) return;

        const cot = [...restoCurrCart, product];
        handleCartSubmit(cot);
        setRestoCurrCart(cot);
      }
    } catch (error) {
      console.error("Error in addItem:", error);
    } finally {
      setLoading(false);
    }
    if (orderData.SeatNos.length === 0) {
      setTableModal(true);
    }
  };

  const removeItem = (item: RestuarantProductInterface) => {
    const existingIndex = restoCurrCart.findIndex((i) => i.SVRSTKID === parseInt(item.SVRSTKID));
    if (existingIndex === -1) return;

    const updated = [...restoCurrCart];

    const currentQty = updated[existingIndex].OrderQty || 0;

    if (currentQty > 1) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        OrderQty: currentQty - 1,
      };
    } else {
      updated[existingIndex] = {
        ...blankRestoProduct,
        OrderTransID: updated[existingIndex].OrderTransID,
        DelFlag: 1,
      } as RestoBlankItemInterface;
    }

    handleCartSubmit(updated);
    setRestoCurrCart(updated);
  };

  const total = restoCurrCart.reduce((acc: number, item: RestoBlankItemInterface) => acc + item.OrderQty * item.OrderRate, 0);

  const toggleExpand = (cat: string) => {
    setExpandedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  };

  const addItem2 = async (item: RestoBlankItemInterface, qty = 1) => {
    const existingItem = restoCurrCart.find((p) => p.SVRSTKID === item.SVRSTKID);

    if (existingItem) {
      const updatedCart = restoCurrCart.map((p) => (p.SVRSTKID === item.SVRSTKID ? { ...p, OrderQty: (p.OrderQty || 0) + qty } : p));

      handleCartSubmit(updatedCart); // ✅ Call here
      setRestoCurrCart(updatedCart);
      return;
    }
  };

  const removeItem2 = (item: RestoBlankItemInterface) => {
    const existingIndex = restoCurrCart.findIndex((i) => i.SVRSTKID === item.SVRSTKID);
    if (existingIndex === -1) return;

    const updated = [...restoCurrCart];
    const currentQty = updated[existingIndex].OrderQty || 0;

    if (currentQty > 1) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        OrderQty: currentQty - 1,
      };
    } else {
      updated[existingIndex] = {
        ...blankRestoProduct,
        OrderTransID: updated[existingIndex].OrderTransID,
        DelFlag: 1,
      } as RestoBlankItemInterface;
    }
    handleCartSubmit(updated);
    setRestoCurrCart(updated);
  };

  const removeItem3 = (item: RestoBlankItemInterface) => {
    const existingIndex = restoCurrCart.findIndex((i) => i.SVRSTKID === item.SVRSTKID);
    if (existingIndex === -1) return;

    const updated = [...restoCurrCart];

    updated[existingIndex] = {
      ...blankRestoProduct,
      OrderTransID: updated[existingIndex].OrderTransID,
      DelFlag: 1,
    } as RestoBlankItemInterface;
    handleCartSubmit(updated);
    setRestoCurrCart(updated);
  };

  useEffect(() => {
    const calculateDetails = () => {
      const orderRate = selectedRestoProduct.OrderRate || 0;
      const orderQty = selectedRestoProduct.OrderQty || 0;
      const cess = selectedRestoProduct.TrnCessPer || 0;
      const cgst = selectedRestoProduct.TrnCGSTPer || 0;
      const sgst = selectedRestoProduct.TrnSGSTPer || 0;
      const igst = selectedRestoProduct.TrnIGSTPer || 0;
      const gstPer = selectedRestoProduct.TrnGSTPer || 0;

      const OrdrAmt = parseFloat((orderRate * orderQty).toFixed(2));

      let salRate = 0;

      if (restoDetails.OrderGstType === 1) {
        salRate = parseFloat(((orderRate / (gstPer + cess + 100)) * 100).toFixed(2));
      } else if (restoDetails.OrderGstType === 0) {
        salRate = orderRate;
      } else if (restoDetails.OrderGstType === -1) {
        salRate = orderRate;
      }

      const TrnAmt = parseFloat((salRate * orderQty).toFixed(2));
      const grsAmt = TrnAmt;

      const cgstAmt = restoDetails.OrderGstType === -1 ? 0 : parseFloat((grsAmt * (cgst / 100)).toFixed(2));
      const sgstAmt = restoDetails.OrderGstType === -1 ? 0 : parseFloat((grsAmt * (sgst / 100)).toFixed(2));
      const igstAmt = restoDetails.OrderGstType === -1 ? 0 : parseFloat((grsAmt * (igst / 100)).toFixed(2));
      const cessAmt = restoDetails.OrderGstType === -1 ? 0 : parseFloat((grsAmt * (cess / 100)).toFixed(2));

      const gstAmt = cgstAmt + sgstAmt;
      const netAmt = grsAmt + gstAmt;
      const totalQty = orderQty;

      setSelectedRestoProduct({
        ...blankRestoProduct,
        OrderAmount: OrdrAmt,
        TrnAmount: TrnAmt,
        TrnGrossAmt: grsAmt,
        TrnCGSTAmt: cgstAmt,
        TrnSGSTAmt: sgstAmt,
        TrnIGSTAmt: igstAmt,
        TrnGSTAmt: gstAmt,
        TrnNetAmount: netAmt,
        TrnCessAmt: cessAmt,
        TotQty: totalQty,
      });
    };
    if ((selectedRestoProduct.OrderRate || 0) > 0 && (selectedRestoProduct.OrderQty || 0) > 0) {
      calculateDetails();
    }
  }, [selectedRestoProduct.OrderRate, selectedRestoProduct.OrderQty]);

  useEffect(() => {
    const updatedCart = restoCurrCart.map((item) => {
      const orderRate = item.OrderRate || 0;
      const orderQty = item.OrderQty || 0;
      const cess = item.TrnCessPer || 0;
      const cgst = item.TrnCGSTPer || 0;
      const sgst = item.TrnSGSTPer || 0;
      const igst = item.TrnIGSTPer || 0;
      const gstPer = item.TrnGSTPer || 0;

      const OrdrAmt = parseFloat((orderRate * orderQty).toFixed(2));

      let salRate = 0;

      // Determine salRate based on GST type
      if (restoDetails.OrderGstType === 1) {
        salRate = parseFloat(((orderRate / (gstPer + cess + 100)) * 100).toFixed(2));
      } else if (restoDetails.OrderGstType === 0) {
        salRate = orderRate;
      } else if (restoDetails.OrderGstType === -1) {
        salRate = orderRate;
      }

      const TrnAmt = parseFloat((salRate * orderQty).toFixed(2));
      const grsAmt = TrnAmt;

      // Compute tax components
      const cgstAmt = restoDetails.OrderGstType === -1 ? 0 : parseFloat((grsAmt * (cgst / 100)).toFixed(2));
      const sgstAmt = restoDetails.OrderGstType === -1 ? 0 : parseFloat((grsAmt * (sgst / 100)).toFixed(2));
      const igstAmt = restoDetails.OrderGstType === -1 ? 0 : parseFloat((grsAmt * (igst / 100)).toFixed(2));
      const cessAmt = restoDetails.OrderGstType === -1 ? 0 : parseFloat((grsAmt * (cess / 100)).toFixed(2));

      const gstAmt = cgstAmt + sgstAmt;
      const netAmt = grsAmt + gstAmt;
      const totalQty = orderQty;

      return {
        ...item,
        OrderAmount: OrdrAmt,
        TrnAmount: TrnAmt,
        TrnGrossAmt: grsAmt,
        TrnCGSTAmt: cgstAmt,
        TrnIGSTAmt: igstAmt,
        TrnSGSTAmt: sgstAmt,
        TrnGSTAmt: gstAmt,
        TrnNetAmount: netAmt,
        TrnCessAmt: cessAmt,
        TotQty: totalQty,
      };
    });

    setRestoCurrCart(updatedCart);
    saveChangesToStore();
  }, [JSON.stringify(restoCurrCart)]);

  useEffect(() => {
    let sumUpOrderMaster: any = () => {
      const FullOrderAmount = restoCurrCart.reduce((sum, curr) => sum + (curr.OrderAmount || 0), 0);
      const TotAmount = restoCurrCart.reduce((sum, curr) => sum + (curr.TrnAmount || 0), 0);
      const TotItemDiscount = restoCurrCart.reduce((sum, curr) => sum + (curr.ItemDisAmount || 0), 0);
      const FlatDiscount = 0;
      const DiscountAmt = TotItemDiscount + FlatDiscount;
      const GrossAmount = TotAmount - DiscountAmt;

      const CGSTAmt = restoCurrCart.reduce((sum, curr) => sum + (curr.TrnCGSTAmt || 0), 0);
      const SGSTAmt = restoCurrCart.reduce((sum, curr) => sum + (curr.TrnSGSTAmt || 0), 0);
      const IGSTAmt = restoCurrCart.reduce((sum, curr) => sum + (curr.TrnIGSTAmt || 0), 0);
      const CessAmt = restoCurrCart.reduce((sum, curr) => sum + (curr.TrnCessAmt || 0), 0);

      const GSTAmt = CGSTAmt + SGSTAmt + IGSTAmt;

      const RofAmt = 0;
      const NetAmount = GrossAmount + GSTAmt + CessAmt;
      let OrderModeOfDel;

      if (orderData?.SeatNos?.startsWith("P")) {
        setOrderData({ ...orderData, ModeOfDelivery: "Delivery" });
        OrderModeOfDel = "Delivery";
      }

      return {
        ...restoDetails,
        FullOrderAmount,
        TotAmount,
        TotItemDiscount,
        FlatDiscount,
        DiscountAmt,
        GrossAmount,
        CGSTAmt,
        SGSTAmt,
        IGSTAmt,
        CessAmt,
        GSTAmt,
        RofAmt,
        NetAmount,
        OrderModeOfDel,
        OrderSource: "Shop",
      };
    };

    let dat = sumUpOrderMaster();
    setRestoDetails(dat);
  }, [restoCurrCart]);

  const handleCartSubmit = async (cartOverride?: RestoBlankItemInterface[]) => {
    try {
      setLoading(true);

      // 🛡️ VALIDATION
      const requiredFields: { field: string; value: any; label: string }[] = [];

      const { ModeOfDelivery, phone, DelPhoneNo, OrderAddress, OrderPlace, name } = orderData;

      if (ModeOfDelivery === "delivery") {
        if (!phone) requiredFields.push({ field: "phone", value: phone, label: "Order Phone No" });
        if (!OrderAddress) requiredFields.push({ field: "OrderAddress", value: OrderAddress, label: "Delivery Address" });
        if (!OrderPlace) requiredFields.push({ field: "OrderPlace", value: OrderPlace, label: "Order Place" });
        if (!name) requiredFields.push({ field: "name", value: name, label: "Party Name" });
      }

      if (ModeOfDelivery === "takeaway") {
        if (!phone) requiredFields.push({ field: "phone", value: phone, label: "Order Phone No" });
        if (!name) requiredFields.push({ field: "name", value: name, label: "Party Name" });
      }

      if (requiredFields.length > 0) {
        requiredFields.forEach((f) => {
          toast.warn(`${f.label} is required`);
        });
        return; // Stop form submission
      }

      const cart = cartOverride || restoCurrCart;

      // 🧮 Prepare Order Master
      const FullOrderAmount = cart.reduce((sum, curr) => sum + (curr.OrderAmount || 0), 0);
      const TotAmount = cart.reduce((sum, curr) => sum + (curr.TrnAmount || 0), 0);
      const TotItemDiscount = cart.reduce((sum, curr) => sum + (curr.ItemDisAmount || 0), 0);
      const GrossAmount = TotAmount;
      const CGSTAmt = cart.reduce((sum, curr) => sum + (curr.TrnCGSTAmt || 0), 0);
      const SGSTAmt = cart.reduce((sum, curr) => sum + (curr.TrnSGSTAmt || 0), 0);
      const IGSTAmt = cart.reduce((sum, curr) => sum + (curr.TrnIGSTAmt || 0), 0);
      const CessAmt = cart.reduce((sum, curr) => sum + (curr.TrnCessAmt || 0), 0);
      const GSTAmt = CGSTAmt + SGSTAmt + IGSTAmt;
      const NetAmount = GrossAmount + GSTAmt + CessAmt;

      const sumUpOrderMaster = {
        ...restoDetails,
        FullOrderAmount,
        TotAmount,
        TotItemDiscount,
        GrossAmount,
        CGSTAmt,
        SGSTAmt,
        IGSTAmt,
        CessAmt,
        GSTAmt,
        RofAmt: 0,
        NetAmount,
        SeatNos: orderData.SeatNos || restoDetails?.SeatNos,
        OrderModeOfDel: orderData.ModeOfDelivery || restoDetails?.OrderModeOfDel,
        PartyName: orderData.name || restoDetails?.PartyName,
        OrderPhoneNo: orderData.phone || restoDetails?.OrderPhoneNo,
        DelPhoneNo: orderData.DelPhoneNo || restoDetails?.DelPhoneNo,
        OrderAddress: orderData.OrderAddress || restoDetails?.OrderAddress,
        OrderAddress2: orderData.OrderAddress2 || restoDetails?.OrderAddress2,
        OrderPin: orderData.OrderPin || restoDetails?.OrderPin,
        OrderPlace: orderData.OrderPlace || restoDetails?.OrderPlace,
        OrderCity: orderData.OrderCity || restoDetails?.OrderCity,
        OrderDist: orderData.OrderDist || restoDetails?.OrderDist,
        OrderSource: "Shop",
      };

      const js1 = JSON.stringify([sumUpOrderMaster]);
      const js2 = JSON.stringify(cart);
      const storedUserYear = localStorage.getItem("UserYear") as string;
      const parts = storedUserYear.split("_");
      const year = parts[1];
      const response = await UpdateB2BOrders(js1, js2, year, "0", orderData.employeeSelect);
      const action = response[0]?.ActionType;

      if (action > 0) {
        setConfirmPopupOpen(false);
        const JSONData2 = JSON.parse(response[0]?.JSONData2);
        const JSONData5 = JSON.parse(response[0]?.JSONData5);

        setRestoDetails(JSONData2[0]);
        if (JSONData5?.length > 0) {
          setRestoCurrCart(JSONData5);
          saveChangesToStore();
        }

        fetchDashboardData();
        fetchDataCurrSales();
      } else {
        const err = response[0]?.ErrorMessage;
        toast.warn(err);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCartKOT = async (cartOverride?: RestoBlankItemInterface[]) => {
    try {
      setLoading(true);

      // 🛡️ VALIDATION
      const requiredFields: { field: string; value: any; label: string }[] = [];

      const { ModeOfDelivery, phone, DelPhoneNo, OrderAddress, OrderPlace, name } = orderData;

      if (ModeOfDelivery === "delivery") {
        if (!phone) requiredFields.push({ field: "phone", value: phone, label: "Order Phone No" });
        if (!OrderAddress) requiredFields.push({ field: "OrderAddress", value: OrderAddress, label: "Delivery Address" });
        if (!OrderPlace) requiredFields.push({ field: "OrderPlace", value: OrderPlace, label: "Order Place" });
        if (!name) requiredFields.push({ field: "name", value: name, label: "Party Name" });
      }

      if (ModeOfDelivery === "takeaway") {
        if (!phone) requiredFields.push({ field: "phone", value: phone, label: "Order Phone No" });
        if (!name) requiredFields.push({ field: "name", value: name, label: "Party Name" });
      }

      if (requiredFields.length > 0) {
        requiredFields.forEach((f) => {
          toast.warn(`${f.label} is required`);
        });
        return; // Stop form submission
      }

      const cart = cartOverride || restoCurrCart;

      // 🧮 Prepare Order Master
      const FullOrderAmount = cart.reduce((sum, curr) => sum + (curr.OrderAmount || 0), 0);
      const TotAmount = cart.reduce((sum, curr) => sum + (curr.TrnAmount || 0), 0);
      const TotItemDiscount = cart.reduce((sum, curr) => sum + (curr.ItemDisAmount || 0), 0);
      const GrossAmount = TotAmount;
      const CGSTAmt = cart.reduce((sum, curr) => sum + (curr.TrnCGSTAmt || 0), 0);
      const SGSTAmt = cart.reduce((sum, curr) => sum + (curr.TrnSGSTAmt || 0), 0);
      const IGSTAmt = cart.reduce((sum, curr) => sum + (curr.TrnIGSTAmt || 0), 0);
      const CessAmt = cart.reduce((sum, curr) => sum + (curr.TrnCessAmt || 0), 0);
      const GSTAmt = CGSTAmt + SGSTAmt + IGSTAmt;
      const NetAmount = GrossAmount + GSTAmt + CessAmt;

      const sumUpOrderMaster = {
        ...restoDetails,
        FullOrderAmount,
        TotAmount,
        TotItemDiscount,
        GrossAmount,
        CGSTAmt,
        SGSTAmt,
        IGSTAmt,
        CessAmt,
        GSTAmt,
        RofAmt: 0,
        NetAmount,
        SeatNos: orderData.SeatNos || restoDetails?.SeatNos,
        OrderModeOfDel: orderData.ModeOfDelivery || restoDetails?.OrderModeOfDel,
        PartyName: orderData.name || restoDetails?.PartyName,
        OrderPhoneNo: orderData.phone || restoDetails?.OrderPhoneNo,
        DelPhoneNo: orderData.DelPhoneNo || restoDetails?.DelPhoneNo,
        OrderAddress: orderData.OrderAddress || restoDetails?.OrderAddress,
        OrderAddress2: orderData.OrderAddress2 || restoDetails?.OrderAddress2,
        OrderPin: orderData.OrderPin || restoDetails?.OrderPin,
        OrderPlace: orderData.OrderPlace || restoDetails?.OrderPlace,
        OrderCity: orderData.OrderCity || restoDetails?.OrderCity,
        OrderDist: orderData.OrderDist || restoDetails?.OrderDist,
        OrderGstType: -1,
        OrderSource: "Shop",
      };

      const js1 = JSON.stringify([sumUpOrderMaster]);
      const js2 = JSON.stringify(cart);
      const storedUserYear = localStorage.getItem("UserYear") as string;
      const parts = storedUserYear.split("_");
      const year = parts[1];
      const response = await UpdateB2BOrders(js1, js2, year, "1", orderData.employeeSelect);
      // const response = await GetInvoiceFromOrderByCode(restoDetails.OrderID || 0, restoDetails.OrderDateStr || "", year);
      const action = response[0]?.ActionType;

      if (action > 0) {
        const JSONData1 = JSON.parse(response[0]?.JSONData1);
        setCheckoutData(JSONData1[0]);
        setConfirmPopupOpen(false);
        setPaymentPopupOpen(true);
        // const JSONData2 = JSON.parse(response[0]?.JSONData2);
        // const JSONData5 = JSON.parse(response[0]?.JSONData5);

        // setRestoDetails(JSONData2[0]);
        // if (JSONData5?.length > 0) {
        //   setRestoCurrCart(JSONData5);
        //   saveChangesToStore();
        // }

        fetchDashboardData();
        fetchDataCurrSales();
      } else {
        const err = response[0]?.ErrorMessage;
        toast.warn(err);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCartCheckout = async () => {
    try {
      setLoading(true);
      const requiredFields: { field: string; value: any; label: string }[] = [];

      const { ModeOfDelivery, phone, DelPhoneNo, OrderAddress, OrderPlace, name } = orderData;

      if (ModeOfDelivery === "delivery") {
        if (!phone) requiredFields.push({ field: "phone", value: phone, label: "Order Phone No" });
        if (!OrderAddress) requiredFields.push({ field: "OrderAddress", value: OrderAddress, label: "Delivery Address" });
        if (!OrderPlace) requiredFields.push({ field: "OrderPlace", value: OrderPlace, label: "Order Place" });
        if (!name) requiredFields.push({ field: "name", value: name, label: "Party Name" });
      }

      if (ModeOfDelivery === "takeaway") {
        if (!phone) requiredFields.push({ field: "phone", value: phone, label: "Order Phone No" });
        if (!name) requiredFields.push({ field: "name", value: name, label: "Party Name" });
      }

      if (requiredFields.length > 0) {
        requiredFields.forEach((f) => {
          toast.warn(`${f.label} is required`);
        });
        return; // Stop form submission
      }

      // 🧮 Prepare Order Master
      const sumUpOrderMaster: any = () => {
        const FullOrderAmount = restoCurrCart.reduce((sum, curr) => sum + (curr.OrderAmount || 0), 0);
        const TotAmount = restoCurrCart.reduce((sum, curr) => sum + (curr.TrnAmount || 0), 0);
        const TotItemDiscount = restoCurrCart.reduce((sum, curr) => sum + (curr.ItemDisAmount || 0), 0);
        const GrossAmount = TotAmount;

        const CGSTAmt = restoCurrCart.reduce((sum, curr) => sum + (curr.TrnCGSTAmt || 0), 0);
        const SGSTAmt = restoCurrCart.reduce((sum, curr) => sum + (curr.TrnSGSTAmt || 0), 0);
        const IGSTAmt = restoCurrCart.reduce((sum, curr) => sum + (curr.TrnIGSTAmt || 0), 0);
        const CessAmt = restoCurrCart.reduce((sum, curr) => sum + (curr.TrnCessAmt || 0), 0);
        const GSTAmt = CGSTAmt + SGSTAmt + IGSTAmt;

        const RofAmt = 0;
        const NetAmount = GrossAmount + GSTAmt + CessAmt;

        return {
          ...restoDetails,
          FullOrderAmount,
          TotAmount,
          TotItemDiscount,
          GrossAmount,
          CGSTAmt,
          SGSTAmt,
          IGSTAmt,
          CessAmt,
          GSTAmt,
          RofAmt,
          NetAmount,
          SeatNos: orderData.SeatNos || restoDetails?.SeatNos,
          OrderModeOfDel: orderData.ModeOfDelivery || restoDetails?.OrderModeOfDel,
          PartyName: name || restoDetails?.PartyName,
          OrderPhoneNo: phone || restoDetails?.OrderPhoneNo,
          DelPhoneNo: DelPhoneNo || restoDetails?.DelPhoneNo,
          OrderAddress: OrderAddress || restoDetails?.OrderAddress,
          OrderAddress2: orderData.OrderAddress2 || restoDetails?.OrderAddress2,
          OrderPin: orderData.OrderPin || restoDetails?.OrderPin,
          OrderPlace: OrderPlace || restoDetails?.OrderPlace,
          OrderCity: orderData.OrderCity || restoDetails?.OrderCity,
          OrderDist: orderData.OrderDist || restoDetails?.OrderDist,
          CashPay: orderData.CashPay || restoDetails?.CashPay,
          UPIPay: orderData.UPIPay || restoDetails?.UPIPay,
          OnlinePay: orderData.OnlinePay || restoDetails?.OnlinePay,
          CardPay: orderData.CardPay || restoDetails?.CardPay,
          ChequePay: orderData.ChequePay || restoDetails?.ChequePay,
          CreditPay: orderData.CreditPay || restoDetails?.CreditPay,
          OrderGstType: 0,
          OrderSource: "Shop",
        };
      };

      const js1 = JSON.stringify([sumUpOrderMaster()]);
      const js2 = JSON.stringify(restoCurrCart);
      const storedUserYear = localStorage.getItem("UserYear") as string;
      const parts = storedUserYear.split("_");
      const year = parts[1];
      const response = await UpdateB2BOrders(js1, js2, year, "1", orderData.employeeSelect);
      const action = response[0]?.ActionType;

      if (action > 0) {
        toast.success("Order Submitted");
        fetchDashboardData();
        fetchDataCurrSales();
        // fetchDataGetTableStatusList();
        const JSONData1 = JSON.parse(response[0]?.JSONData1);
        setCheckoutData(JSONData1[0]);
        setPaymentPopupOpen(true);
        setConfirmPopupOpen(false);
      } else {
        const err = response[0]?.ErrorMessage;
        toast.warn(err);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const storedUserYear = localStorage.getItem("UserYear") as string;
      const parts = storedUserYear.split("_");

      let fullData: SalesListInterface = { ...checkoutData } as SalesListInterface;

      if (orderData.CashPay >= "0") {
        fullData!.CashPay = parseFloat(orderData.CashPay) || 0;
      }
      if (orderData.UPIPay >= "0") {
        fullData!.UPIPay = parseFloat(orderData.UPIPay) || 0;
      }
      if (orderData.OnlinePay >= "0") {
        fullData!.OnlinePay = parseFloat(orderData.OnlinePay) || 0;
      }
      if (orderData.CardPay >= "0") {
        fullData!.CardPay = parseFloat(orderData.CardPay) || 0;
      }
      if (orderData.ChequePay >= "0") {
        fullData!.ChequePay = parseFloat(orderData.ChequePay) || 0;
      }
      if (orderData.CreditPay >= "0") {
        fullData!.CreditPay = parseFloat(orderData.CreditPay) || 0;
      }

      const response = await CalculateAndUpdateResBill(fullData);
      const action = response[0]?.ActionType;

      if (action > 0) {
        await removeAll();
        setPaymentPopupOpen(false);
        setOpenLast(true);
        const JSONData1 = response[0]?.JSONData1;
        const JSONData2 = response[0]?.JSONData2;
        toast.success(JSONData1);
        // fetchGetOrderDetailsByCode();
        setOrderData({
          ...orderData,
          SeatNos: "",
          ModeOfDelivery: orderData.ModeOfDelivery || "",
          name: "",
          phone: "",
          DelPhoneNo: "",
          OrderAddress: "",
          OrderAddress2: "",
          OrderPin: "",
          OrderPlace: "",
          OrderCity: "",
          OrderDist: "",
          CashPay: orderData.CashPay >= "0" ? "0" : "",
          UPIPay: orderData.UPIPay >= "0" ? "0" : "",
          OnlinePay: orderData.OnlinePay >= "0" ? "0" : "",
          CardPay: orderData.CardPay >= "0" ? "0" : "",
          ChequePay: orderData.ChequePay >= "0" ? "0" : "",
          CreditPay: orderData.CreditPay >= "0" ? "0" : "",
          MOP: "Cash",
          ReqSvrCode: parseInt(JSONData2),
        });
        // setFormData({ orderId: "0" });
        setTimeout(() => {
          fetchDashboardData();
          fetchDataCurrSales();
        }, 2000);
        // fetchDataGetTableStatusList();
      } else {
        const err = response[0]?.ErrorMessage;
        toast.warn(err);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const createNewOrder = async () => {
    setLoading(true);
    try {
      const currentDate = getCurrentDateFormatted();
      const user = session?.data?.user;
      const userType = user?.UserType;
      const userName = user?.name || "";
      const userYearStr = localStorage.getItem("UserYear") || "";
      const [_, year = "", __, counter = ""] = userYearStr.split("_");

      const isManager = userType === "2";
      const requestUserName = isManager ? orderData.employeeSelect : userName;
      const requestUserCode = isManager && orderData.employeeCode ? orderData.employeeSelect : userName;

      const [orderResponse] = await GetOrderDetailsByCode("0", requestUserName, currentDate, year, requestUserCode);

      if (!orderResponse || orderResponse.ActionType <= 0) {
        toast.warn(orderResponse?.ErrorMessage || "Failed to fetch order details.");
        return;
      }

      const orderDetails: RestoOrderDetailsInterface[] = JSON.parse(orderResponse.JSONData1 || "[]");
      const order = { ...orderDetails[0] };

      // Update order object
      order.SeatNos = orderData.SeatNos;
      order.Counter = counter;
      order.OrderSource = "Shop";

      // Submit updated order
      const [submitResponse] = await UpdateB2BOrders(JSON.stringify([order]), JSON.stringify([]), year, "0", orderData.employeeSelect);

      if (submitResponse?.ActionType > 0) {
        const orderId = submitResponse?.JSONData1 || "0";
        setFormData({ orderId: orderId });
        fetchDashboardData();
        fetchDataCurrSales();
        // fetchDataGetTableoStatusList();
        setOrderData({
          ...orderData,
          SeatNos: "",
          ModeOfDelivery: orderData.ModeOfDelivery || "",
          name: "",
          phone: "",
          DelPhoneNo: "",
          OrderAddress: "",
          OrderAddress2: "",
          OrderPin: "",
          OrderPlace: "",
          OrderCity: "",
          OrderDist: "",
          MOP: "Cash",
          CashPay: orderData.CashPay >= "0" ? "0" : "",
          UPIPay: orderData.UPIPay >= "0" ? "0" : "",
          OnlinePay: orderData.OnlinePay >= "0" ? "0" : "",
          CardPay: orderData.CardPay >= "0" ? "0" : "",
          ChequePay: orderData.ChequePay >= "0" ? "0" : "",
          CreditPay: orderData.CreditPay >= "0" ? "0" : "",
        });
      } else {
        toast.warn(submitResponse?.ErrorMessage || "Order update failed.");
      }
    } catch (error) {
      console.error("Error in createNewOrder:", error);
      toast.error("An unexpected error occurred while creating the order.");
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
        PartyID: da.partycode,
        PartyName: da.PartyName,
        ReqStatusType: da.PaymentStatus === "Credit" ? "Credit" : "Paid",
      });
      setMopModal(true);
    } else {
      const err = response?.ErrorMessage;
      toast.warn(err);
    }
  };

  const handleCancelOrder = async () => {
    Swal.fire({
      title: "Cancel this order?",
      text: "Are you sure you want to cancel this order? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it",
      cancelButtonText: "No, keep it",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await CancelDeleteOrderByCode(restoDetails.OrderID?.toString() || "", "1");
          const action = response[0]?.ActionType;
          if (action > 0) {
            toast.success("Order canceled successfully.");
            await removeAll();
            setOrderData({ ...orderData, SeatNos: "" });
            // setFormData({ orderId: "0" });
            fetchDashboardData();
          } else {
            const err = response[0]?.ErrorMessage;
            toast.warn(err);
          }
        } catch (error) {
          console.error("Error in handleCancelOrder:", error);
          toast.error("An unexpected error occurred while canceling the order.");
        }
      }
    });
  };

  const handleUpdateStockOutTypeStatus = async (item: StockItemType) => {
    let productUpdateType = item.TYPE === "Active" ? "StockOut" : "Active";
    Swal.fire({
      title: item.TYPE === "Active" ? "Mark item as Out of Stock?" : "Restore item to Active?",
      text:
        item.TYPE === "Active"
          ? "This will mark the item as 'Out of Stock' and make it unavailable for new orders."
          : "This will restore the item to 'Active' and make it available for ordering again.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: item.TYPE === "Active" ? "Yes, mark as Out of Stock" : "Yes, restore item",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await UpdateStockOutTypeStatus(item.SVRSTKID, productUpdateType);
          const action = response[0]?.ActionType;
          if (action > 0) {
            fetchFullList();
            let JSONData1Remarks = response[0]?.JSONData1Remarks;
            toast.success(JSONData1Remarks);
          } else {
            const err = response[0]?.ErrorMessage;
            toast.warn(err);
          }
        } catch (error) {
          console.error("Error in handleUpdateStockOutTypeStatus:", error);
          toast.error("An unexpected error occurred while canceling the order.");
        }
      }
    });
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

    type PaymentKeys = "CashPay" | "CardPay" | "OnlinePay" | "UPIPay" | "ChequePay" | "CreditPay";
    const paymentKeys: PaymentKeys[] = ["CashPay", "CardPay", "OnlinePay", "UPIPay", "ChequePay", "CreditPay"];

    const activePayments = paymentKeys.filter((k) => {
      const val = parseFloat(orderData?.[k] || "0");
      return val > 0;
    });

    const cashPay = parseFloat(orderData?.CashPay || "0") || 0;

    if (discount > 0 && activePayments.length === 1 && activePayments[0] === "CashPay") {
      const adjustedCashPay = Math.max(0, originalAmount - discount).toFixed(2);
      if (cashPay !== parseFloat(adjustedCashPay)) {
        setOrderData((prev) => ({
          ...prev,
          CashPay: adjustedCashPay,
        }));
      }
    }
  }, [mopData?.disper, mopData?.BLLTaxableAmt, mopData?.BillEstimateAmount]);

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
      if (credit > 0 && orderData.PartyName.trim() === "") {
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
        setPaymentPopupOpen(false);
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

  const handlePrintOrderToken = async (Id: string) => {
    try {
      setLoading(true);
      const storedUserYear = localStorage.getItem("UserYear") as string;
      const parts = storedUserYear.split("_");
      const year = parts[1];
      const response = await PrintRestTockenByCode(Id, year);
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
      let user = parts[0];
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

  const handleOrderView = async (id: number) => {
    const currentDate = getCurrentDateFormatted();
    const user = session?.data?.user;
    const userType = user?.UserType;
    const userName = user?.name || "";
    const userYearStr = localStorage.getItem("UserYear") || "";
    const [_, year = "", __, counter = ""] = userYearStr.split("_");

    const isManager = userType === "2";
    const requestUserName = isManager ? orderData.employeeSelect : userName;
    const requestUserCode = isManager && orderData.employeeCode ? orderData.employeeSelect : userName;

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetAccountAndPartyListSearch();
        const partyList = response?.PartyList || [];
        const sundry = partyList.filter((item: AccountInterface) => item.Groups === "Sundry Creditors" || item.Groups === "Sundry Debtors");
        const others = partyList.filter((item: AccountInterface) => item.Groups === "Bank Account");
        setPartyList(sundry);
        setBankList(others);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

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

  return (
    <div>
      {loading && <Spinner />}

      <Dialog open={openLast} as="div" className="relative z-50 focus:outline-none" onClose={setOpenLast}>
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
                  <div className="mx-auto w-full px-4 sm:px-6">
                    <div className="grid grid-cols-1">
                      <div className="flex justify-center items-center">
                        <div className="pro-detail w-full">
                          <div className="grid grid-cols-1 gap-2">
                            <div className="p-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setPrintInvoiceId(orderData.ReqSvrCode);
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

      {tableModal && (
        <>
          <CustomFunctionalModal close={setTableModal} title="Seat Arrangment">
            <TableSeatSelector
              data={tableData}
              close={setTableModal}
              setFormData={setFormData}
              formData={formData}
              currentSeatNos={orderData.SeatNos}
              createNewOrder={createNewOrder}
              handleCartSubmit={handleCartSubmit}
              onSelect={(selected) => {
                setOrderData({ ...orderData, SeatNos: selected });
              }}
            />
          </CustomFunctionalModal>
        </>
      )}

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
              handleRefresh={fetchDashboardData}
              handleView={handleOrderView}
              setFormData={setFormData}
              handlePrintOrder={handlePrintOrder}
            />
          </CustomFunctionalModal>
        </>
      )}

      {pdfModal && (
        <CustomFunctionalModal close={setPdfModal} title="">
          <div className="min-w-96 md:min-w-[800px] w-full">
            <PdfViewer url={pdfLink} />
          </div>
        </CustomFunctionalModal>
      )}

      <div className="p-2 mt-16 lg:mt-0 min-h-screen bg-blue-50">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button className="hidden" />
          </SheetTrigger>
          <SheetContent className="w-[90vw] md:w-[45vw]" side="right">
            <SheetHeader>
              <SheetTitle className="font-montserrat font-semibold text-xl px-3 py-1.5">Cart</SheetTitle>
              <SheetDescription className="text-sm px-3 text-gray-600 flex flex-col">
                <div className="flex justify-between font-montserrat font-normal px-3 text-sm text-gray-600">
                  <span>Order No. {restoDetails.OrderNo}</span>
                  <span>Table No. {restoDetails.SeatNos}</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  <input
                    value={orderData.name || ""}
                    onChange={(e) => setOrderData({ ...orderData, name: e.target.value })}
                    placeholder="Customer Name"
                    className="border rounded px-2 py-1 text-sm max-w-32"
                  />
                  <input
                    value={orderData.DelPhoneNo || ""}
                    onChange={(e) => setOrderData({ ...orderData, DelPhoneNo: e.target.value })}
                    type="tel"
                    placeholder="Phone Number"
                    className="border rounded px-2 py-1 text-sm max-w-32"
                  />
                </div>
              </SheetDescription>
            </SheetHeader>

            <Card className="p-3 mt-4 space-y-3 max-h-[50vh] overflow-auto shadow-md rounded-xl">
              {restoCurrCart?.map((item: RestoBlankItemInterface, index) => {
                const itemTotal = item.OrderQty * item.OrderRate;
                if (item.DelFlag > 0) return null;

                return (
                  <div key={index} className="flex items-center justify-between gap-3 border-b pb-3">
                    {/* Item Info */}
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">{item.itm_NAM}</div>
                      <div className="text-sm text-gray-600">
                        ₹{item.OrderRate} × {item.OrderQty} = <span className="font-medium text-pink-600">₹{itemTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Quantity Control */}
                    <div className="flex gap-2 items-center">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          removeItem2(item);
                        }}
                      >
                        <HiMinusSmall size={20} />
                      </Button>
                      <input
                        type="number"
                        value={item.OrderQty}
                        readOnly
                        className="w-12 text-center border focus:ring-0 focus:border-0 rounded font-montserrat font-medium text-slate-800 bg-white"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          addItem2(item);
                        }}
                      >
                        <HiOutlinePlus size={20} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </Card>

            {/* Total & Save */}
            <div className="mt-4 px-3 text-lg font-bold text-right text-slate-800">
              Total: ₹{restoCurrCart?.reduce((acc, item) => acc + item.OrderQty * item.OrderRate, 0).toFixed(2)}
            </div>
            <SheetFooter className="mt-4 flex flex-wrap gap-1">
              <SheetClose asChild>
                <Button
                  type="button"
                  onClick={() => {
                    if (restoCurrCart?.length > 0) {
                      setConfirmPopupOpen(true);
                    } else {
                      toast.warn("Please Add product to cart");
                      setSheetOpen(false);
                    }
                  }}
                  className="w-full my-1 sm:my-0 bg-pink-500 hover:bg-pink-600 text-white text-md font-semibold rounded-xl py-2 shadow-lg transition-all"
                >
                  Submit
                </Button>
              </SheetClose>

              <SheetClose asChild>
                <div className="flex w-full gap-2">
                  <Button
                    type="button"
                    onClick={() => handlePrintOrderToken(restoDetails.OrderID?.toString() || "")}
                    variant="secondary"
                    className="w-1/2 text-md font-semibold rounded-xl py-2 shadow transition-all"
                  >
                    Print Token
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handlePrintOrder(restoDetails.OrderID?.toString() || "")}
                    variant="secondary"
                    className="w-1/2 text-md font-semibold rounded-xl py-2 shadow transition-all"
                  >
                    Print Order
                  </Button>
                </div>
              </SheetClose>

              <SheetClose asChild>
                <Button
                  type="button"
                  onClick={() => handleCancelOrder()}
                  variant="outline"
                  className="w-full my-1 sm:my-0 text-md font-semibold rounded-xl py-2 shadow transition-all"
                >
                  Cancel
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <div className="grid grid-cols-12 gap-1">
          <div
            className={`fixed md:relative z-30 md:z-0 bg-white border-r border-gray-300 p-4 h-full overflow-y-auto transition-transform duration-300 ease-in-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } w-3/4 md:w-auto col-span-3 md:col-span-2`}
          >
            <div className="flex flex-col gap-3">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const isExpandable = cat !== "All" && subCat.some((s) => s.category === cat);
                const isExpanded = expandedCategories.includes(cat);

                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between">
                      {/* Category Button */}
                      <button
                        onClick={() => {
                          setSelectedCategory(cat);
                          setSelectedSub("");
                          // Close sidebar on mobile when category is selected (but not expanded)
                          if (window.innerWidth < 786) setSidebarOpen(false);
                        }}
                        className={`flex-1 text-left truncate font-semibold font-montserrat px-2 py-1 rounded ${
                          isSelected ? "text-pink-600" : "text-slate-900"
                        } hover:bg-gray-100`}
                      >
                        {cat}
                      </button>

                      {/* Accordion Arrow - Only show if expandable */}
                      {isExpandable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent category selection
                            toggleExpand(cat);
                          }}
                          className="p-1 hover:bg-gray-100 rounded transition-transform duration-200"
                        >
                          <svg
                            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? "rotate-90" : "rotate-0"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Subcategories */}
                    {isExpandable && isExpanded && (
                      <div className="ml-6 mt-1 flex flex-col gap-1">
                        {subCat
                          .filter((s) => s.category === cat)
                          .map((sub, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setSelectedCategory(cat);
                                setSelectedSub(sub.subCategory);
                                // Close sidebar on mobile when subcategory is selected
                                if (window.innerWidth < 786) setSidebarOpen(false);
                              }}
                              className={`text-sm text-left font-normal font-workSans truncate px-2 py-1 rounded ${
                                selectedSub === sub.subCategory ? "text-pink-500 !font-semibold bg-pink-50" : "text-gray-500"
                              } hover:text-black hover:bg-gray-50`}
                            >
                              — {sub.subCategory}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-span-12 md:col-span-10">
            <Card className="p-4">
              <div className="bg-stone-200 rounded-md border border-solid items-start px-2 md:mt-0 mt-3 mb-2 py-2 border-stone-700 shadow-md flex flex-col gap-2">
                {/* Back Button on top */}

                <div className="flex flex-col w-full gap-2 md:flex-row md:items-center md:justify-between md:flex-wrap">
                  {/* Top Row: Back Button + Mobile 3-dot menu */}
                  <div className="flex items-center justify-between w-full md:w-auto">
                    <div className="flex flex-wrap items-center justify-start">
                      <div className="flex justify-start items-center w-fit flex-row bg-blue-500 text-white font-medium text-xs capitalize shadow-lg rounded-md p-2">
                        <button onClick={() => router.back()} className="flex flex-row gap-2">
                          <IoArrowBackSharp />
                        </button>
                      </div>
                    </div>
                    <div className="md:hidden font-montserrat font-medium text-sm items-center gap-2">
                      <p>#{restoDetails.OrderNo}</p>
                    </div>
                    <div
                      onClick={() => setTableModal(true)}
                      onDoubleClick={() => {
                        setShowSeatPopup(true);
                      }}
                      className="md:hidden font-montserrat flex gap-2 items-center font-medium text-sm bg-white px-2 py-1 rounded shadow-sm border border-gray-300 cursor-pointer"
                    >
                      <Image src={tableIcon} height={200} width={200} alt="table icon" className="size-5 z-10" />
                    </div>
                    <div
                      onClick={() => setIsEmployeeModalOpen(true)}
                      className="md:hidden font-montserrat flex gap-2 items-center font-medium text-sm bg-white px-2 py-1 rounded shadow-sm border border-gray-300 cursor-pointer"
                    >
                      <Image src={employee} height={200} width={200} alt="table icon" className="size-5 z-10" />
                      {orderData.employeeSelect && <span className="text-gray-700">{orderData.employeeSelect}</span>}
                    </div>
                    <div className="md:hidden flex items-center gap-2">
                      <button
                        onClick={() => setShowMobileOptions(!showMobileOptions)}
                        className="p-1 border border-gray-300 rounded bg-white"
                      >
                        <HiDotsVertical size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Search input + mobile cart icon (same line) */}
                  <div className="w-full md:w-auto flex justify-between items-center gap-2">
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      type="text"
                      className="flex-1 border rounded px-2 py-1 text-sm font-montserrat font-normal"
                      placeholder="search.."
                    />

                    {/* Cart icon for mobile only */}
                    <div className="relative md:hidden">
                      <div className="absolute top-0">
                        <p className="-mt-2 -ms-2 font-mukta font-medium text-sm rounded-full bg-green-500 text-white h-5 w-5 border-white border flex items-center justify-center p-1">
                          {restoCurrCart?.length}
                        </p>
                      </div>
                      <button
                        onClick={() => setSheetOpen(true)}
                        className="p-1.5 border-2 border-solid border-gray-200 bg-white rounded-md text-green-400"
                      >
                        <Image height={200} width={200} src={dineIcon} alt="cart icon" className="size-8 z-10" />
                      </button>
                    </div>
                  </div>

                  {/* All other options (conditionally shown on mobile) */}
                  <div className="flex items-center gap-4 flex-wrap md:ml-auto">
                    {(showMobileOptions || (typeof window !== "undefined" && window.innerWidth >= 768)) && (
                      <>
                        <div
                          onClick={() => setSaleModal(true)}
                          className="font-montserrat flex gap-2 items-center font-medium text-sm bg-white px-2 py-1 rounded shadow-sm border border-gray-300 cursor-pointer"
                        >
                          <Image src={saleIcon} height={200} width={200} alt="order icon" className="size-8 z-10" />
                          Sales
                        </div>
                        <div
                          onClick={() => setOrderModal(true)}
                          className="font-montserrat flex gap-2 items-center font-medium text-sm bg-white px-2 py-1 rounded shadow-sm border border-gray-300 cursor-pointer"
                        >
                          <Image src={orderIcon} height={200} width={200} alt="order icon" className="size-8 z-10" />
                          Order
                        </div>
                        <div className="md:hidden block">
                          <button
                            onClick={() => {
                              setSidebarOpen(true);
                            }}
                            className="font-montserrat gap-2 items-center font-medium text-sm bg-white px-2 py-1 rounded shadow-sm border border-gray-300 cursor-pointer"
                          >
                            <RiFilter2Fill size={20} />
                          </button>
                        </div>
                        <div className="md:hidden block">
                          <button
                            onClick={() => {
                              router.push("/cash-counter");
                            }}
                            title="Go to Cash Counter"
                            className={`font-montserrat gap-2 items-center font-medium text-sm bg-white px-2 py-1 rounded shadow-sm border border-gray-300 cursor-pointer ${
                              orderData.userRole === "admin" || orderData.userRole === "counter" ? "" : "hidden"
                            }`}
                          >
                            <Image src={cashcounter} height={200} width={200} alt="table icon" className="size-8 z-10" />{" "}
                          </button>
                        </div>
                        <div className="md:hidden block">
                          <button
                            onClick={() => {
                              router.push("/instant-bill");
                            }}
                            title="Generate Instant Bill"
                            className="font-montserrat gap-2 items-center font-medium text-sm bg-white px-2 py-1 rounded shadow-sm border border-gray-300 cursor-pointer"
                          >
                            <Image src={billCounter} height={200} width={200} alt="table icon" className="size-8 z-10" />{" "}
                          </button>
                        </div>

                        <div className="font-montserrat flex gap-2 items-center font-medium text-sm bg-white px-2 py-1 rounded shadow-sm border border-gray-300 cursor-pointer">
                          <Image src={ordrnoIcon} height={200} width={200} alt="order icon" className="size-8 z-10" />
                          <span className="text-gray-700 font-semibold">#{restoDetails.OrderNo ?? 0}</span>
                        </div>

                        <div
                          onClick={() => setIsEmployeeModalOpen(true)}
                          className="font-montserrat hidden md:flex gap-2 items-center font-medium text-sm bg-white px-2 py-1 rounded shadow-sm border border-gray-300 cursor-pointer"
                        >
                          <Image src={employee} height={200} width={200} alt="table icon" className="size-8 z-10" />
                          {orderData.employeeSelect && <span className="text-gray-700">{orderData.employeeSelect}</span>}
                        </div>
                        <div
                          onClick={() => router.push("/cash-counter")}
                          title="Go to Cash Counter"
                          className="font-montserrat hidden md:flex gap-2 items-center font-medium text-sm bg-white px-2 py-1 rounded shadow-sm border border-gray-300 cursor-pointer"
                        >
                          <Image src={cashcounter} height={200} width={200} alt="table icon" className="size-8 z-10" />
                        </div>

                        <div
                          onClick={() => router.push("/instant-bill")}
                          title="Generate Instant Bill"
                          className="font-montserrat hidden md:flex gap-2 items-center font-medium text-sm bg-white px-2 py-1 rounded shadow-sm border border-gray-300 cursor-pointer"
                        >
                          <Image src={billCounter} height={200} width={200} alt="table icon" className="size-8 z-10" />
                        </div>

                        <div
                          onClick={() => setTableModal(true)}
                          onDoubleClick={() => {
                            setShowSeatPopup(true);
                          }}
                          className="font-montserrat hidden md:flex gap-2 items-center font-medium text-sm bg-white px-2 py-1 rounded shadow-sm border border-gray-300 cursor-pointer"
                        >
                          <Image src={tableIcon} height={200} width={200} alt="table icon" className="size-8 z-10" />
                        </div>
                        <h2 className="font-montserrat font-medium text-sm">
                          Total: <span className="text-red-500 text-base">₹{total}</span>
                        </h2>
                        <h2 className="font-montserrat font-medium text-sm">
                          Cat:{" "}
                          <span className="text-red-500 text-base">
                            {selectedCategory}-{selectedSub}
                          </span>
                        </h2>
                      </>
                    )}

                    {/* Cart icon for desktop only */}
                    <div className="relative hidden md:block">
                      <div className="absolute top-0">
                        <p className="-mt-2 -ms-2 font-mukta font-medium text-sm rounded-full bg-green-500 text-white h-5 w-5 border-white border flex items-center justify-center p-1">
                          {restoCurrCart?.length}
                        </p>
                      </div>
                      <button
                        onClick={() => setSheetOpen(true)}
                        className="p-1.5 border-2 border-solid border-gray-200 bg-white rounded-md text-green-400"
                      >
                        <Image height={200} width={200} src={dineIcon} alt="cart icon" className="size-8 z-10" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 max-h-[85vh] overflow-auto">
                {filterFullProduct
                  .filter((item: StockItemType) => {
                    const categoryMatch = selectedCategory === "All" || item.ProductGroup === selectedCategory;
                    const subCategoryMatch = selectedSub ? item.subgrp === selectedSub : true;
                    return categoryMatch && subCategoryMatch;
                  })
                  .map((item: StockItemType, index) => {
                    const selectedItem = restoCurrCart.find((i) => i.itm_NAM === item.itm_NAM);
                    const isSelected = !!selectedItem;

                    let img = item.ImageFiles ? item.ImageFiles.split("|")[1] : "";
                    let url = img ? `${process.env.NEXT_PUBLIC_WEBSERVICE_URL_REACT_IMAGE_URL}/${img}` : cocnut;
                    return (
                      <>
                        <></>
                        <div
                          key={index}
                          className="border rounded-lg overflow-hidden flex flex-col items-center justify-between p-2 relative transition-all"
                        >
                          <div className="w-full h-full relative">
                            <button type="button" className="w-full h-32 flex items-center justify-center">
                              <img src={url} alt={item.itm_NAM} className="w-full h-32 object-cover rounded-md" />
                            </button>

                            <button
                              className={`absolute bottom-1 right-1 ${
                                item.TYPE !== "Active" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                              } text-white p-1 rounded-full shadow-md transition`}
                              title={item.TYPE === "Active" ? "Mark as Out of Stock" : "Restore item"}
                              onClick={() => handleUpdateStockOutTypeStatus(item)}
                            >
                              {item.TYPE !== "Active" ? <HiArrowUturnLeft size={20} /> : <HiArrowUturnRight size={20} />}
                            </button>
                          </div>

                          <div className="text-pink-500 font-semibold mt-2">₹ {parseFloat(item.SalePrice).toFixed(2)}</div>
                          <div className="text-sm text-center mt-1 font-medium">{item.itm_NAM}</div>

                          {item.TYPE !== "StockOut" && !isSelected ? (
                            <button
                              onClick={() => {
                                if (orderData.SeatNos) {
                                  setPopupProduct(item);
                                  setPopupQty(1);
                                } else {
                                  toast.info("Please select a seat first");
                                  // setTableModal(true);
                                }
                              }}
                              className="mt-2 bg-pink-500 text-white w-8 h-8 flex items-center justify-center rounded-full text-xl transition-all duration-500 ease-in-out transform hover:scale-110"
                            >
                              <HiOutlinePlus size={25} />
                            </button>
                          ) : (
                            item.TYPE !== "StockOut" && (
                              <div className="flex items-center mt-2 bg-pink-500 text-white rounded-full px-1.5 py-1 transition-all duration-500 ease-in-out transform hover:scale-105">
                                <button onClick={() => removeItem(item)} className="text-2xl px-1">
                                  <HiMinusSmall size={25} />
                                </button>
                                <span className="px-2">{selectedItem?.OrderQty}</span>
                                <button onClick={() => addItem(item)} className="text-2xl px-1">
                                  <HiOutlinePlus size={25} />
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      </>
                    );
                  })}
              </div>
            </Card>
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
                          <td className="px-2 py-1 text-center">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => {
                                  removeItem2(item);
                                }}
                                className="px-2 bg-gray-200 hover:bg-gray-300"
                              >
                                -
                              </button>
                              <span className="px-2">{item.OrderQty}</span>
                              <button
                                onClick={() => {
                                  addItem2(item);
                                }}
                                className="px-2 bg-gray-200 hover:bg-gray-300"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-2 py-1 text-right">₹{(item.OrderQty * item.OrderRate).toFixed(2)}</td>
                          <td className="px-2 py-1 text-center">
                            <button
                              onClick={() => {
                                removeItem3(item);
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bill Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 font-montserrat font-medium">
                <div className="col-span-1">GST: {totalGstPer}%</div>
                {/* <div className="col-span-1">Tax {gPerc}%</div> */}
                <div className="col-span-1 grid grid-rows-3 font-normal">
                  {/* <p>GST: {totalGstPer}%</p> */}
                  <p>CGST: {totaltCgstPer}%</p>
                  <p>SGST: {totalSgstPer}%</p>
                  <p>IGST: {totalIgstPer}%</p>
                </div>
                <div className="col-span-1">Gross Total: {restoDetails.GrossAmount}</div>
                <div className="col-span-1">
                  GST Amount:
                  {(restoDetails.CGSTAmt ?? 0) + (restoDetails.SGSTAmt ?? 0) + (restoDetails.IGSTAmt ?? 0)}
                </div>
                <div className="col-span-2">
                  Round Off:
                  {(
                    (restoDetails.NetAmount ?? 0) -
                    ((restoDetails.GrossAmount ?? 0) +
                      ((restoDetails.CGSTAmt ?? 0) + (restoDetails.SGSTAmt ?? 0) + (restoDetails.IGSTAmt ?? 0)) +
                      (restoDetails.CessAmt ?? 0))
                  ).toFixed(2)}
                </div>
                <div className="col-span-2 font-semibold text-lg">Total: {restoDetails.NetAmount}</div>
              </div>

              {/* Order Type */}
              <div className="flex gap-6 mt-6 font-montserrat font-medium flex-wrap items-center">
                {["DINE-IN", "TAKEAWAY", "DELIVERY"].map((type) => (
                  <label key={type} className="flex items-center gap-2 font-medium text-sm">
                    <input
                      type="radio"
                      name="ModeOfDelivery"
                      value={type}
                      checked={orderData.ModeOfDelivery === type}
                      onChange={(e) => {
                        const val = e.target.value;
                        // setOrderType(val);
                        setOrderData({
                          ...orderData,
                          ModeOfDelivery: val,
                        });
                      }}
                    />
                    {type}
                  </label>
                ))}

                <select name="" className="mx-2 border rounded px-2 py-1 text-sm" id="">
                  {POSdata?.map((item: PrinterInterface) => {
                    return (
                      <>
                        <option key={item.PrinterID} value={item.PrinterID}>
                          {item.PrinterOSName}
                        </option>
                      </>
                    );
                  })}
                </select>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 font-montserrat font-medium">
                {/* <p className="border rounded px-2 col-span-2 py-1 text-sm w-fit">Table No.: {orderData.SeatNos}</p> */}
                <hr className="col-span-2" />
                <input
                  value={orderData.name || ""}
                  onChange={(e) => setOrderData({ ...orderData, name: e.target.value })}
                  placeholder="Customer Name"
                  className="border rounded px-2 py-1 text-sm"
                />
                <input
                  value={orderData.DelPhoneNo || ""}
                  onChange={(e) => setOrderData({ ...orderData, DelPhoneNo: e.target.value })}
                  type="tel"
                  placeholder="Phone Number"
                  className="border rounded px-2 py-1 text-sm"
                />
                <input
                  value={orderData.OrderAddress || ""}
                  onChange={(e) => setOrderData({ ...orderData, OrderAddress: e.target.value })}
                  placeholder="Delivery Address"
                  className="border rounded col-span-2 px-2 py-1 text-sm"
                />
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
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleCartSubmit();
                  }}
                  type="button"
                  className="px-4 py-2 bg-lime-500 text-white rounded"
                >
                  update
                </button>
                <button
                  onClick={() => {
                    handleCartKOT();
                  }}
                  type="button"
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  KOT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCartCheckout();
                  }}
                  disabled={restoDetails?.SvrCode === 0 && restoDetails?.OrderID === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded font-semibold"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {paymentPopupOpen && (
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

              {/* Payment Details */}
              <div className="text-sm bg-gray-100 p-3 rounded mb-4">
                <div className="flex justify-between mb-1">
                  <span>Total Items:</span>
                  <span>{restoCurrCart.length}</span>
                </div>
                <div className="flex justify-between mb-1 font-semibold">
                  <span>Total Amount:</span>
                  <span>₹{checkoutData!.BILLAMOUNT}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setPaymentPopupOpen(false)} className="px-4 py-1 rounded-md bg-gray-300">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // setPaymentPopupOpen(false);
                    handleSubmit();
                  }}
                  className="px-4 py-1 rounded-md bg-green-600 text-white font-semibold"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {salesView && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white w-[90vw] max-w-full rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">View</h3>
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
                {checkoutData?.PaymentStatus === "Pending" && (orderData.userRole === "admin" || orderData.userRole === "counter") && (
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

        {mopModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white rounded shadow-lg w-full max-w-2xl p-6 max-h-[80vh] overflow-auto">
              <h2 className="text-xl font-semibold text-center mb-1 font-poppins">Hotel Billing Summary</h2>
              <p className="text-center font-medium mb-2">Amount to pay: ₹{mopData?.BillEstimateAmount?.toFixed(2) ?? "0.00"}</p>

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
                    <input
                      value={orderData.PartyPhone}
                      type="text"
                      placeholder="party phone"
                      className="border rounded px-2 py-1 text-sm"
                    />
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

              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setSaleModal(true);
                    setMopModal(false);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleMOPSubmit()}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {popupProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-80 text-center relative">
              <button onClick={() => setPopupProduct(null)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">
                ✕
              </button>
              <img
                src={
                  popupProduct.ImageFiles
                    ? `${process.env.NEXT_PUBLIC_WEBSERVICE_URL_REACT_IMAGE_URL}/${popupProduct.ImageFiles.split("|")[1]}`
                    : cocnut
                }
                alt={popupProduct.itm_NAM}
                className="w-full h-40 object-cover rounded-md"
              />
              <h3 className="text-lg font-semibold mt-3">{popupProduct.itm_NAM}</h3>
              <p className="text-pink-500 font-bold text-xl mt-1">₹ {parseFloat(popupProduct.SalePrice).toFixed(2)}</p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={() => setPopupQty((prev) => Math.max(prev - 1, 1))}
                  className="text-2xl bg-pink-100 text-pink-600 w-8 h-8 rounded-full flex items-center justify-center"
                >
                  <HiMinusSmall size={20} />
                </button>
                <input
                  ref={qtyRef}
                  type="tel"
                  value={popupQty}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setPopupQty(isNaN(val) || val < 1 ? 1 : val);
                  }}
                  className="w-12 text-center border border-gray-300 rounded-md text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <button
                  onClick={() => setPopupQty((prev) => prev + 1)}
                  className="text-2xl bg-pink-100 text-pink-600 w-8 h-8 rounded-full flex items-center justify-center"
                >
                  <HiOutlinePlus size={20} />
                </button>
              </div>

              <button
                onClick={async () => {
                  await addItem(popupProduct, popupQty);
                  setPopupProduct(null); // Close popup
                }}
                className="mt-4 w-full bg-pink-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-pink-600 transition"
              >
                Add to Cart
              </button>
            </div>
          </div>
        )}

        {showSeatPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded shadow-lg">
              <p className="text-lg font-semibold">Seat No: {orderData.SeatNos}</p>
              <button onClick={() => setShowSeatPopup(false)} className="mt-2 px-4 py-1 bg-pink-500 text-white rounded">
                Close
              </button>
            </div>
          </div>
        )}

        {isEmployeeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-sm">
              <h2 className="text-lg font-semibold mb-3">Select Employee</h2>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {userTypes.map((emp, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setIsEmployeeModalOpen(false);
                      setOrderData({ ...orderData, employeeCode: emp.EMPAUTOID, employeeSelect: emp.EMPCODE });
                    }}
                    className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded border border-gray-200"
                  >
                    {emp.EmpName}-<small className="font-montserrat font-normal">{emp.EMPCODE}</small>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setIsEmployeeModalOpen(false)}
                className="mt-4 w-full text-sm py-2 px-4 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
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
      </div>
    </div>
  );
};

export default Page;
