"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ListApi, UpdateAPI } from "@/app/utils/api";

const ReceiptEntry = ({ params }: { params: { paramId: string } }) => {
  let ID = params.paramId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateApi = new UpdateAPI();
  const listAPI = new ListApi();

  const [formData, setFormData] = useState({
    GCRID: 0,
    compRefNo: "",
    date: "",
    refNo: "",
    party: "",
    partyId: 0,
    qty: "",
    rate: "",
    processingCharges: "",
    numberOfBags: "1",
    remark: "",
  });

  const [loading, setLoading] = useState(true);

  // Fetch receipt details
  const fetchReceiptDetails = async (GCRID: number) => {
    try {
      const response = await listAPI.GetGreenCardamomReceiptByCode(GCRID);
      console.log(response, "rseporasfkasf");

      //   setFormData({
      //     GCRID: parsedData.GCRID,
      //     compRefNo: parsedData.CompRefNo.toString(),
      //     date: formatDate(parsedData.Cdate),
      //     refNo: parsedData.RefNo || "",
      //     party: parsedData.PartyName,
      //     partyId: parsedData.PartyID,
      //     qty: parsedData.GCRecQty.toString(),
      //     rate: parsedData.Rate.toString(),
      //     processingCharges: parsedData.ProcAmount.toString(),
      //     numberOfBags: "1",
      //     remark: parsedData.GCRecRemarks || "",
      //   });
    } catch (error) {
      console.error("Error fetching receipt details:", error);
      alert("Failed to fetch receipt details");
    } finally {
      setLoading(false);
    }
  };

  // Initialize form data from search params and fetch details if GCRID exists
  useEffect(() => {
    const GCRID = parseInt(searchParams.get("GCRID") || "0");
    if (GCRID > 0) {
      fetchReceiptDetails(GCRID);
    } else {
      setFormData((prev) => ({
        ...prev,
        GCRID: GCRID,
        compRefNo: searchParams.get("compRefNo") || "",
        date: searchParams.get("date") || "",
        party: searchParams.get("party") || "",
        partyId: parseInt(searchParams.get("partyId") || "0"),
        qty: searchParams.get("qty") || "",
        rate: searchParams.get("rate") || "",
        processingCharges: searchParams.get("processingCharges") || "",
      }));
      setLoading(false);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-calculate processing charges when qty or rate changes
    if (name === "qty" || name === "rate") {
      const qty = name === "qty" ? parseFloat(value) : parseFloat(formData.qty);
      const rate = name === "rate" ? parseFloat(value) : parseFloat(formData.rate);

      if (!isNaN(qty) && !isNaN(rate)) {
        const charges = (qty * rate).toFixed(2);
        setFormData((prev) => ({
          ...prev,
          processingCharges: charges,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Prepare the request data as an array with a single object
      const reqData = [
        {
          CdateStr: formData.date, // Keep the date in DD-MM-YYYY format
          CompRefNo: parseInt(formData.compRefNo),
          GCRID: formData.GCRID,
          GCRecQty: parseFloat(formData.qty),
          GCRecRemarks: formData.remark || "",
          PartyID: formData.partyId,
          PartyName: formData.party,
          ProcAmount: parseFloat(formData.processingCharges),
          Rate: parseFloat(formData.rate),
          ReceiptAmount: parseFloat(formData.processingCharges),
          ReceiptRemarks: "",
          RefNo: formData.refNo || "",
        },
      ];

      // Make the API call
      const response = await fetch("/api/UpdateGreenCardamomReceipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "UpdateGreenCardamomReceipt",
          description: "UpdateGreenCardamomReceipt",
          ReqJSonData: reqData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result && Array.isArray(result) && result[0]?.ActionType === 1) {
          router.push("/dashboard/cardamommanagement");
          router.refresh();
        } else {
          const errorMessage = result[0]?.ErrorMessage || "Unexpected error";
          alert("Failed to update: " + errorMessage);
        }
      } else {
        alert("Failed to update: Server error");
      }
    } catch (error) {
      console.error("Error saving form:", error);
      alert("An error occurred while saving: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleClose = () => {
    router.push("/dashboard/cardamommanagement");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl">
        <div className="bg-blue-600 text-white p-4 text-xl font-semibold text-center rounded-t-lg">Green Cardamom Receipt Entry</div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Form fields remain the same */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Comp Ref. No.</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="compRefNo"
                  value={formData.compRefNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded bg-green-100"
                  readOnly
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Date</label>
              <input
                type="text"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Ref No.</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="refNo"
                  value={formData.refNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
                <button type="button" className="px-4 py-2 bg-red-500 text-white rounded">
                  Edit
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-600">Party</label>
            <input
              type="text"
              name="party"
              value={formData.party}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Qty</label>
              <input
                type="number"
                name="qty"
                value={formData.qty}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
                step="0.001"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Rate</label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Processing Charges</label>
              <input
                type="text"
                name="processingCharges"
                value={formData.processingCharges}
                className="w-full px-3 py-2 border rounded bg-green-100"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">No. Of Bags</label>
              <input
                type="number"
                name="numberOfBags"
                value={formData.numberOfBags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-600">Remark</label>
            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded h-24 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              Save
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceiptEntry;
