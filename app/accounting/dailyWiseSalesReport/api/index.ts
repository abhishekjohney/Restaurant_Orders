export const GetDailyReportLists = async () => {
  try {
    const response = await fetch("/accounting/dailyWiseSalesReport/api/GetDailyReportLists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "GetDailyReportLists",
        description: "Get all Main Report Lists",
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error) {
    console.log(error);
  }
};

export const PrintDailyReportsByCode = async (
  date1: string,
  rptType: number,
  user: string,
  vehicle: string,
  route: string,
  year: string
) => {
  try {
    const response = await fetch("/accounting/dailyWiseSalesReport/api/PrintDailyReportsByCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "PrintDailyReportsByCode",
        description: "Get all Main Report Lists",
        ReqAcaStart: year,
        ReqDate1: date1,
        ReqDate2: "",
        ReqRptType: rptType,
        ReqUser: user,
        ReqVehicle: vehicle,
        ReqRoute: route,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error) {
    console.log(error);
  }
};

export const GetEmployeeMasterList = async () => {
  try {
    const response = await fetch("/accounting/dailyWiseSalesReport/api/GetEmployeeMasterList", {
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
      return responseData;
    }
  } catch (error) {
    console.error(error);
  }
};

export const GetVehicleNRouteByUserNDate = async (ReqUserCode: string, ReqDate: string) => {
  try {
    const response = await fetch("/accounting/dailyWiseSalesReport/api/GetVehicleNRouteByUserNDate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "GetVehicleNRouteByUserNDate",
        description: "Request Employee List",
        ReqUserCode: ReqUserCode,
        ReqDate: ReqDate,
      }),
    });

    if (response.ok) {
      // Handle the response data here
      const responseData = await response.json();
      return responseData;
    }
  } catch (error) {
    console.error(error);
  }
};
