// @ts-nocheck
"use client";
import { ListApi } from "@/app/utils/api";
import { Spinner } from "@/components/Spinner";
import { formatDate2, getNextDay } from "@/lib/helper-function";
import { NewExpenseInterface } from "@/types";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

type Props = {
  EmpAutoid?: string;
  Month?: string;
  EmpName?: string;
  userCode?: string;
  userId?: string;
  newExpenseData?: NewExpenseInterface[];
};

type AttendanceData = {
  OTDay: string | any;
  AllAmt: string | any;
  DedAmt: string | any;
  TotAmt: string | any;
  OTWHrs: string | any;
  OTWMins: string | any;
};

const AttendanceModal = (Props: Props) => {
  const listAPI = new ListApi();
  const session = useSession();
  const componentRef = useRef();

  const [year, setYear] = useState(new Date().getFullYear());
  const modalContentRef = useRef(null);
  const [showForm, setShowForm] = useState(true);
  const [date, setDate] = useState(getNextDay());
  const [currentMonth, setCurrentMonth] = useState();
  const [updated, setUpdated] = useState(false);

  const [eventData, setEventData] = useState([]);
  const [month, setMonth] = useState(Props?.Month);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState();
  const [extradutyData, setExtradutyData] = useState<AttendanceData>({});
  const calendarRef = useRef(null);

  const currentDate = new Date();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.on("datesSet", (arg) => {
        const title = arg.view?.title;
        const words = title.split(" ");
        setCurrentMonth(words[0]);
        setMonth(words[0]);
        setYear(words[1]);
      });
    }
  }, []);

  const formatCalender = (dateStr: string) => {
    const splitStr = dateStr.split("-");
    const day = splitStr[0];
    const month = splitStr[1];
    const yer = splitStr[2];
    return `${yer}-${month}-${day}`;
  };

  const fetchAttendanceModalData = async () => {
    setLoading(true);
    try {
      const response = await listAPI.getDailyAttendanceByDateAndUser(formatDate2(date), Props?.userCode);
      if (response) {
        setModalData(response);
        setExtradutyData({
          ...extradutyData,
          AllAmt: response[0]?.AllAmt,
          DedAmt: response[0]?.DedAmt,
          OTDay: response[0]?.OTDay,
          OTWHrs: response[0]?.OTWHrs,
          OTWMins: response[0]?.OTWMins,
          TotAmt: response[0]?.TotAmt,
        });
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (Props?.EmpAutoid) {
      fetchAttendanceModalData();
    }
  }, [date]);

  const handleDateClick = async (info) => {
    if (modalContentRef?.current) {
      document.querySelector(".modal-content").scrollTop = 0;
      modalContentRef.current.scrollTop = 0;
    }
    setDate(info.date);
  };

  useEffect(() => {
    setShowForm(!showForm);
  }, [updated]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const storedUserYear = localStorage.getItem("UserYear");

      if (Props?.Month) {
        if (storedUserYear) {
          const response = await listAPI.getEmployeeAttListByCode(year, Props?.Month, Props?.EmpAutoid);

          if (response) {
            let eve = [];

            const filterEvent = response?.map((item, index) => {
              const calenderFormattedDate = formatCalender(item?.AttDateStr);
              let checkOT;
              if (item?.OTWHrs !== 0 || item?.OTWMins !== 0 || item?.OTDay !== 0) checkOT = true;
              else checkOT = false;
              if (item?.AttType1 === "P") {
                if (checkOT) {
                  eve.push({
                    date: calenderFormattedDate,
                    title: `${item?.AttType1}`,
                    color: "#15803d",
                  });
                } else {
                  eve.push({
                    date: calenderFormattedDate,
                    title: `${item?.AttType1}`,
                    color: "#4ade80",
                  });
                }
              } else if (item?.AttType1 === "Ab" || item?.AttType1 === "AB") {
                eve.push({ date: calenderFormattedDate, title: `${item?.AttType1}`, color: "#E72929" });
              } else if (item?.AttType1 === "LV") {
                eve.push({ date: calenderFormattedDate, title: `${item?.AttType1}`, color: "#facc15" });
              } else if (item?.AttType1 === "HD") {
                eve.push({ date: calenderFormattedDate, title: `${item?.AttType1}`, color: "#bef264" });
              } else if (item?.AttType1 === "H") {
                eve.push({ date: calenderFormattedDate, title: `${item?.AttType1}`, color: "#22d3ee" });
              } else if (item?.AttType1 === "WO") {
                eve.push({ date: calenderFormattedDate, title: `${item?.AttType1}`, color: "#422006" });
              } else {
                eve.push({ date: calenderFormattedDate, title: `${item?.AttType1}`, color: "#AD88C6" });
              }
            });
            setEventData(eve);
            setLoading(false);
          }
          setLoading(false);
        }
      } else {
        if (storedUserYear) {
          if (currentMonth) {
            const response = await listAPI.getEmployeeAttListByCode(year, currentMonth, Props?.EmpAutoid);

            if (response) {
              let eve = [];

              const filterEvent = response?.map((item, index) => {
                const calenderFormattedDate = formatCalender(item?.AttDateStr);
                let checkOT;
                if (item?.OTWHrs !== 0 || item?.OTWMins !== 0 || item?.OTDay !== 0) checkOT = true;
                else checkOT = false;
                if (item?.AttType1 === "P") {
                  if (checkOT) {
                    eve.push({
                      date: calenderFormattedDate,
                      title: `${item?.AttType1}`,
                      color: "#15803d",
                    });
                  } else {
                    eve.push({
                      date: calenderFormattedDate,
                      title: `${item?.AttType1}`,
                      color: "#4ade80",
                    });
                  }
                } else if (item?.AttType1 === "Ab" || item?.AttType1 === "AB") {
                  eve.push({
                    date: calenderFormattedDate,
                    title: `${item?.AttType1}`,
                    color: "#E72929",
                  });
                } else if (item?.AttType1 === "LV") {
                  eve.push({
                    date: calenderFormattedDate,
                    title: `${item?.AttType1}`,
                    color: "#facc15",
                  });
                } else if (item?.AttType1 === "HD") {
                  eve.push({
                    date: calenderFormattedDate,
                    title: `${item?.AttType1}`,
                    color: "#bef264",
                  });
                } else if (item?.AttType1 === "H") {
                  eve.push({
                    date: calenderFormattedDate,
                    title: `${item?.AttType1}`,
                    color: "#22d3ee",
                  });
                } else if (item?.AttType1 === "WO") {
                  eve.push({
                    date: calenderFormattedDate,
                    title: `${item?.AttType1}`,
                    color: "#422006",
                  });
                } else {
                  eve.push({
                    date: calenderFormattedDate,
                    title: `${item?.AttType1}`,
                    color: "#AD88C6",
                  });
                }
              });
              setEventData(eve);
              setLoading(false);
            }
          }
          setLoading(false);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setMonth(monthNames[currentDate.getMonth()]);
    setCurrentMonth(monthNames[currentDate.getMonth()]);
  }, [session.data?.user.role]);

  useEffect(() => {
    fetchData();
  }, [session.data?.user.role, Props?.Month, currentMonth, updated]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <>
      <div className="flex max-h-[87vh] h-full overflow-auto w-full">
        <div className="w-full p-1 md:p-4">
          {loading && <Spinner />}
          <div className="bg-white shadow-md rounded p-4 md:px-8 md:py-7 mb-4">
            <div className="flex gap-2 justify-start flex-wrap items-center">
              <h2 className="font-medium text-lg text-black box-border">
                <strong>{Props?.EmpName}</strong>
              </h2>
              <h2 className="font-medium text-lg text-black box-border">
                userCode: <strong>{Props?.userCode}</strong>
              </h2>
            </div>
            <div className="flex gap-2 justify-start flex-wrap items-center">
              <h2 className="font-medium text-lg text-black box-border">selected Date: {formatDate2(date)}</h2>
            </div>
            <div className="flex flex-col justify-center items-center w-full h-full">
              <div className="max-h-[600px] h-fit max-w-[450px] min-w-max w-full">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                  headerToolbar={{
                    left: "prev,next today",
                    right: "title",
                  }}
                  ref={calendarRef}
                  viewClassNames="text-base"
                  height={600}
                  dayCellClassNames="hover:scale-110 hover:font-semibold mx-auto w-full"
                  initialView="dayGridMonth"
                  dateClick={handleDateClick}
                  nowIndicator={true}
                  editable={true}
                  events={eventData}
                  selectable={true}
                  selectMirror={true}
                />
              </div>
              <div className="flex my-1 flex-wrap gap-2 md:text-sm text-xs font-semibold">
                <div className=" w-fit">
                  <span className="size-2.5 bg-[#4ade80] border border-solid">&nbsp; &nbsp;</span>
                  Present
                </div>
                <div className=" w-fit">
                  <span className="size-2.5 bg-[#E72929] border border-solid">&nbsp; &nbsp;</span>
                  Absent
                </div>
                <div className=" w-fit">
                  <span className="size-2.5 bg-[#facc15] border border-solid">&nbsp; &nbsp;</span>
                  Leave
                </div>
                <div className=" w-fit">
                  <span className="size-2.5 bg-[#22d3ee] border border-solid">&nbsp; &nbsp;</span>
                  Holiday
                </div>
                <div className=" w-fit">
                  <span className="size-2.5 bg-[#bef264] border border-solid">&nbsp; &nbsp;</span>
                  Half day
                </div>
                <div className=" w-fit">
                  <span className="size-2.5 bg-[#422006] border border-solid">&nbsp; &nbsp;</span>
                  Weekly Off
                </div>
                <div className=" w-fit">
                  <span className="size-2.5 bg-[#15803d] border border-solid">&nbsp; &nbsp;</span>
                  Extra Duty
                </div>
              </div>
              {/* <button className="btn btn-primary" onClick={handlePrint}>
                Print this out!
              </button> */}
              {/* <div ref={componentRef} className="w-full block">
                <div className="flex gap-2 justify-start sm:flex-row flex-col flex-wrap items-start sm:items-center">
                  <h2 className="font-medium text-lg text-black box-border">
                    <strong>{Props?.EmpName}</strong>
                  </h2>
                  <h2 className="font-medium text-lg text-black box-border">
                    userCode: <strong>{Props?.userCode}</strong>
                  </h2>
                </div>
                <div className="flex gap-2 justify-start flex-wrap items-center">
                  <h2 className="font-medium text-lg text-black box-border">Date: {formatDate2(date)}</h2>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default AttendanceModal;
