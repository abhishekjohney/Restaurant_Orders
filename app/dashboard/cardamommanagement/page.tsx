"use client";

import { ListApi, UpdateAPI } from "@/app/utils/api";
import BackButton from "@/components/BackButton";
import CustomFunctionalModal from "@/components/FunctionalModal";
import { Spinner } from "@/components/Spinner";
import { getTodayDate, swapDate, swapDateBack } from "@/lib/helper-function";
import { TransactionInterface, OrganizationConfig, PartyItemType } from "@/types/index";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import React, { useEffect, useRef, useState } from "react";
import { RiLoader2Fill } from "react-icons/ri";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import PrintReceipt from "./PrintReceipt ";

const CardamomManagement = () => {
  const listAPI = new ListApi();
  const updateAPI = new UpdateAPI();
  const componentRef = useRef<HTMLDivElement>(null);

  const [selectedTransaction, setSelectedTransaction] = useState<TransactionInterface>({} as TransactionInterface);
  const [dateFrom, setDateFrom] = useState("");
  const [transactions, setTransactions] = useState<TransactionInterface[]>([]);
  const [filTransactions, setFilTransactions] = useState<TransactionInterface[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQuery2, setSearchQuery2] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [partyList, setPartyList] = useState<PartyItemType[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState<TransactionInterface>({} as TransactionInterface);
  const [filteredPartyList, setFilteredPartyList] = useState<PartyItemType[]>([]);
  const [saveModal, setSaveModal] = useState<boolean>(false);
  const [pdfModal, setPdfModal] = useState<boolean>(false);
  const [pdfLink, setPdfLink] = useState("");
  const [pdfModal2, setPdfModal2] = useState<boolean>(false);
  const [pdfLink2, setPdfLink2] = useState("");
  const [org, setOrg] = useState<OrganizationConfig>({} as OrganizationConfig);
  const [data, setData] = useState({
    dateFrom: "",
    dateUpto: "",
    partyName: "",
    partyCode: "",
    refNo: "",
  });

  // Format date to DD-MM-YYYY
  const formatDate = (date: string): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Parse DD-MM-YYYY to YYYY-MM-DD for input field
  const parseDate = (dateStr: string): string => {
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`;
  };

  const fetchData = async () => {
    if (!data.dateFrom) return toast.warn("Please select a start date");
    if (data.dateUpto && (data.partyCode || data.partyName)) return toast.warn("Please select a upto Date & Party");

    setIsLoading(true);
    try {
      const response = await listAPI.GetGreenCardamomReceiptList(data?.dateFrom, data?.dateUpto, data?.partyName, data?.refNo);
      const action = response[0]?.ActionType;
      if (action > 0) {
        const JSONData1 = JSON.parse(response[0]?.JSONData1);
        setTransactions(JSONData1);
      } else {
        const err = response[0]?.JSONData1Remarks || response[0]?.ErrorMessage || response[0]?.JSONData1;
        setTransactions([]);
        toast.warn(err);
      }
    } catch (error) {
      console.error("Error isLoading transactions:", error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setHasSearched(true);
    fetchData();
  };

  const handleClear = () => {
    setDateFrom("");
    setHasSearched(false);
    setTransactions([]);
    setSelectedTransaction({} as TransactionInterface);
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = e.target.value;
    if (!inputDate) {
      setDateFrom("");
      setHasSearched(false);
      setTransactions([]);
      return;
    }
    const formattedDate = formatDate(inputDate);
    setDateFrom(formattedDate);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await listAPI.getPartyList();
        if (response) {
          const fieldsToExclude = ["Byr_nam", "AccAutoID", "AccAutoIDClient"]; // Define fields to exclude
          const updatedPartyList = response?.PartyList?.map((item: PartyItemType) => {
            const combinedField = Object.keys(item)
              .filter(
                (key) =>
                  !fieldsToExclude.includes(key) &&
                  item[key as keyof PartyItemType] !== null &&
                  item[key as keyof PartyItemType] !== undefined
              )
              .map((key) => item[key as keyof PartyItemType])
              .join(" ")
              .replace(/\s+/g, " ") // Replace multiple spaces with a single space
              .trim();

            return {
              ...item,
              combinedField,
            };
          });

          setPartyList(updatedPartyList);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleRowClick = (transaction: TransactionInterface) => {
    setSelectedTransaction(transaction);
  };

  useEffect(() => {
    const filteredList = transactions?.filter((item) => item?.PartyName.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilTransactions(filteredList);
  }, [searchQuery, transactions]);

  const handleOrder = async (selectedItem: PartyItemType) => {
    setEditData({ ...editData, PartyName: selectedItem.Byr_nam, PartyID: selectedItem.AccAutoID });
    setSearchQuery2(selectedItem.Byr_nam);
    setShowSearch(false);
  };

  useEffect(() => {
    if ((editData?.Rate ?? 0) > 0 || (editData?.GCRecQty ?? 0) > 0) {
      setEditData((prev) => ({
        ...prev!,
        ProcAmount: parseFloat(((prev?.Rate ?? 0) * (prev?.GCRecQty ?? 0)).toFixed(2)), // Convert to number
      }));
    }
  }, [editData?.Rate, editData?.GCRecQty]);

  const showSearchItems = () => {
    if (showSearch) {
      return (
        <div className="absolute top-9 max-h-40 h-auto overflow-auto w-full">
          {filteredPartyList &&
            filteredPartyList.map((item) => (
              <div key={item.AccAutoID} className="w-full bg-white p-0.5 rounded">
                <div className="flex flex-col shadow-lg rounded-md border-2 border-gray-300 p-2 justify-center items-start">
                  <div
                    className="text-md font-semibold text-success-content cursor-pointer"
                    onClick={() => {
                      handleOrder(item);
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

  useEffect(() => {
    if (searchQuery2) {
      if (partyList?.length > 0) {
        const filteredList = partyList.filter(
          (item) =>
            item.Byr_nam.toLowerCase().includes(searchQuery2.toLowerCase()) ||
            item?.AccAddress?.toLocaleLowerCase().includes(searchQuery2?.toLocaleLowerCase())
        );
        setFilteredPartyList(filteredList);
      }
    } else {
      setFilteredPartyList(partyList);
    }
  }, [searchQuery2, partyList]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, da: string) => {
    const inputValue = e.target.value;
    const newDate = swapDateBack(inputValue);
    if (da === "from") {
      setData({ ...data, dateFrom: newDate });
    } else {
      setData({ ...data, dateUpto: newDate });
    }
  };

  const handleEdit = (item: TransactionInterface) => {
    fetchReceiptDetails(item.GCRID);
  };

  const handleAddNew = () => {
    fetchReceiptDetails(0);
  };

  // Fetch receipt details
  const fetchReceiptDetails = async (GCRID: number) => {
    try {
      setIsLoading(true);
      const response = await listAPI.GetGreenCardamomReceiptByCode(GCRID);
      const action = response[0]?.ActionType;

      if (action > 0) {
        const JSONData1 = JSON.parse(response[0]?.JSONData1);
        let theData: TransactionInterface = JSONData1[0];
        theData.CdateStr = theData.CdateStr ? swapDate(theData?.CdateStr) : swapDate(getTodayDate());
        setEditData(theData);
        setModal(true);
      } else {
        const err = response[0]?.JSONData1Remarks || response[0]?.ErrorMessage;
        toast.warn(err);
      }
    } catch (error) {
      console.error("Error fetching receipt details:", error);
      alert("Failed to fetch receipt details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Make the API call
      let data = [{ ...editData, CdateStr: swapDateBack(editData?.CdateStr || "") }];
      const response = await updateAPI.UpdateGreenCardamomReceipt(data);
      const action = response[0]?.ActionType;
      if (action > 0) {
        setSelectedTransaction(data[0]);
        toast.success("Success fully updated");
        setModal(false);
        setSaveModal(true);
        setEditData({} as TransactionInterface);
        const JSONData2: OrganizationConfig[] = JSON.parse(response[0]?.JSONData2);
        setOrg(JSONData2[0]);
      } else {
        const err = response[0]?.ErrorMessage || response[0]?.JSONData1Remarks;
        toast.warn(err);
      }
    } catch (error) {
      console.error("Error saving form:", error);
      alert("An error occurred while saving: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef?.current || null,
  });

  return (
    <>
      <Dialog open={saveModal} as="div" className="relative z-50 focus:outline-none" onClose={setSaveModal}>
        <div className="fixed inset-0 z-50 w-screen bg-black/15 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full md:w-fit md:max-w-3xl lg:max-w-5xl max-w-full rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              <>
                <DialogTitle as="h3" className="text-base/7 font-medium text-black">
                  Print Options
                </DialogTitle>
                <div className="py-4">
                  <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1">
                      <div className="flex justify-center items-center">
                        <div className="pro-detail w-full lg:pl-8 xl:pl-16 max-lg:mx-auto max-lg:mt-8">
                          <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-2">
                            <div className="p-1">
                              <button
                                onClick={() => {
                                  setPdfModal(true);
                                }}
                                type="button"
                                className="px-3 py-2 rounded-md bg-green-700 text-white font-medium"
                              >
                                Print A4
                              </button>
                            </div>
                            <div className="p-1">
                              <button
                                onClick={() => {
                                  setPdfModal2(true);
                                }}
                                type="button"
                                className="px-3 py-2 rounded-md bg-green-700 text-white font-medium"
                              >
                                Print 2 inch
                              </button>
                            </div>
                            <div className="p-1">
                              <button
                                onClick={() => {
                                  setSaveModal(false);
                                }}
                                type="button"
                                className="px-3 py-2 rounded-md bg-green-700 text-white font-medium"
                              >
                                Close
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

      {pdfModal && (
        <CustomFunctionalModal close={setPdfModal} title="Print Date Wise Sales Report">
          <div className="min-w-96 md:min-w-[800px] w-full">
            <div>
              <button
                type="button"
                className="rounded-md bg-blue-500 border border-solid border-black text-black font-medium text-base w-fit px-3 py-2"
                onClick={handlePrint}
              >
                Print
              </button>
            </div>
            <div ref={componentRef} className="max-w-sm mx-auto p-4 border rounded-lg shadow-lg bg-white text-black text-center">
              <h2 className="text-lg font-bold">{org.ORGNAME}</h2>
              <p className="text-sm">Reg.No. {org.ORGREGNO}</p>
              <p className="text-sm">
                {org.ORGSTREET}, {org.ORGPLACE}, {org.ORGDISTRICT}, {org.ORGSTATE}
              </p>
              <p className="text-sm">{org.PH}</p>
              <hr className="my-2" />
              <h3 className="text-md font-semibold">Cardamom Receipt</h3>
              <div className="text-left mt-4">
                <p>
                  <strong>To:</strong> {selectedTransaction.PartyName}
                </p>
                <p>
                  <strong>Address:</strong>
                </p>
                <p>
                  <strong>Computer Ref. No.:</strong> {selectedTransaction.CompRefNo}
                </p>
                <p>
                  <strong>Dated:</strong> {swapDateBack(selectedTransaction.CdateStr)}
                </p>
              </div>
              <hr className="my-2" />
              <div className="text-left">
                <p>
                  <strong>Quantity Received:</strong> <span className="float-right font-bold">{selectedTransaction.GCRecQty}</span>
                </p>
                <p>
                  <strong>Rate Per KG:</strong> <span className="float-right font-bold">{selectedTransaction.Rate}</span>
                </p>
                <p>
                  <strong>Processing Charges:</strong> <span className="float-right font-bold">{selectedTransaction.ProcAmount}</span>
                </p>
                <p>
                  <strong>Number of Bags:</strong> <span className="float-right font-bold">{selectedTransaction.Works}</span>
                </p>
              </div>
              <hr className="my-2" />
              <div className="mt-4 text-center">
                <p>
                  <strong>For</strong>
                </p>
                <p className="font-bold">RAJAKUMARY SPICES PRODUCERS COMPANY</p>
                <p className="mt-4 font-semibold">Auth. Signatory</p>
              </div>
            </div>
          </div>
        </CustomFunctionalModal>
      )}

      {pdfModal2 && (
        <CustomFunctionalModal close={setPdfModal2} title="Print Date Wise Sales Report">
          <div className="min-w-96 md:min-w-[800px] w-full">
            <PrintReceipt transaction={selectedTransaction} onClose={() => setPdfModal2(false)} />
          </div>
        </CustomFunctionalModal>
      )}
      <div className=" bg-slate-100 min-h-screen mt-24 sm:mt-16 md:mt-20 lg:mt-0 shadow-md flex justify-center">
        {isLoading && <Spinner />}

        {modal && (
          <CustomFunctionalModal close={setModal} title={isEdit ? "Edit" : "Add New"}>
            <>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Comp Ref. No.</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="CompRefNo"
                        value={editData?.CompRefNo}
                        className="shadow appearance-none border input-info text-sm rounded w-full py-1 px-1.5 sm:py-2 sm:px-3 leading-tight bg-green-100"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Date</label>
                    <input
                      type="date"
                      name="CdateStr"
                      value={editData?.CdateStr}
                      onChange={(e) => {
                        setEditData((prev) => ({
                          ...prev!,
                          CdateStr: e.target.value,
                        }));
                      }}
                      className="shadow appearance-none border input-info text-sm rounded w-full py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Ref No.</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="RefNo"
                        value={editData?.RefNo}
                        onChange={(e) => {
                          setEditData((prev) => ({
                            ...prev!,
                            RefNo: e.target.value,
                          }));
                        }}
                        className="shadow appearance-none border input-info text-sm rounded w-full py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                      />
                      <button type="button" className="px-4 py-2 bg-red-500 text-white rounded">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative space-y-2">
                  <label className="block text-sm text-gray-600">Party</label>
                  <input
                    type="text"
                    name="PartyName"
                    value={editData?.PartyName || searchQuery2}
                    onChange={(e) => {
                      setSearchQuery2(e.target.value);
                      setShowSearch(true);
                    }}
                    className="shadow appearance-none border input-info text-sm rounded w-full py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                  />
                  {showSearchItems()}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Qty</label>
                    <input
                      type="number"
                      name="GCRecQty"
                      value={editData?.GCRecQty}
                      onChange={(e) => {
                        setEditData((prev) => ({
                          ...prev!,
                          GCRecQty: parseInt(e.target.value),
                        }));
                      }}
                      className="shadow appearance-none border input-info text-sm rounded w-full py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                      step="0.001"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Rate</label>
                    <input
                      type="number"
                      name="Rate"
                      value={editData?.Rate}
                      onChange={(e) => {
                        setEditData((prev) => ({
                          ...prev!,
                          Rate: parseInt(e.target.value),
                        }));
                      }}
                      className="shadow appearance-none border input-info text-sm rounded w-full py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Processing Charges</label>
                    <input
                      type="text"
                      name="ProcAmount"
                      value={editData?.ProcAmount}
                      className="shadow appearance-none border input-info text-sm rounded w-full py-1 px-1.5 sm:py-2 sm:px-3 leading-tight bg-green-100"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">No. Of Bags</label>
                    <input
                      type="number"
                      name="Works"
                      value={editData?.Works}
                      onChange={(e) => {
                        setEditData((prev) => ({
                          ...prev!,
                          Works: parseInt(e.target.value),
                        }));
                      }}
                      className="shadow appearance-none border input-info text-sm rounded w-full py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-gray-600">Remark</label>
                  <textarea
                    name="GCRecRemarks"
                    value={editData?.GCRecRemarks}
                    onChange={(e) => {
                      setEditData((prev) => ({
                        ...prev!,
                        GCRecRemarks: e.target.value,
                      }));
                    }}
                    className="shadow appearance-none border input-info text-sm rounded w-full py-1 px-1.5 sm:py-2 sm:px-3 leading-tight resize"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModal(false);
                    }}
                    className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </form>
            </>
          </CustomFunctionalModal>
        )}
        <div className="w-full md:p-6">
          <div className="bg-slate-100 shadow-md flex-col flex items-start justify-between mb-2 p-2 rounded-lg">
            <div className="flex w-full justify-between items-center">
              <BackButton />
              <h2 className="text-base font-medium text-black">Cardomon Management</h2>
            </div>
            <div className="flex w-full justify-between flex-wrap items-center my-1 gap-2">
              <div className="flex gap-2 justify-start items-center flex-wrap">
                <>
                  <div className="flex justify-start items-center">
                    <label className="text-warning-content me-2 text-center block whitespace-nowrap basis-1/5 text-sm font-semibold">
                      Date From
                    </label>
                    <input
                      type="date"
                      value={swapDate(data.dateFrom)}
                      onChange={(e) => {
                        handleDateChange(e, "from");
                      }}
                      className="shadow appearance-none border input-info text-sm rounded w-fit py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                    />
                  </div>
                  <div className="flex justify-start items-center">
                    <label className="text-warning-content me-2 text-center block whitespace-nowrap basis-1/5 text-sm font-semibold">
                      Date Upto
                    </label>
                    <input
                      type="date"
                      value={swapDate(data.dateUpto)}
                      onChange={(e) => {
                        handleDateChange(e, "upto");
                      }}
                      className="shadow appearance-none border input-info text-sm rounded w-fit py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                    />
                  </div>
                  <div className="flex justify-start items-center">
                    <label className="text-warning-content me-2 text-center block whitespace-nowrap basis-1/5 text-sm font-semibold">
                      Ref No.
                    </label>
                    <input
                      type="text"
                      value={data.refNo}
                      onChange={(e) => {
                        setData({ ...data, refNo: e.target.value });
                      }}
                      className="shadow appearance-none border input-info text-sm rounded w-fit py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                    />
                  </div>
                  <div className="flex justify-start items-center">
                    <label className="text-warning-content me-2 text-center md:block hidden whitespace-nowrap basis-1/5 text-sm font-semibold">
                      Party Name
                    </label>
                    <select
                      name=""
                      value={data.partyCode}
                      onChange={(e) => {
                        let val = e.target.value;
                        let findData = partyList.filter((item) => item.AccAutoIDClient === val);
                        setData({ ...data, partyCode: findData[0]?.AccAutoIDClient, partyName: findData[0]?.Byr_nam });
                      }}
                      className="shadow appearance-none border input-info text-sm rounded max-w-80 w-fit py-1 px-1.5 sm:py-2 sm:px-3 leading-tight"
                      id=""
                    >
                      {partyList?.map((itm) => {
                        return (
                          <>
                            <option key={itm.AccAutoID} value={itm.AccAutoIDClient}>
                              {itm.Byr_nam}
                            </option>
                          </>
                        );
                      })}
                      <option value="">select</option>
                    </select>
                  </div>
                </>
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
              </div>
              <div className="flex justify-end basis-1/2 w-full items-center">
                <div className="flex gap-1 mx-2">
                  <button
                    onClick={fetchData}
                    className="btn btn-primary md:text-base h-fit sm:text-sm text-xs btn-sm md:btn-md text-white font-semibold md:font-bold p-2 md:px-4  rounded"
                  >
                    Filter
                  </button>
                </div>
                <button
                  onClick={handleAddNew}
                  type="button"
                  className="btn btn-primary md:text-base h-fit sm:text-sm text-xs btn-sm md:btn-md text-white font-semibold md:font-bold p-2 md:px-4  rounded"
                >
                  Add New
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:hidden mt-2 p-3 grid-cols-1 gap-6 px-2 sm:grid-cols-2 max-h-[32rem] overflow-y-auto lg:grid-cols-1">
            {transactions &&
              transactions.map((transaction) => (
                <div
                  key={transaction.GCRID}
                  className={`bg-primary shadow-md rounded-lg overflow-hidden p-4 mb-2 ${
                    selectedTransaction?.GCRID === transaction.GCRID ? "border-2 border-blue-500" : ""
                  }`}
                  onClick={() => handleRowClick(transaction)}
                >
                  <h4 className="text-lg font-semibold text-warning-content">Comp. Ref No: {transaction.CompRefNo}</h4>
                  <p className="text-warning-content">Party: {transaction.PartyName}</p>
                  <p className="text-warning-content">Receive Date: {formatDate(transaction.Cdate)}</p>
                  <p className="text-warning-content">Received Qty: {transaction.GCRecQty?.toFixed(3) || "0.000"}</p>
                  <p className="text-warning-content">Processing Charges: {transaction.ProcAmount?.toFixed(2) || "0.00"}</p>
                  <p className="text-warning-content">Stock Entry Date: {formatDate(transaction.StkDate)}</p>
                  <p className="text-warning-content">Stock Qty: {transaction.StkQty?.toFixed(2) || "0.00"}</p>
                  <p className="text-warning-content">Prod. Ratio: {transaction.ProcRatio}</p>
                  <p className="text-warning-content">Del Date: {formatDate(transaction.DelDate)}</p>
                  <p className="text-warning-content">Del Qty: {transaction.DelQty?.toFixed(3) || "0.000"}</p>
                  <p className="text-warning-content">Trans Type: {transaction.DriedYN ? "Dried" : ""}</p>
                  <p className="text-warning-content">Receipt Amount: {transaction.ReceiptAmount?.toFixed(2) || "0.00"}</p>
                  {submitted ? (
                    <button className="bg-error px-4 py-2 rounded-md mt-1 flex items-center">
                      <RiLoader2Fill className="animate-spin mr-2" color="black" size="20" /> Processing...
                    </button>
                  ) : (
                    <button className="bg-error px-4 py-2 rounded-md mt-1" type="button" onClick={() => handleEdit(transaction)}>
                      Select
                    </button>
                  )}
                </div>
              ))}
          </div>

          <div className="bg-slate-100 w-full hidden md:block max-h-96  shadow overflow-auto  sm:rounded-lg">
            <table className=" divide-gray-200 table overflow-x-visible">
              <thead className="bg-primary sticky top-0">
                <tr>
                  {[
                    "Receive Date",
                    "Comp. Ref No",
                    "Party Name",
                    "Received Qty",
                    "Processing Charges",
                    "Stock Entry Date",
                    "Stock Qty",
                    "Prod. Ratio",
                    "Del Date",
                    "Del Qty",
                    "Trans Type",
                    "Receipt Amount",
                    "select",
                  ]?.map((item, ind) => {
                    return (
                      <th
                        className="px-3 py-[6px] text-left text-xs font-medium whitespace-normal text-warning-content uppercase"
                        key={ind}
                      >
                        {item}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-2 py-4 sm:px-4 text-center text-sm sm:text-base">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction, index) => (
                    <tr
                      key={transaction.GCRID}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${
                        selectedTransaction?.GCRID === transaction.GCRID ? "bg-blue-100" : ""
                      } hover:bg-blue-50 cursor-pointer`}
                      onClick={() => handleRowClick(transaction)}
                    >
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(transaction.Cdate)}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                        {transaction.CompRefNo}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                        {transaction.PartyName}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-right text-gray-900 whitespace-nowrap">
                        {transaction.GCRecQty?.toFixed(3) || "0.000"}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-right text-gray-900 whitespace-nowrap">
                        {transaction.ProcAmount?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(transaction.StkDate)}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-right text-gray-900 whitespace-nowrap">
                        {transaction.StkQty?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-center text-gray-900 whitespace-nowrap">
                        {transaction.ProcRatio}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(transaction.DelDate)}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-right text-gray-900 whitespace-nowrap">
                        {transaction.DelQty?.toFixed(3) || "0.000"}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-center text-gray-900 whitespace-nowrap">
                        {transaction.DriedYN ? "Dried" : ""}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-right text-gray-900 whitespace-nowrap">
                        {transaction.ReceiptAmount?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-right text-gray-900 whitespace-nowrap">
                        {submitted ? (
                          <>
                            <button className="mt-4 px-4 py-2 bg-error rounded-md">
                              <span>
                                <RiLoader2Fill className="animate-spin" color="black" size="27" />
                              </span>
                              Processing...
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="mt-4 px-4 py-2 bg-error rounded-md" type="button" onClick={() => handleEdit(transaction)}>
                              Select
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 bg-white rounded-lg shadow-lg">
            <div className="p-2 sm:p-4">
              <h2 className="text-base sm:text-lg font-semibold mb-3">Transactions</h2>
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {["Type", "Date", "Description", "Received", "Issued", "Due Amount", "Received Amount", "select"]?.map(
                            (item, ind) => {
                              return (
                                <th className="px-3 py-[6px] text-left text-xs font-medium text-warning-content uppercase" key={ind}>
                                  {item}
                                </th>
                              );
                            }
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {hasSearched && (
                          <tr className="hover:bg-gray-50">
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">1</td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">{dateFrom}</td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                              Green Cardamom Received
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-right text-gray-900 whitespace-nowrap">
                              75.00
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-right text-gray-900 whitespace-nowrap">
                              0.00
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-right text-gray-900 whitespace-nowrap">
                              750.00
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-right text-gray-900 whitespace-nowrap">
                              0.00
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-right text-gray-900 whitespace-nowrap">
                              0.00
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardamomManagement;
