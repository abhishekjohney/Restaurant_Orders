"use client";

import PdfViewer from "@/components/common/PdfViewer";
import { Spinner } from "@/components/Spinner";
import { formatDate, formatDate2, getNextDay } from "@/lib/helper-function";
import { ResponseInterface } from "@/types";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { GetDailyReportLists, GetEmployeeMasterList, GetVehicleNRouteByUserNDate, PrintDailyReportsByCode } from "./api";
import {
  EmployeeData,
  EmployeeDetails,
  GetDailyReportListsJD1,
  GetDailyReportListsJD2,
  GetDailyReportListsJD3,
  GetDailyReportListsJD4,
} from "./types";
import BackButton from "@/components/BackButton";
import CustomFunctionalModal from "./_components/CustomModal";

interface FormData {
  ReqRights: string;
  ReqDate1: string;
  ReqDate2: string;
  ReqRptType: number;
  ReqUser: string;
  ReqVehicle: string;
  ReqRoute: string;
}

const DailyWiseSalesReportPage = () => {
  const session = useSession();

  const searchParams = useSearchParams();
  const router = useRouter();
  const [year, setYear] = useState("");

  const [dateFrom, setDateFrom] = useState<Date>(getNextDay());
  const [dateUpto, setDateUpto] = useState<any>("");
  const [pdfLink, setPdfLink] = useState("");
  const [pdfModal, setPdfModal] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [routesList, setRoutesList] = useState<GetDailyReportListsJD2[]>([]);
  const [userList, setUserList] = useState<GetDailyReportListsJD1[]>([]);
  const [vehicleList, setVehicleList] = useState<GetDailyReportListsJD3[]>([]);
  const [reportTypeList, setReportTypeList] = useState<GetDailyReportListsJD4[]>([]);
  const [employee, setEmployee] = useState<EmployeeDetails[]>([]);
  const [selectedItem, setSelectedItem] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    ReqRights: "",
    ReqDate1: "",
    ReqDate2: "",
    ReqRptType: 2,
    ReqUser: "",
    ReqVehicle: "",
    ReqRoute: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const userDetails = localStorage.getItem("UserYear");
      if (userDetails) {
        const parts = userDetails.split("_");
        if (parts.length >= 4) {
          setYear(parts[1]);
        }
      }
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const fetchCall = await GetDailyReportLists();
      const data: ResponseInterface = fetchCall[0];
      const JSONData1: GetDailyReportListsJD1[] = JSON.parse(data.JSONData1);
      const JSONData2: GetDailyReportListsJD2[] = data?.JSONData2 ? JSON.parse(data.JSONData2) : "";
      const JSONData3: GetDailyReportListsJD3[] = data?.JSONData3 ? JSON.parse(data.JSONData3) : "";
      const JSONData4: GetDailyReportListsJD4[] = data?.JSONData4 ? JSON.parse(data.JSONData4) : "";
      setUserList(JSONData1);
      setRoutesList(JSONData2);
      setVehicleList(JSONData3);
      setReportTypeList(JSONData4);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Error, Please Try Again");
      console.log(error);
    }
  };

  const fetchUserList = async () => {
    try {
      setLoading(true);
      const fetchCall = await GetEmployeeMasterList();
      const data: EmployeeData[] = fetchCall;
      const filterData: EmployeeDetails[] = data.map((item: EmployeeData) => ({
        EMPCode: item.EMPCODE,
        EmpName: item.EmployeeName,
        EMPAUTOID: item.EMPAUTOID,
      }));
      setEmployee(filterData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Error, Please Try Again");
      console.log(error);
    }
  };

  const handleUserDateWiseDetails = async (item: string) => {
    try {
      setLoading(true);
      const response = await GetVehicleNRouteByUserNDate(item, formatDate2(dateFrom));
      const route = response[0]?.JSONData1;
      const vehicle = response[0]?.JSONData2;
      setLoading(false);
      setFormData((prevData) => ({
        ...prevData,
        ReqUser: item,
        ReqRoute: route ? route.toUpperCase() : "",
        ReqVehicle: vehicle ? vehicle : "",
      }));
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUserList();
  }, []);


  const handlePrint = async () => {
    try {
      if (dateFrom) formData.ReqDate1 = formatDate2(dateFrom);

      const submit = await PrintDailyReportsByCode(
        formData.ReqDate1,
        formData.ReqRptType,
        formData.ReqUser,
        formData.ReqVehicle,
        formData.ReqRoute,
        year
      );
      // console.log(submit);
      const ActionType = submit[0].ActionType;
      if (ActionType > 0) {
        const JSONData = submit[0].JSONData1;
        const pre = process.env.NEXT_PUBLIC_WEBSERVICE_URL as string;
        const url = `${pre}${JSONData}`;
        console.log(url);
        setPdfLink(url);
        setPdfModal(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, val: string) => {
    const inputValue = e.target.value;
    const newDate = new Date(inputValue);
    if (val === "from") {
      setDateFrom(newDate);
    } else {
      setDateUpto(newDate);
    }
  };

  return (
    <>
      <div className="lg:pt-0 pt-20 h-screen lg:h-[89vh]">
        <div className="shadow-md p-2 h-full rounded-md border mb-2">
          {loading && <Spinner />}

          {pdfModal && (
            <CustomFunctionalModal close={setPdfModal} title="Print Date Wise Sales Report">
              <PdfViewer url={pdfLink} />
            </CustomFunctionalModal>
          )}

          <div className="shadow-md flex-col bg-white w-full md:w-[70%] mx-auto flex items-start justify-between mb-2 p-2 rounded-lg">
            <div className="flex  w-full justify-between items-center">
              <BackButton path="Daily wise sales report" />
              <h3 className=" text-xl font-semibold">Date Wise Salse Report</h3>
            </div>
          </div>

          <div className="p-2 flex md:gap-2 gap-1 justify-start md:flex-row flex-col">
            <div className="w-full md:w-[70%] mx-auto">
              <div className="p-1 bg-white rounded-md w-fit shadow-md flex gap-4 md:gap-8 justify-start">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-primary text-white rounded shadow-md font-poppins font-medium md:text-base text-sm md:px-6 md:py-3 px-3 py-2"
                >
                  Print
                </button>
                {/* <button className="bg-primary text-white rounded shadow-md font-poppins font-medium md:text-base text-sm md:px-6 md:py-3 px-3 py-2">
                  Quit
                </button> */}
              </div>
              <div className="my-2 rounded-md">
                <div className="grid md:grid-cols-3 grid-cols-2 justify-start items-center md:gap-3 gap-2">
                  <label
                    htmlFor="dateFrom"
                    className="text-sm block font-openSans uppercase border border-black border-solid px-2 py-2 bg-[#B70404] font-medium text-white rounded"
                  >
                    Date From:
                  </label>
                  <input
                    id="dateFrom"
                    value={formatDate(dateFrom)}
                    onChange={(e) => {
                      handleDateChange(e, "from");
                    }}
                    type="date"
                    className="md:col-span-2 col-span-1 shadow appearance-none border input-info rounded w-full py-2 px-3 leading-tight placeholder:font-montserrat"
                  />

                  <>
                    <label
                      htmlFor="AccountHead"
                      className="text-sm block font-openSans uppercase border border-black border-solid px-2 py-2 bg-[#B70404] font-medium text-white rounded"
                    >
                      User:
                    </label>
                    <select
                      value={formData.ReqUser}
                      onChange={(e) => {
                        let val = e.target.value;
                        handleUserDateWiseDetails(val);
                      }}
                      id="AccountHead"
                      className="md:col-span-2 col-span-1 shadow appearance-none border input-info rounded w-full py-2 px-3 leading-tight placeholder:font-montserrat"
                    >
                      <option value="">select</option>
                      {employee.length > 0 &&
                        employee.map((item: EmployeeDetails, index) => {
                          return (
                            <option key={index} value={item.EMPCode}>
                              {item.EmpName}
                            </option>
                          );
                        })}
                    </select>
                  </>

                  <>
                    <label
                      htmlFor="AccGrops"
                      className="text-sm block font-openSans uppercase border border-black border-solid px-2 py-2 bg-[#B70404] font-medium text-white rounded"
                    >
                      Vehicle:
                    </label>
                    <select
                      value={formData.ReqVehicle}
                      onChange={(e) => {
                        let val = e.target.value;
                        setFormData({ ...(formData as FormData), ReqVehicle: val });
                      }}
                      id="AccGrops"
                      className="md:col-span-2 col-span-1 shadow appearance-none border input-info rounded w-full py-2 px-3 leading-tight placeholder:font-montserrat"
                    >
                      <option value="">select</option>
                      {vehicleList.length > 0 &&
                        vehicleList.map((item: GetDailyReportListsJD3, index: number) => {
                          return (
                            <option key={index} value={item.TaxiVehNo}>
                              {item.TaxiVehNo}
                            </option>
                          );
                        })}
                    </select>
                  </>

                  <>
                    <label
                      htmlFor="showAccDetails"
                      className="text-sm block font-openSans uppercase border border-black border-solid px-2 py-2 bg-[#B70404] font-medium text-white rounded"
                    >
                      Route:
                    </label>
                    <select
                      value={formData.ReqRoute}
                      onChange={(e) => {
                        let val = e.target.value;
                        setFormData({ ...(formData as FormData), ReqRoute: val });
                      }}
                      id="showAccDetails"
                      className="md:col-span-2 col-span-1 shadow appearance-none border input-info rounded w-full py-2 px-3 leading-tight placeholder:font-montserrat"
                    >
                      <option value="">select</option>
                      {routesList.length > 0 &&
                        routesList.map((item: GetDailyReportListsJD2, index: number) => {
                          return (
                            <option key={index} value={item.ItemName}>
                              {item.ItemName}
                            </option>
                          );
                        })}
                    </select>
                  </>

                  <label
                    htmlFor="reptType"
                    className="text-sm block font-openSans uppercase border border-black border-solid px-2 py-2 bg-[#B70404] font-medium text-white rounded"
                  >
                    Report Type:
                  </label>
                  <select
                    value={formData.ReqRptType}
                    onChange={(e) => {
                      let val = parseInt(e.target.value);
                      setFormData({ ...(formData as FormData), ReqRptType: val });
                    }}
                    id="reptType"
                    className="md:col-span-2 col-span-1 shadow appearance-none border input-info rounded w-full py-2 px-3 leading-tight placeholder:font-montserrat"
                  >
                    <option value="">select</option>
                    {reportTypeList.length > 0 &&
                      reportTypeList.map((item: GetDailyReportListsJD4, index: number) => {
                        return (
                          <option key={index} value={item.RPT_ID}>
                            {item.RPT_Heading}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyWiseSalesReportPage;
