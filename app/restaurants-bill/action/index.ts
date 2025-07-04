import { SalesListInterface } from "@/types";

export const GetStockItemListJasonRestarants = async () => {
  try {
    const response = await fetch("/restaurants-bill/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "GetStockItemListJason",
        description: "",
        ReqYear: "",
        ReqDate: "",
        ReqUserID: "",
        ReqUserTypeID: "",
      }),
    });
    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error: any) {
    console.error("GetStockItemListJasonRestarants failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const GetStockOrderMasterListJason = async (ReqDate: string, ReqUserID: string, ReqUserTypeID: string, ReqYear: string) => {
  try {
    const response = await fetch("/restaurants-bill/api/GetStockOrderMasterListJason", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "GetStockOrderMasterListJason",
        description: "demo",
        ReqYear: ReqYear,
        ReqDate: ReqDate,
        ReqUserID: ReqUserID,
        ReqUserTypeID: ReqUserTypeID,
      }),
    });
    if (response.ok) {
      const responseData = await response.json();
      return responseData.userdata;
    }
  } catch (error: any) {
    console.error("GetStockOrderMasterListJason failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const GetOrderDetailsByCode = async (
  ReqOrderID: string,
  ReqUserName: string,
  ReqOrderDate: string,
  ReqAcaStart: string,
  ReqUserCode: string
) => {
  try {
    const response = await fetch("/restaurants-bill/api/GetOrderDetailsByCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "GetOrderDetailsByCode",
        description: "demo",
        ReqOrderID: ReqOrderID,
        ReqUserName: ReqUserName,
        ReqOrderDate: ReqOrderDate,
        ReqAcaStart: ReqAcaStart,
        ReqUserCode: ReqUserCode,
      }),
    });
    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error: any) {
    console.error("GetOrderDetailsByCode failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const GetItemMasterByCode = async (ReqItemCode: string, ReqPartyCode: string) => {
  try {
    const response = await fetch("/restaurants-bill/api/GetItemMasterByCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "GetItemMasterByCode",
        description: "demo",
        ReqItemCode: ReqItemCode,
        ReqPartyCode: ReqPartyCode,
        ReqWithStock: "yes",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text(); // in case server sends readable error
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error: any) {
    console.error("GetItemMasterByCode failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const UpdateB2BOrders = async (
  ReqJSonData: string,
  ReqJSonData2: string,
  ReqAcaStart: string,
  ReqUpdateType: string,
  ReqUserCode: string
) => {
  try {
    const response = await fetch("/restaurants-bill/api/UpdateB2BOrders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "UpdateB2BOrders",
        description: "Request For EmployeeMaster Update",
        ReqJSonData: ReqJSonData,
        ReqJSonData2: ReqJSonData2,
        ReqTransID: 2,
        ReqEntryMode: 0,
        ReqAcaStart: ReqAcaStart,
        ReqUpdateType: ReqUpdateType,
        ReqUserCode: ReqUserCode,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error: any) {
    console.error("UpdateB2BOrders failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const GetTableTMasterList = async () => {
  try {
    const response = await fetch("/restaurants-bill/api/GetTableTMasterList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "GetTableTMasterList",
        description: "Request For Table Master List",
        ReqMode: 10,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error: any) {
    console.error(" GetTableTMasterList failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};
export const GetTableStatusList = async () => {
  try {
    const response = await fetch("/restaurants-bill/api/GetTableStatusList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "GetTableStatusList",
        description: "Request For Table Master List",
        ReqMode: 10,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error: any) {
    console.error(" GetTableStatusList failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};
export const GetInvoiceFromOrderByCode = async (ReqOrderID: number, ReqOrderDate: string, ReqAcaStart: string, ReqUserCode: string) => {
  try {
    const response = await fetch("/restaurants-bill/api/GetInvoiceFromOrderByCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "GetInvoiceFromOrderByCode",
        description: "Request For Table Master List",
        ReqOrderID: ReqOrderID,
        ReqOrderDate: ReqOrderDate,
        ReqEntryMode: 1,
        ReqAcaStart: ReqAcaStart,
        ReqUserCode: ReqUserCode,
        ReqTransID: 2,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error: any) {
    console.error(" GetInvoiceFromOrderByCode failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const CalculateAndUpdateResBill = async (ReqJSonData: SalesListInterface) => {
  try {
    const response = await fetch("/restaurants-bill/api/CalculateAndUpdateResBill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "CalculateAndUpdateResBill",
        description: "update and calculate sales bill",
        ReqJSonData: JSON.stringify([ReqJSonData]),
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error: any) {
    console.error(" CalculateAndUpdateResBill failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const GetSalesRestBillingList = async (ReqFdate: string, ReqTdate: string, ReqSaleUser?: string) => {
  try {
    const response = await fetch("/restaurants-bill/api/GetSalesRestBillingList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "GetSalesRestBillingList",
        description: "update and calculate sales bill",
        ReqFdate: ReqFdate,
        ReqTdate: ReqTdate,
        ReqSaleUser: ReqSaleUser,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error: any) {
    console.error(" GetSalesRestBillingList failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const PrintRestInvoiceByCode = async (ReqSvrcode: number, ReqAcaStart: string, ReqUser: string) => {
  try {
    const response = await fetch("/restaurants-bill/api/PrintRestInvoiceByCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "PrintRestInvoiceByCode",
        description: "update and calculate sales bill",
        ReqSvrcode: ReqSvrcode,
        ReqAcaStart: ReqAcaStart,
        ReqUser: ReqUser,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error: any) {
    console.error(" PrintRestInvoiceByCode failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const PrintRestRetailInvoiceByCode = async (ReqSvrcode: string, ReqAcaStart: string, ReqUser: string) => {
  try {
    const response = await fetch("/restaurants-bill/api/PrintRestRetailInvoiceByCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "PrintRestRetailInvoiceByCode",
        description: "update and calculate sales bill",
        ReqSvrcode: ReqSvrcode,
        ReqAcaStart: ReqAcaStart,
        ReqUser: ReqUser,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error: any) {
    console.error(" PrintRestRetailInvoiceByCode failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const GetPrinterList = async () => {
  try {
    const response = await fetch("/restaurants-bill/api/GetPrinterList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "GetPrinterList",
        description: "Get Printer List",
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error: any) {
    console.error(" GetPrinterList failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const CancelDeleteOrderByCode = async (ReqOrderID: string, ReqCnclDelType: string) => {
  try {
    const response = await fetch("/restaurants-bill/api/CancelDeleteOrderByCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "CancelDeleteOrderByCode",
        description: "Cancel/Delete Order By Code",
        ReqOrderID: ReqOrderID,
        ReqCnclDelType: ReqCnclDelType,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error: any) {
    console.error(" CancelDeleteOrderByCode failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const GetRestSalesBillByCode = async (ReqSvrCode: string, ReqAcaStart: string, ReqUserCode: string) => {
  try {
    const response = await fetch("/restaurants-bill/api/GetRestSalesBillByCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "GetRestSalesBillByCode",
        description: "Get Rest Sales Bill By Code",
        ReqSvrCode: ReqSvrCode,
        ReqAcaStart: ReqAcaStart,
        ReqUserCode: ReqUserCode,
        ReqTransID: 2,
        ReqEntryMode: 2,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData.userdata;
    }
  } catch (error: any) {
    console.error(" GetRestSalesBillByCode failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const UpdateBillPaidStatus = async (ReqSvrCode: number, ReqStatusType: string) => {
  try {
    const response = await fetch("/restaurants-bill/api/UpdateBillPaidStatus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "UpdateBillPaidStatus",
        description: "Get Rest Sales Bill By Code",
        ReqSvrCode: ReqSvrCode,
        ReqStatusType: ReqStatusType,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData.userdata;
    }
  } catch (error: any) {
    console.error(" UpdateBillPaidStatus failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const UpdateStockOutTypeStatus = async (ReqSVRSTKID: string, ReqStatusType: string) => {
  try {
    const response = await fetch("/restaurants-bill/api/UpdateStockOutTypeStatus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "UpdateStockOutTypeStatus",
        description: "Get Rest Sales Bill By Code",
        ReqSVRSTKID: ReqSVRSTKID,
        ReqStatusType: ReqStatusType,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData.userdata;
    }
  } catch (error: any) {
    console.error(" UpdateStockOutTypeStatus failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const PrintRestOrderByCodeJson = async (ReqOrderID: string) => {
  try {
    const response = await fetch("/restaurants-bill/api/PrintRestOrderByCodeJson", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "PrintRestOrderByCodeJson",
        description: "Get Rest Sales Bill By Code",
        ReqOrderID: ReqOrderID,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData.userdata;
    }
  } catch (error: any) {
    console.error(" PrintRestOrderByCodeJson failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const PrintRestTockenByCode = async (ReqOrderID: string, ReqAcaStart: string) => {
  try {
    const response = await fetch("/restaurants-bill/api/PrintRestTockenByCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "PrintRestTockenByCode",
        description: "Get Rest Sales Bill By Code",
        ReqOrderID: ReqOrderID,
        ReqAcaStart: ReqAcaStart,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData.userdata;
    }
  } catch (error: any) {
    console.error(" PrintRestTockenByCode failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const GetCounterMasterList = async () => {
  try {
    const response = await fetch("/restaurants-bill/api/GetCounterMasterList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "GetCounterMasterList",
        description: "Get Rest Sales Bill By Code",
        ReqMode: 10,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error: any) {
    console.error(" GetCounterMasterList failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const GetPartyMasterByCode = async (id: string) => {
  try {
    const response = await fetch("/restaurants-bill/api/GetPartyMasterByCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "GetPartyMasterByCode",
        description: "Request For Party Display List",
        ReqPartyCode: id,
      }),
    });
    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error: any) {
    console.error(" GetPartyMasterByCode failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const UpdateAccountBook = async (ReqJSonData: string) => {
  try {
    const response = await fetch("/restaurants-bill/api/UpdateAccountBook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "UpdateAccountBook",
        description: "Request For Party Display List",
        ReqJSonData: ReqJSonData,
      }),
    });
    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error: any) {
    console.error(" UpdateAccountBook failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const GetAccountAndPartyListSearch = async () => {
  try {
    const response = await fetch("/restaurants-bill/api/GetAccountAndPartyListSearch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "GetPartyNBalanceList",
        description: "Request For Party Display List",
        ReqGroups: "",
        ReqType: "1",
        ReqNofRcds: "",
        ReqRoute: "",
        ReqAcaStart: "",
        ReqCodes: "",
        ReqByrName: "",
        ReqListType: "All",
      }),
    });
    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error: any) {
    console.error(" GetAccountAndPartyListSearch failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};

export const GetAccountGroupMasterList = async () => {
  try {
    const response = await fetch("/restaurants-bill/api/GetAccountGroupMasterList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "GetAccountGroupMasterList",
        description: "Request For Party Display List",
        ReqGroupName: "",
      }),
    });
    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error: any) {
    console.error(" GetAccountGroupMasterList failed:", error);
    return { error: "Something went wrong. Please try again." };
  }
};
