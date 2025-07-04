"use client";

import { useModal } from "@/Provider";
import { stateCode } from "@/app/restaurants-bill/_components/help";
import { GetPartyMasterByCode, UpdateAccountBook } from "@/app/restaurants-bill/action";
import { AccountLedgerInterface } from "@/app/restaurants-bill/types";
import { ListApi } from "@/app/utils/api";
import PartyListDetailModal from "@/components/Admin/PartyListDetailModal";
import BackButton from "@/components/BackButton";
import CustomModal from "@/components/Modal";
import { Spinner } from "@/components/Spinner";
import LocationUpdateForm from "@/components/common/LocationUpdateForm";
import { PartyItemType } from "@/types";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import deleteLoc from "../../../public/images/svg/delete.svg";

interface LocationData {
  Address: string;
  latitude: string;
  longitude: string;
  PartyId: string;
  PartyName: string;
  existingPlace: string;
  existingAddress: string;
  existingLatLong: string;
  existing: string | boolean;
  PartyAddress: string;
  LocAprYN: boolean;
  place: string;
  edit: boolean;
}

const PartyList = () => {
  const listAPI = new ListApi();

  const { isOpen, setOpen } = useModal();

  const [partyList, setPartyList] = useState<PartyItemType[]>([]);
  const [partyFilterList, setPartyFilterList] = useState<PartyItemType[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<PartyItemType | Partial<PartyItemType>>({});
  const [suggestion, setSuggestion] = useState<PartyItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [exclude0Checked, setExclude0Checked] = useState(false);
  const [sortValue, setSortValue] = useState("");
  const [addParty, setAddParty] = useState<AccountLedgerInterface | Partial<AccountLedgerInterface>>({});
  const [addPartyModal, setAddPartyModal] = useState(false);
  const [isCrChecked, setIsCrChecked] = useState(false);
  const [totalSum, setTotalSum] = useState({
    grandTotal: "0",
    Total: "",
    Due: "",
    Advance: "",
  });

  const [locationData, setLocationData] = useState<LocationData | Partial<LocationData>>({
    Address: "",
    latitude: "",
    longitude: "",
    PartyId: "",
    PartyName: "",
    PartyAddress: "",
    LocAprYN: false,
    place: "",
    edit: false,
    existing: "",
    existingAddress: "",
    existingLatLong: "",
    existingPlace: "",
  });

  const [group, setGroup] = useState("Sundry Debtors");

  const [showSearch, setShowSearch] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const storedUserYear = localStorage.getItem("UserYear") as string;
      const filterChecked = localStorage.getItem("filterChecked");
      const filterParts = filterChecked?.split("_") as string[];

      if (storedUserYear) {
        const parts = storedUserYear.split("_");
        const year = parts[1] || "";
        const route = parts[3] !== "null" && parts[3] !== undefined ? parts[3] : "";

        const response = await listAPI.getPartyNBalanceList(parseInt(year), "", "", route, group);

        if (response) {
          setPartyList(response.PartyList);
          let ue = response.PartyList;

          if (filterChecked && filterParts[0]) {
            setSortValue(filterParts[0]);

            switch (filterParts[0]) {
              case "A-Z":
                ue = ue.sort((a: PartyItemType, b: PartyItemType) => a.Byr_nam.localeCompare(b.Byr_nam));
                break;
              case "Z-A":
                ue = ue.sort((a: PartyItemType, b: PartyItemType) => b.Byr_nam.localeCompare(a.Byr_nam));
                break;
              case "L-H":
                ue = ue.sort((a: PartyItemType, b: PartyItemType) => a.Balance - b.Balance);
                break;
              case "H-L":
                ue = ue.sort((a: PartyItemType, b: PartyItemType) => b.Balance - a.Balance);
                break;
              default:
                break;
            }

            if (filterParts[1] === "true") {
              setExclude0Checked(true);
              ue = ue.filter((item: PartyItemType) => item.Balance != 0);
            }
          }

          setPartyFilterList(ue);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [group]); // if group filter is on put group in this

  useEffect(() => {
    if (searchTerm?.length > 0) {
      if (searchTerm?.length === 0) setSuggestion([]);
      setShowSearch(true);
      const filteredList: PartyItemType[] = partyList?.filter(
        (item) =>
          item?.Byr_nam.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item?.AccAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setSuggestion(filteredList);
    }
  }, [searchTerm, partyList]);

  useEffect(() => {
    if (searchTerm?.length > 0) {
      if (searchTerm?.length === 0) setPartyFilterList([]);
      setShowSearch(true);
      const filteredList = partyList?.filter(
        (item) =>
          item?.Byr_nam.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item?.AccAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setPartyFilterList(filteredList);
    }
    setPartyFilterList(partyList);
  }, [searchTerm]);

  const handleBuyerClick = (item: PartyItemType) => {
    setSelectedBuyer(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  function switchPartyfilter(val: string) {
    setLoading(true);
    let ue: PartyItemType[] = [...partyFilterList];

    switch (val) {
      case "A-Z":
        ue = [...partyFilterList].sort((a, b) => a.Byr_nam.localeCompare(b.Byr_nam));
        break;
      case "Z-A":
        ue = [...partyFilterList].sort((a, b) => b.Byr_nam.localeCompare(a.Byr_nam));
        break;
      case "L-H":
        ue = [...partyFilterList].sort((a, b) => a.Balance - b.Balance);
        break;
      case "H-L":
        ue = [...partyFilterList].sort((a, b) => b.Balance - a.Balance);
        break;
    }

    setPartyFilterList(ue);
    setLoading(false);
  }

  const handleSort = (e: string) => {
    switchPartyfilter(e);
    setSortValue(e);
    const vl = `${e}_${exclude0Checked}`;
    localStorage.setItem("filterChecked", vl);
  };

  const handleCreditorsAndDebtors = (e: string) => {
    setGroup(e);
  };

  const generateSums = (partyList: PartyItemType[]) => {
    const sumsByColor: Record<"GREEN" | "RED" | "BLUE", number> = {
      GREEN: 0,
      RED: 0,
      BLUE: 0,
    };

    let total = 0;

    partyList?.forEach((item) => {
      const balance = item?.Balance || 0;
      const balColor = (item?.BalColor || "").toUpperCase() as keyof typeof sumsByColor;

      total += balance;

      if (balColor in sumsByColor) {
        sumsByColor[balColor] += balance;
      }
    });

    return {
      Advance: sumsByColor.BLUE.toFixed(2),
      Due: sumsByColor.GREEN.toFixed(2),
      Total: sumsByColor.RED.toFixed(2),
      GrandTotal: total.toFixed(2),
    };
  };

  useEffect(() => {
    if (partyList.length > 0) {
      const response = generateSums(partyList);
      setTotalSum({ Total: response?.Total, Advance: response?.Advance, Due: response?.Due, grandTotal: response?.GrandTotal });
    }
  }, [partyList]);

  const getLocationPlace = (response: any) => {
    if (response?.address) {
      return response.address.neighbourhood || response.address.town || response.address.village;
    }

    return undefined;
  };

  const handleDeleteLocationUpdate = async (item: PartyItemType) => {
    setLoading(true);
    const fetchDetails = await listAPI.getPartyLocationDetails(item?.AccAutoIDClient);
    const jsonData1Array = JSON.parse(fetchDetails[0].JSONData1);
  };

  function checkExclue(val: boolean) {
    if (val === true) {
      setPartyFilterList(partyFilterList?.filter((item) => item.Balance !== 0));
    } else {
      setPartyFilterList(partyList);
    }
  }

  const handleExclue0 = (e: React.ChangeEvent<HTMLInputElement>) => {
    checkExclue(e.target.checked);

    setExclude0Checked(e.target.checked);
    const vl = `${sortValue}_${e.target.checked}`;
    localStorage.setItem("filterChecked", vl);
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
      if (action > 0) {
        let JSONData1Remarks = response[0]?.JSONData1Remarks;
        toast.success(JSONData1Remarks);
        setAddParty({});
        setAddPartyModal(false);
        fetchData();
      } else {
        let ErrorMessage = response[0]?.ErrorMessage;
        toast.error(ErrorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="bg-slate-50 min-h-screen shadow-md mt-24 sm:mt-20 md:mt-0 flex items-start justify-start">
        {loading && <Spinner />}
        <div className="w-full md:w-4/5 lg:w-11/12 mx-auto p-2 md:p-4 lg:p-6 xl:p-8">
          {isOpen && <CustomModal children={<LocationUpdateForm locationData={locationData} />} title="Location"></CustomModal>}
          <div className="flex flex-col mt-2 mb-1 lg:mt-0 md:mt-20 items-center justify-between">
            <div className="flex gap-2 w-full my-1 justify-between">
              <BackButton />
              <div className="flex justify-center gap-2 items-center">
                <button
                  className="bg-stone-700 text-white rounded-md shadow-sm text-base font-poppins font-medium px-3 py-1 cursor-pointer"
                  type="button"
                  onClick={() => {
                    handleAddParty();
                  }}
                >
                  New Party
                </button>
                <select
                  name=""
                  value={sortValue}
                  onChange={(e) => handleSort(e.target.value)}
                  className="w-fit px-4 py-2 rounded-md border border-blue-500 input-info"
                  id=""
                >
                  <option value="">--select--</option>
                  <option value="H-L">sort H-L</option>
                  <option value="L-H">sort L-H</option>
                  <option value="A-Z">sort A-Z</option>
                  <option value="Z-A">sort Z-A</option>
                </select>
                <select
                  name=""
                  onChange={(e) => handleCreditorsAndDebtors(e.target.value)}
                  className="w-fit p-2 rounded-md border border-blue-500 input-info"
                  value={group}
                  id=""
                >
                  <option value="">--select--</option>
                  <option value="Sundry Debtors">Sundry Debtors</option>
                  <option value="Sundry Creditors">Sundry Creditors</option>
                </select>
              </div>
            </div>
            <div className="relative mt-1 w-full">
              <input
                type="text"
                placeholder="Search by Item Name"
                className="px-4 w-full py-2 rounded-md border border-blue-500 input-info"
                onClick={() => setShowSearch(!showSearch)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute top-10 max-h-40 h-auto z-40 overflow-auto w-2/3 md:w-1/3 left-0 mx-auto">
                {showSearch &&
                  suggestion.length > 0 &&
                  suggestion.map((item) => (
                    <div key={item.AccAutoID} className="w-full bg-white p-0.5 rounded">
                      <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                        <div
                          className="text-md font-semibold text-success-content cursor-pointer"
                          onClick={() => {
                            // setPartySelected("selectParty");
                            handleBuyerClick(item);
                          }}
                        >
                          {item.Byr_nam}
                        </div>
                        <div className="text-sm font-medium text-success-content">{item.AccAddress}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end flex-wrap gap-1 md:gap-2 w-full">
            <div className="flex items-center gap-1">
              <label htmlFor="exclude0" className="font-bold text-black">
                Exclude 0
              </label>
              <input type="checkbox" checked={exclude0Checked} onChange={handleExclue0} id="exclude0" className="size-5" />
              <div className="font-bold my-0.5 p-0.5 w-fit border-black border-solid border bg-[#f0f0f0]">
                GT: <strong>{totalSum.grandTotal}</strong>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex justify-end font-bold my-1 p-0.5 border gap-2 text-sm md:text-base w-fit border-black border-solid bg-[#f0f0f0]">
                <div className="text-red-600">{totalSum?.Total} </div>|<div className="text-blue-600">{totalSum?.Advance} </div>|
                <div className="text-green-600">{totalSum?.Due}</div>
              </div>
            </div>
          </div>
          <div className="grid lg:hidden mt-3 grid-cols-1 gap-3 max-h-[30rem] overflow-y-auto">
            {partyFilterList &&
              partyFilterList.map((item: PartyItemType) => (
                <div key={item.AccAutoID} className="bg-[#FAF9F6] border border-blue-200 shadow-md rounded-lg  overflow-hidden">
                  <div className="p-4 flex items-center">
                    <div className="flex w-full justify-between">
                      <div>
                        <p
                          onClick={() => handleBuyerClick(item)}
                          className="text-warning-content md:text-base text-sm cursor-pointer font-extrabold mb-2"
                        >
                          {item.Byr_nam}
                        </p>
                        <p onClick={() => handleBuyerClick(item)} className="text-warning-content md:text-base text-sm cursor-pointer">
                          {item.AccAddress}
                        </p>
                        <p className="text-warning-content md:text-base text-sm">{item.PhoneNo}</p>
                        <p className="text-warning-content md:text-base text-sm">{item.VATNO}</p>
                        <p className="text-warning-content md:text-base text-sm">{item.PartyRemarks}</p>
                      </div>
                      <div className="flex gap-2 flex-col">
                        <p
                          className={`p-2 mr-7 font-bold w-32 ${
                            item?.BalColor === "GREEN"
                              ? "bg-green-600 text-white"
                              : item?.BalColor === "BLUE"
                              ? "bg-blue-600 text-white"
                              : item?.BalColor === "RED"
                              ? "bg-red-600 text-white"
                              : "bg-white text-black"
                          }`}
                        >
                          {item.Balance}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="bg-white hidden lg:block  shadow  sm:rounded-lg overflow-auto max-h-96 h-96">
            <table className="divide-y table divide-gray-200">
              <thead className="bg-primary sticky top-0 ">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Buyer name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">GSTNO</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Remark</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partyFilterList &&
                  partyFilterList.map((item) => (
                    <tr className=" cursor-pointer" key={item.AccAutoID}>
                      <td onClick={() => handleBuyerClick(item)} className="px-2 py-4 cursor-pointer">
                        {item.Byr_nam}
                      </td>
                      <td onClick={() => handleBuyerClick(item)} className="px-2 py-4 cursor-pointer">
                        {item.AccAddress}
                      </td>
                      <td className="px-2 py-4 ">{item.PhoneNo}</td>
                      <td className="px-2 py-4 ">{item.VATNO}</td>
                      <td
                        className={`px-2 py-4 mr-7 ${
                          item.BalColor === "GREEN"
                            ? "bg-green-600 text-white"
                            : item.BalColor === "BLUE"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-black"
                        }`}
                      >
                        {item.Balance}
                      </td>
                      <td className="px-2 py-4 ">{item.PartyRemarks}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div>
          <div
            id="default-modal"
            aria-hidden="true"
            className="overflow-y-auto  overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0"
          >
            <div className="relative p-4 w-full h-screen flex justify-center items-center max-w-screen max-h-screen">
              <div className="absolute inset-0 bg-black opacity-35 w-full h-full"></div>
              <div className="relative bg-white z-[100000] w-full max-h-screen overflow-auto md:w-fit md:min-w-[90%] rounded-lg shadow-xl">
                <div className="flex items-center w-full p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                  <h3 className="text-xl w-full font-semibold text-center mx-auto text-gray-900">Party Details</h3>
                  <button
                    type="button"
                    onClick={handleCloseModal}
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
                <div className="p-4 md:p-5 overflow-auto space-y-4">
                  <PartyListDetailModal
                    buyerName={selectedBuyer.Byr_nam}
                    gst={selectedBuyer.VATNO}
                    buyerNameAdd={selectedBuyer.AccAddress}
                    accAutoID={selectedBuyer.AccAutoID}
                  />
                </div>
              </div>
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

export default PartyList;
