"use client";

import { LocationData } from "@/types";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RiLoader2Fill } from "react-icons/ri";
import { toast } from "react-toastify";
import { GetCounterMasterList } from "./restaurants-bill/action";
import { CounterInterface } from "./restaurants-bill/types";

const currentYear = new Date().getFullYear().toString();
const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
let yearToUse = currentYear;

if (currentMonth < 4) {
  yearToUse = (parseInt(yearToUse) - 1).toString();
}

export default function HomeEnd() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0] // Format: YYYY-MM-DD
  );
  const [selectedCounter, setSelectedCounter] = useState<string>("ALL");
  const [submitted, setSubmitted] = useState(false);
  const [locationData, setLocationData] = useState<LocationData>({
    EntLocID: "0",
    AccAutoID: 0,
    CDateStr: "",
    LocLatLong: "",
    LocationString: "",
    LocPlace: "",
    AprUser: "",
    Module: "",
    Reason: "",
    Remarks: "",
  });
  const router = useRouter();
  const [counter, setCounter] = useState<CounterInterface[]>([]);

  const fetchGetCounterMasterList = async () => {
    try {
      const response = await GetCounterMasterList();
      const JSONData1 = JSON.parse(response[0]?.JSONData1);
      setCounter(JSONData1);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchGetCounterMasterList();
  }, []);

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const saveUser = () => {
    const username = usernameRef.current?.value.replace(/\s/g, "").toUpperCase();

    // Extract year from selected date
    const userYear = selectedDate ? new Date(selectedDate).getFullYear().toString() : "0";

    if (username && userYear) {
      const userKey = `${username}_${userYear}___${selectedCounter}`;
      localStorage.setItem("UserYear", userKey);
    }
  };

  const handleLogin = async () => {
    setSubmitted(true);
    saveUser();

    // Extract year from selected date for validation
    const selectedYear = selectedDate ? new Date(selectedDate).getFullYear().toString() : "";

    if (usernameRef.current?.value && passwordRef?.current?.value && selectedYear) {
      setLocationData({ ...locationData, AprUser: usernameRef?.current?.value });
      const LoginHandle = await signIn("credentials", {
        username: usernameRef.current?.value.replace(/\s/g, "").toUpperCase(),
        password: passwordRef.current?.value,
        vehicle: "",
        route: "",
        locationData: "",
        callbackUrl: "/auth-redirect",
        redirect: false,
      });
      if (LoginHandle?.ok) {
        toast.success("success");
        if (LoginHandle?.url) {
          router.push(LoginHandle.url);
          setSubmitted(false);
        }
      } else {
        setSubmitted(false);
        toast.warning("invalid credentials");
        router.refresh();
      }
    } else {
      setSubmitted(false);
      toast.warning("please fill the credentials");
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center px-8 py-8 md:px-6 md:py-6 justify-center bg-gradient-to-br from-green-300 via-blue-500 to-purple-600">
        <div className="bg-white h-auto shadow-md rounded-lg p-8 sm:max-w-md max-w-sm  w-full space-y-6">
          <h2 className="md:text-2xl text-xl customFont mb-3 font-extrabold text-center text-gray-800">
            Welcome to <span className="text-blue-600">Cloud Commerce</span>
            <span className="text-red-600">!</span>
          </h2>
          <form className="space-y-6 relative top-3" autoComplete="off">
            <div>
              <input
                ref={usernameRef}
                autoComplete="off"
                autoCapitalize="off"
                type="text"
                placeholder="Username"
                className="w-full shadow-md rounded-sm bg-slate-50 border border-gray-100 py-3 px-4 placeholder-gray-600 focus:outline-none focus:border-slate-500"
              />
            </div>
            <div>
              <input
                ref={passwordRef}
                type="password"
                placeholder="Password"
                autoComplete="off"
                autoCapitalize="off"
                className="w-full rounded-md shadow-sm bg-slate-50  border border-gray-100 py-3 px-4 placeholder-gray-600 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="text-center w-full flex justify-evenly items-center gap-2">
              <label className="text-gray-600 basis-1/2">Select Counter:</label>

              <div className="flex flex-col mt-0 justify-center basis-1/2">
                <select
                  className="w-full mx-auto rounded-md shadow-sm flex justify-center bg-slate-50 border border-gray-100 py-3 px-4 placeholder-gray-600 focus:outline-none focus:border-slate-500"
                  value={selectedCounter}
                  onChange={(e) => setSelectedCounter(e.target.value)}
                >
                  <option value="ALL">All</option>
                  {counter?.map((data, ind) => {
                    return (
                      <option key={ind} value={data.CounterName}>
                        {data.CounterName}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div>
              {submitted ? (
                <>
                  <button
                    type="button"
                    className="w-full flex flex-row px-4 py-3 justify-center bg-gray-900 rounded-md text-white font-semibold  shadow-sm transition duration-300"
                  >
                    <span>
                      <RiLoader2Fill className="animate-spin" color="white" size="27" />
                    </span>
                    Loading
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="w-full px-4 py-3  bg-gray-900 rounded-md text-white font-semibold  shadow-sm transition duration-300"
                  onClick={handleLogin}
                >
                  Sign In
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
