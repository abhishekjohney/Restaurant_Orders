import { LocationData, NewExpenseInterface, TransactionInterface } from "@/types";

interface UserType {
  ActionType: number;
  InfoField: string;
  ClientCode: string;
  InfoField1: string;
  InfoField2: string;
  InfoField3: string;
  ItemKeyName: string;
  ItemName: string;
  LoginDate: string;
  RcdID: number;
  SLno: number;
  UserType: number;
}

export class LoginApi {
  getUser = async (credentials: Record<"username" | "password" | "vehicle" | "locationData", string>) => {
    const serverUrl = process.env.WEBSERVICE_URL_REACT || "default value";
    const formData = new FormData();
    console.log(credentials);
    formData.append("title", "UserLogin");
    formData.append("description", "Request Login");
    formData.append("ReqUserID", credentials.username);
    formData.append("ReqPassWord", credentials.password);
    formData.append("ReqLocJason", credentials.locationData);
    formData.append("ReqAcastart", "2025");

    const plainObject: Record<string, any> = {};
    const symbols = Object.getOwnPropertySymbols(formData);
    const stateSymbol = symbols.find((sym) => sym.toString().includes("state"));

    if (stateSymbol) {
      const state = (formData as any)[stateSymbol];
      for (const field of state) {
        plainObject[field.name] = field.value;
      }
    }

    console.log("\n", plainObject, "\n");
    console.log("\n", serverUrl, "url\n");
    const result = await fetch(serverUrl, {
      method: "POST",
      body: formData,
    });
    const content = await result.text();
    const userObject: UserType = JSON.parse(content.substring(0, content.indexOf("||JasonEnd", 0)))[0];
    console.log(userObject, "\n response \n");
    if (userObject.InfoField === "User Record Not Found " || userObject.InfoField1 === "-1" || userObject?.InfoField !== "1") {
      return null;
    } else {
      
      const userTypeMap: Record<number, string> = {
        0: "salesman",
        2: "multi-user",
        4: "counter",
        6: "admin",
      };

      const UserType = userTypeMap[userObject.UserType] || "";

      return {
        id: userObject.RcdID.toString(),
        name: credentials.username,
        email: "",
        role: UserType,
        systemDate: userObject.LoginDate,
        ClientCode: userObject.ClientCode,
        UserType: String(userObject.UserType),
      };
    }
  };

  getLocationDetails = async () => {
    try {
      const response = await fetch("/api/getUserDeliveryLocations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetGroupMasterList",
          description: "Request For GroupList",
          ReqGroupType: "RG",
          ReqGroupName: "",
          ReqSerType: 0,
        }),
      });
      if (response.ok) {
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  ChangeERPProfilePassWord = async (code: any, old: string, newP: string) => {
    try {
      const response = await fetch("/api/ChangeERPProfilePassWord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "ChangeERPProfilePassWord",
          description: "Request For GroupList",
          ReqUserCode: code,
          ReqOldPass: old,
          ReqNewPass: newP,
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
}

export class ListApi {
  getSelectedProductDetails = async (productId: string, partyId: string) => {
    try {
      const storedUserYear = localStorage.getItem("UserYear");
      if (storedUserYear) {
        const response = await fetch("/api/getSelectedProductDetails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "GetItemMasterByCode",
            description: "Request For Stock Item Display List",
            ReqItemCode: productId,
            ReqPartyCode: partyId,
            ReqWithStock: "yes",
          }),
        });
        if (response.ok) {
          const responseData = await response.json();
          return responseData.userdata;
        }
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  PrintInvoiceByCode = async (svrCode: number, year: string, userId: string) => {
    try {
      const response = await fetch("/api/PrintInvoiceByCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "PrintInvoiceByCode",
          description: "Print sales invoice",
          ReqSvrcode: svrCode,
          ReqAcaStart: year,
          ReqUser: userId,
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

  PrintRetailInvoiceByCode = async (svrCode: number, year: string, userId: string) => {
    try {
      const response = await fetch("/api/PrintRetailInvoiceByCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "PrintRetailInvoiceByCode",
          description: "Print sales invoice",
          ReqSvrcode: svrCode,
          ReqAcaStart: year,
          ReqUser: userId,
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

  getStockNOrderStatus = async (id: string) => {
    try {
      const response = await fetch("/api/getStockNOrderStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetStockNOrderStatus",
          description: "Request For Stock of the day",
          ReqSvrStkID: id,
        }),
      });
      if (response.ok) {
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getNoteCountsRecordByDate = async (date: string, userId: string) => {
    try {
      const response = await fetch("/api/getNoteCountsRecordByDate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetNoteCountsRecordByDate",
          description: "Request For GroupList",
          ReqDate: date,
          ReqUser: userId,
        }),
      });
      if (response.ok) {
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getNotesCountListByDateJson = async (date: string, userId: string) => {
    try {
      const response = await fetch("/api/getNotesCountListByDateJson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetNotesCountListByDateJson",
          description: "Request For GroupList",
          ReqDate: date,
          ReqUser: userId,
        }),
      });
      if (response.ok) {
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  GetStockItemListForOrder = async (brand: string, partyCode: string) => {
    try {
      const response = await fetch("/api/GetStockItemListForOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetStockItemListForOrder",
          description: "Get Stock items list",
          ReqPartyCode: partyCode,
          ReqBrand: brand,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  GetGroupMasterList = async () => {
    try {
      const response = await fetch("/api/GetGroupMasterList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetGroupMasterList",
          description: "",
          ReqGroupType: "B",
          ReqGroupName: "",
          ReqSerType: 0,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  GetOrderDetailsByCode = async (orderId: string, userName: string, orderDate: string) => {
    try {
      const response = await fetch("/api/GetOrderDetailsByCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetOrderDetailsByCode",
          description: "Request For Stock of the day",
          ReqOrderID: orderId,
          ReqUserName: userName,
          ReqOrderDate: orderDate,
        }),
      });
      if (response.ok) {
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  GetItemMasterByCode = async (productId: string, partyId: string) => {
    try {
      const storedUserYear = localStorage.getItem("UserYear");
      if (storedUserYear) {
        const response = await fetch("/api/GetItemMasterByCode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "GetItemMasterByCode",
            description: "Request For Stock Item Display List",
            ReqItemCode: productId,
            ReqPartyCode: partyId,
            ReqWithStock: "yes",
          }),
        });
        if (response.ok) {
          const responseData = await response.json();
          return responseData.userdata;
        }
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  GetDateWiseUserLocationList = async (date: string, userId: string) => {
    try {
      const response = await fetch("/api/GetDateWiseUserLocationList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetDateWiseUserLocationList",
          description: "Request For GroupList",
          ReqDate: date,
          ReqUser: userId,
        }),
      });
      if (response.ok) {
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getUserLocationDetails = async (latitude: string, longitude: string, controller?: AbortController) => {
    try {
      const response = await fetch("/api/getUserLocationDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller?.signal,
        body: JSON.stringify({
          title: "",
          latitude: latitude,
          longitude: longitude,
        }),
      });

      const responseData = response.json();
      return responseData;
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  GetSalesBillingList = async (date: string, type: string) => {
    try {
      const response = await fetch("/api/GetSalesBillingList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetSalesBillingList",
          description: "Request For sales items list",
          ReqFdate: date,
          ReqCurEntryMode: type === "S" ? 1 : 2,
          ReqCncltype: 0,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  GetSalesBillByCode = async (svrCode: string, year: string, type: string) => {
    try {
      const response = await fetch("/api/GetSalesBillByCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetSalesBillByCode",
          description: "Request For sales items list",
          ReqSvrCode: svrCode,
          ReqAcaStart: year,
          ReqTransID: 2,
          ReqEntryMode: type === "S" ? 1 : 2,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getPartyLocationDetails = async (PartyId: string) => {
    try {
      const response = await fetch("/api/getPartyLocationDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetPartyLocationList",
          description: "Request For Stock Item Display List",
          ReqAccAutoid: PartyId,
        }),
      });
      if (response.ok) {
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  GetStockImagesList = async (id: string | number) => {
    try {
      const response = await fetch("/api/GetStockImagesList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetStockImagesList",
          description: "Request For Stock of the day",
          ReqSvrStkID: id,
        }),
      });
      if (response.ok) {
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getMonthyOrders = async (MonthVal: string, ReqUserID: string = "", ReqUserTypeID = "") => {
    try {
      console.log(ReqUserID, "user id");
      const storedUserYear = localStorage.getItem("UserYear");
      if (storedUserYear) {
        const parts = storedUserYear.split("_");
        const year = parts[1];
        const response = await fetch("/api/getcurrentmonth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "GetMonthlyDailyOrderListJason",
            description: "Monthwise Order Status",
            ReqMntid: MonthVal,
            ReqUserID: "",
            ReqUserTypeID: ReqUserID,
            ReqYear: year,
          }),
        });
        if (response.ok) {
          const responseData = await response.json();
          return responseData.userdata;
        }
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getUpdatePartyGPSLocation = async (PartyID: string, locationString: string, place: string, latLong: string) => {
    try {
      const response = await fetch("/api/getUpdatePartyGPSLocation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "UpdatePartyGPSLocation",
          description: "Request For Payment List",
          AccAutoID: PartyID,
          ReqLocLatLong: latLong,
          ReqLocationString: locationString,
          ReqLocPlace: place,
        }),
      });
      if (response.ok) {
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getStock = async (DateVal: string, ReqUserID: string | any = "", ReqUserTypeID: string | any = "") => {
    try {
      const storedUserYear = localStorage.getItem("UserYear");
      if (storedUserYear) {
        const parts = storedUserYear.split("_");
        const year = parts[1];
        const response = await fetch("/api/getstock", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "GetStockOrderMasterListJason",
            description: "demo",
            ReqYear: year,
            ReqDate: DateVal,
            ReqUserID: ReqUserID,
            ReqUserTypeID: ReqUserTypeID,
          }),
        });
        if (response.ok) {
          const responseData = await response.json();
          return responseData.userdata;
        }
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  GetStockOrderMasterListJason = async (DateVal: string, ReqUserID: string | any = "", ReqUserTypeID: string | any = "") => {
    try {
      const storedUserYear = localStorage.getItem("UserYear");
      if (storedUserYear) {
        const parts = storedUserYear.split("_");
        const year = parts[1];
        const response = await fetch("/api/GetStockOrderMasterListJason", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "GetStockOrderMasterListJason",
            description: "demo",
            ReqYear: year,
            ReqDate: DateVal,
            ReqUserID: ReqUserID,
            ReqUserTypeID: ReqUserTypeID,
          }),
        });
        if (response.ok) {
          const responseData = await response.json();
          return responseData.userdata;
        }
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getDailyPartyLocationList = async (DateVal: string, ReqUserTypeID: string | any = "") => {
    try {
      const storedUserYear = localStorage.getItem("UserYear");
      if (storedUserYear) {
        const parts = storedUserYear.split("_");
        const year = parts[1];
        const response = await fetch("/api/getDailyPartyLocationList", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "GetDailyUserLocationListByDate",
            description: "demo",
            ReqDate: DateVal,
            ReqUser: ReqUserTypeID,
          }),
        });
        if (response) {
          const responseData = await response.json();
          return responseData;
        }
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getDailyExpenseList = async (ReqTransDate: string, ReqUser: string | any, ReqAprType: any = -1) => {
    try {
      const response = await fetch("/api/getDailyExpenseList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetDailyExpensesListByDate",
          description: "Request For  GetDailyExpensesListByDate",
          ReqTransDate: ReqTransDate,
          ReqUser: ReqUser,
          ReqAprType: ReqAprType,
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

  getOrderwiseItemList = async (ReqDate: string | any, ReqUserID: string) => {
    try {
      const response = await fetch("/api/getSOrdeItemsList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetOrdeItemsList",
          description: "",
          ReqUserID: ReqUserID,
          ReqDate: ReqDate,
        }),
      });
      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData, "response");
        return responseData;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getPartyList = async () => {
    try {
      const storedUserYear = localStorage.getItem("UserYear");
      if (storedUserYear) {
        const parts = storedUserYear.split("_");
        const year = parts[1];
        const route = parts[3] !== "null" && parts[3] !== undefined ? parts[3] : "";
        const response = await fetch("/api/getPartyNBalanceList", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "GetPartyNBalanceList",
            description: "Request  Bill By Code",
            ReqType: "1",
            ReqNofRcds: "",
            ReqAcaStart: year,
            ReqGroups: "Sundry Debtors",
            ReqCodes: "",
            ReqByrName: "",
            ReqRoute: route,
          }),
        });

        if (response.ok) {
          // Handle the response data here
          const responseData = await response.json();
          return responseData.userdata;
        }
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getExpenseList = async () => {
    try {
      const response = await fetch("/api/getExpenseList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetPartyNBalanceList",
          description: "Request  Bill By Code",
          ReqType: "0",
          ReqNofRcds: "0",
          ReqAcaStart: "0",
          ReqGroups: "",
          ReqCodes: "",
          ReqByrName: "",
          ReqListType: "EXPENSES",
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getCashAccountList = async () => {
    try {
      const response = await fetch("/api/getCashAccountList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetPartyNBalanceList",
          description: "Request  Bill By Code",
          ReqType: 0,
          ReqNofRcds: 0,
          ReqAcaStart: 0,
          ReqGroups: "",
          ReqCodes: "",
          ReqByrName: "",
          ReqListType: "CASH ACCOUNT",
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getPartyNBalanceList = async (ReqAcaStart: number, ReqCodes: number | string, ReqByrName: string, ReqRoute: string, group: string) => {
    try {
      const response = await fetch("/api/getPartyNBalanceList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetPartyNBalanceList",
          description: "Request  Bill By Code",
          ReqType: "1",
          ReqNofRcds: "",
          ReqAcaStart: ReqAcaStart,
          ReqGroups: group,
          ReqCodes: ReqCodes,
          ReqByrName: ReqByrName,
          ReqRoute: ReqRoute,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getPartyLocationAprList = async () => {
    try {
      const response = await fetch("/api/getPartyLocationAprList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetPartyLocationAprList",
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getVehicleRouteList = async (ReqDate: string, ReqEmpCode: string) => {
    try {
      const response = await fetch("/api/getVehicleRouteList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetVehicleAllocationByCode",
          description: "Request  Payment By Code",
          ReqDate: ReqDate,
          ReqEmpCode: ReqEmpCode,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getPaymentMasterList = async () => {
    try {
      const response = await fetch("/api/getPaymentMasterList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetOrderPaymentMasterList",
          description: "demo",
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getOrderPaymentMasterList = async (ReqDate: string, ReqUserName: string | any = "", ReqAprType: any = -1) => {
    try {
      const response = await fetch("/api/getOrderPaymentMasterList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetOrderPaymentMasterList",
          description: "demo",
          ReqUserName: ReqUserName,
          ReqDate: ReqDate,
          ReqAprType: ReqAprType,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getPaymentMasterRecordByCode = async (ReqPaymentID: string | null) => {
    try {
      const response = await fetch("/api/getPaymentMasterRecordByCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetOrderPaymentMasterRecordByCode",
          description: "Request  Payment By Code",
          ReqPaymentID: ReqPaymentID,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  deletePaymentMasterRecordByCode = async (ReqPaymentID: string | null) => {
    try {
      const response = await fetch("/api/deletePaymentMasterRecordByCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "DeleteOrderPaymentMasterRecordByCode",
          description: "delete Payment By Code",
          ReqPaymentID: ReqPaymentID,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getpartypaymentdetail = async (year: number, Byr_nam: string, AccAutoID: number, fdate?: string, udate?: string) => {
    try {
      const response = await fetch("/api/getpartypaymentdetail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetPartyPaymentDetails",
          description: "",
          ReqYear: year,
          ReqAccName: Byr_nam,
          ReqAccCode: AccAutoID,
          ReqFDate: fdate,
          ReqToDate: udate,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response?.json();
        return responseData;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getpartypaymentdetailByDate = async (year: string, Byr_nam: string, AccAutoID: number, ReqFDate: string, ReqToDate: string) => {
    try {
      const response = await fetch("/api/getpartypaymentdetailByDate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetPartyPaymentDetails",
          description: "",
          ReqYear: year,
          ReqAccNane: Byr_nam,
          ReqAccCode: AccAutoID,
          ReqFDate: ReqFDate,
          ReqToDate: ReqToDate,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getorderitemlist = async (year: string, orderId: string, userCode: string | null | undefined) => {
    try {
      const response = await fetch("/api/getorderitemlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetStockOrderDetailsListJason",
          description: "",
          ReqYear: year,
          ReqOrdid: orderId,
          ReqUserCode: userCode,
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

  GetGreenCardamomReceiptByCode = async (GCRID: number) => {
    try {
      const response = await fetch("/api/GetGreenCardamomReceiptByCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetGreenCardamomReceiptByCode",
          description: "",
          ReqGCRID: GCRID,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  GetStockItemListJason = async () => {
    try {
      const response = await fetch("/api/getstock", {
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
        // Handle the response data here
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  GetGreenCardamomReceiptList = async (Reqdate1: string, ReqDate2: string, refNo: string, party: string) => {
    try {
      const response = await fetch("/api/GetGreenCardamomReceiptList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetGreenCardamomReceiptList",
          Reqdate1: Reqdate1,
          Reqdate2: ReqDate2,
          Reqparty: party,
          ReqRefNo: refNo,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getusersorder = async (userTypeID: string | undefined, year: string) => {
    try {
      const response = await fetch("/api/getusersorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetUsewiseOrderListJason",
          description: "",
          ReqUserID: "",
          ReqUserTypeID: userTypeID,
          ReqYear: year,
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

  getEmployeeMasterListView = async () => {
    try {
      const response = await fetch("/api/getEmployeeMasterListView", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetEmployeeMasterList",
          description: "Request Employee List",
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getEmployeeMasterDDList = async () => {
    try {
      const response = await fetch("/api/getEmployeeMasterDDList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetEmployeeMasterDDList",
          description: "Request Employee List",
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  addNewEmpMasterList = async (ReqEmpAutoID: string) => {
    try {
      const response = await fetch("/api/addNewEmpMasterList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetEmployeeMasterByCode",
          description: "Request  Employee Master By Code",
          ReqEmpAutoID: ReqEmpAutoID,
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

  getDailyAttendanceByDate = async (ReqAttDate: string) => {
    try {
      const response = await fetch("/api/getDailyAttendanceByDate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetDailyAttendanceByDate",
          description: "Request  GetDailyAttendanceByDate",
          ReqAttDate: ReqAttDate,
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

  getDailyAttendanceByDateAndUser = async (ReqAttDate: string, ReqAttUser: string) => {
    try {
      const response = await fetch("/api/getDailyAttendanceByDateAndUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetDailyAttendanceByDate",
          description: "Request  GetDailyAttendanceByDate",
          ReqAttDate: ReqAttDate,
          ReqAttUser: ReqAttUser,
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

  getOrgMasterForEdit = async () => {
    try {
      const response = await fetch("/api/getOrgMasterForEdit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetOrgMasterForEdit",
          description: "Request GetOrgMaster ist",
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

  getEmployeeMasterBalanceList = async () => {
    try {
      const response = await fetch("/api/getEmployeeMasterBalanceList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetEmployeeMasterBalanceList",
          description: "Request Employee List",
          ReqEmpAutoID: "",
          ReqEmpCode: "",
          ReqDrpType: "0",
          ReqEmpName: "",
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getEmployeeAttListByCode = async (year: number, ReqMonth: string, ReqEmpAutoid: number) => {
    try {
      const response = await fetch("/api/getEmployeeAttListByCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetEmployeeAttListByCode",
          description: "Request  Payment By Code",
          ReqAcastart: year,
          ReqMonth: ReqMonth,
          ReqEmpCode: "",
          ReqEmpAutoid: ReqEmpAutoid,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getMonthlyOder = async () => {
    try {
      const storedUserYear = localStorage.getItem("UserYear");
      if (storedUserYear) {
        const parts = storedUserYear.split("_");
        const year = parts[1];
        const response = await fetch("/api/getmonthlyorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "GetMonthlyOrderListJason",
            description: "",
            ReqYear: year,
            ReqUserID: "",
            ReqUserTypeID: "",
          }),
        });

        if (response.ok) {
          // Handle the response data here
          const responseData = await response.json();
          console.log(responseData, "");
          return responseData.userdata;
        }
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getCreateNewExpense = async () => {
    try {
      const response = await fetch("/api/createNewExpenseApi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetExpenseRecordByCodeNew",
          // title: "GetExpenseRecordByCode",
          description: "Request For  GetExpenseRecordByCode",
          ReqDTId: "",
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getEditNewExpense = async (id: string) => {
    try {
      const response = await fetch("/api/editNewExpenseApi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "GetExpenseRecordByCodeNew",
          description: "Request For  GetExpenseRecordByCode",
          ReqDTId: id,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        console.log(responseData, "response");
        return responseData;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  getDeleteNewExpense = async (id: number | string) => {
    try {
      const response = await fetch("/api/editNewExpenseApi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "DeleteExpenseRecordByCode",
          description: "Request For delete GetExpenseRecordByCode",
          ReqDTId: id,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };
}

export class UpdateAPI {
  createneworder = async (
    userID: string,
    userAutoID: string,
    partyID: string,
    remarks: string,
    formattedDate: string,
    ReqAccPartyID: string,
    locationData: LocationData[]
  ) => {
    try {
      const storedUserYear = localStorage.getItem("UserYear");
      if (storedUserYear) {
        const parts = storedUserYear.split("_");
        const year = parts[1];
        const vehicle = parts[2];
        const response = await fetch("/api/createneworder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "UpdateOrderMaster",
            description: "",
            ReqOrderID: "0",
            ReqUserID: userID,
            ReqUserAutoID: userAutoID,
            ReqPartyID: partyID,
            ReqRemarks: remarks,
            ReqAcastart: year,
            ReqDelDate: formattedDate,
            ReqVehNo: vehicle,
            ReqAccPartyID: ReqAccPartyID,
            ReqLocJason: locationData,
          }),
        });

        if (response.ok) {
          // Handle the response data here
          const responseData = await response.json();
          return responseData;
        }
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  editneworder = async (
    userID: string,
    userAutoID: string,
    partyID: string,
    remarks: string,
    formattedDate: string,
    ReqAccPartyID: string,
    orderId: string,
    vehicle: string
  ) => {
    try {
      const response = await fetch("/api/createneworder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "UpdateOrderMaster",
          description: "",
          ReqOrderID: orderId,
          ReqUserID: userID,
          ReqUserAutoID: userAutoID,
          ReqPartyID: partyID,
          ReqRemarks: remarks,
          ReqAcastart: "",
          ReqDelDate: formattedDate,
          ReqVehNo: vehicle,
          ReqAccPartyID: ReqAccPartyID,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  UpdateB2BOrders = async (ReqJSonData: string, ReqJSonData2: string) => {
    try {
      const response = await fetch("/api/UpdateB2BOrders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "UpdateB2BOrders",
          description: "Request For EmployeeMaster Update",
          ReqJSonData: ReqJSonData,
          ReqJSonData2: ReqJSonData2,
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

  CalculateAndUpdateBill = async (ReqJSonData: any) => {
    try {
      const response = await fetch("/api/CalculateAndUpdateBill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "CalculateAndUpdateBill",
          description: "update and calculate sales bill",
          ReqJSonData: JSON.stringify([ReqJSonData]),
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

  UpdateDailyPartyGPSLocation = async (locationData: LocationData[]) => {
    try {
      const response = await fetch("/api/UpdateDailyPartyGPSLocation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "UpdateDailyPartyGPSLocation",
          description: "Update Staff Location",
          ReqLocJason: JSON.stringify(locationData),
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

  createnewExpense = async (formData: NewExpenseInterface) => {
    try {
      const response = await fetch("/api/createnewExpense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "UpdateExpensePayments",
          description: "Request UpdateExpensePayments",
          ReqJSonData: formData,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  UpdateStockImages = async (svrStkId: string | number, imgStr: string | undefined, actionType: number, imgId: number) => {
    try {
      const response = await fetch("/api/UpdateStockImages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "UpdateStockImages",
          description: "",
          ReqActionType: actionType,
          ReqImgEntID: imgId,
          ReqSVRSTKID: svrStkId,
          ReqImgRemarks: "Image For Test",
          ReqImgGroup: "Main",
          ReqImageType: "Item",
          imagestring1: imgStr,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        return responseData.userdata;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  updateNewOrder = async (ReqOrderID: string, ReqAccPartyID: string) => {
    try {
      const response = await fetch("/api/updateneworder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "UpdateOrderAccParty",
          description: "update Account party",
          ReqOrderID: ReqOrderID,
          ReqAccPartyID: ReqAccPartyID,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  updatePartyGPSLocationApprove = async (ReAprUser: string, ReqAccAutoID: string, ReqApryn: string | boolean) => {
    try {
      const response = await fetch("/api/updatePartyGPSLocationApprove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "UpdatePartyGPSLocationApprove",
          description: "update Account party",
          ReAprUser: ReAprUser,
          ReqAccAutoID: ReqAccAutoID,
          ReqApryn: ReqApryn,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  updateExpenseApprove = async (
    ReqCurDate: string,
    ReqAprUser: string | null | undefined,
    ReqAprCodes: string | boolean,
    ReqUpdType: string | number,
    ReqApr: string | number
  ) => {
    try {
      const response = await fetch("/api/updateExpenseApprove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "ApproveExpensesbycode",
          description: "update Account party",
          ReqCurDate: ReqCurDate,
          ReqAprUser: ReqAprUser,
          ReqAprCodes: ReqAprCodes.toString(),
          ReqUpdType: ReqUpdType,
          ReqAprSts: ReqApr,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  updatePaymentApprove = async (
    ReqCurDate: string,
    ReqAprUser: string | null | undefined,
    ReqAprCodes: string | boolean,
    ReqUpdType: string,
    ReqApr: number
  ) => {
    try {
      const response = await fetch("/api/updatePaymentApprove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "ApproveOrderPaymentsBycode",
          description: "update Account party",
          ReqCurDate: ReqCurDate,
          ReqAprUser: ReqAprUser,
          ReqAprCodes: ReqAprCodes.toString(),
          ReqUpdType: ReqUpdType,
          ReqAprSts: ReqApr,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  updateCurrencyApproval = async (ReqAprUser: string, ReqAprCodes: string, ReqUpdType: string | boolean) => {
    try {
      const response = await fetch("/api/UpdateNotesApproveDelete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "UpdateNotesApproveDelete",
          description: "update currency check",
          ReqAprUser: ReqAprUser,
          ReqNCRID: ReqAprCodes.toString(),
          ReqApryn: ReqUpdType,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  saveorderitem = async (
    orderid: string,
    ReqSVRSTKID: string,
    ReqOrderQty: string,
    ReqOrderRate: string,
    ReqOrderRemarks: string,
    ReqAcastart: string,
    ReqOrderTransID: string | number
  ) => {
    try {
      const response = await fetch("/api/saveorderitem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "UpdateOrderDetails",
          description: "",
          ReqOrderID: orderid,
          ReqSVRSTKID: ReqSVRSTKID,
          ReqOrderQty: ReqOrderQty,
          ReqOrderRate: ReqOrderRate,
          ReqOrderRemarks: ReqOrderRemarks,
          ReqAcastart: ReqAcastart,
          ReqOrderTransID: ReqOrderTransID,
        }),
      });

      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  updateEmployeeMaster = async (ReqJSonData: string) => {
    try {
      const response = await fetch("/api/updateEmployeeMaster", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "UpdateEmployeeMaster",
          description: "Request For EmployeeMaster Update",
          ReqJSonData: ReqJSonData,
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

  UpdateGreenCardamomReceipt = async (ReqJSonData: TransactionInterface[]) => {
    try {
      const response = await fetch("/api/UpdateGreenCardamomReceipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "UpdateGreenCardamomReceipt",
          description: "Request For EmployeeMaster Update",
          ReqJSonData: JSON.stringify(ReqJSonData),
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

  updateNotesDetails = async (ReqJSonData: any) => {
    try {
      const response = await fetch("/api/updateNotesDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "UpdateNotesDetails",
          description: "Request For Update Notes Details",
          ReqJSonData: [ReqJSonData],
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

  updateVehicleAllotment = async (ReqJSonData: string) => {
    try {
      const response = await fetch("/api/updateVehicleAllotment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "UpdateVehicleAllotment",
          description: "Request For EmployeeMaster Update",
          ReqJSonData: ReqJSonData,
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

  updateOrderPayments = async (ReqJSonData: string, ReqLocJason: any) => {
    try {
      const response = await fetch("/api/updateOrderPayments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "UpdateOrderPayments",
          description: "Request For Update",
          ReqJSonData: ReqJSonData,
          ReqLocJason: ReqLocJason,
        }),
      });
      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  UpdateDailyAttendance = async (ReqJSonData: string) => {
    console.log(ReqJSonData, "req data");

    try {
      const response = await fetch("/api/UpdateDailyAttendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "UpdateDailyAttendance",
          description: "Request For EmployeeMaster Update",
          ReqJSonData: ReqJSonData,
        }),
      });
      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };

  UpdateOrgMaster = async (ReqJSonData: string) => {
    console.log(ReqJSonData);

    try {
      const response = await fetch("/api/UpdateOrgMaster", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "UpdateOrgMaster",
          description: "Request For Orgmaster Update",
          ReqJSonData: ReqJSonData,
        }),
      });
      if (response.ok) {
        // Handle the response data here
        const responseData = await response.json();
        return responseData;
      }
    } catch (error: any) {
      console.error(" CancelDeleteOrderByCode failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };
}
