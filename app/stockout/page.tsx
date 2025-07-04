// Updated StockList Component with checkboxes, action buttons and filter dropdown
"use client";

import { ListApi } from "@/app/utils/api";
import BackButton from "@/components/BackButton";
import { Spinner } from "@/components/Spinner";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { UpdateStockOutTypeStatus } from "../restaurants-bill/action";
import { StockItemType } from "../restaurants-bill/types";

const StockOut = () => {
  const listAPI = new ListApi();
  const cocnut = "/images/noImg.jpg";

  const [stockList, setStockList] = useState<StockItemType[]>([]);
  const [filteredStockList, setFilteredStockList] = useState<StockItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All"); // New state for filter

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await listAPI.GetStockItemListJason();
      const action = response[0]?.ActionType;
      if (action > 0) {
        const JSONData1 = JSON.parse(response[0]?.JSONData1);
        setStockList(JSONData1);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Updated filtering logic to include both search and status filter
  useEffect(() => {
    let filteredList = stockList?.filter((item) => item.itm_NAM.toLowerCase().includes(searchTerm.toLowerCase()));

    // Apply status filter
    if (statusFilter !== "All") {
      filteredList = filteredList?.filter((item) => item.TYPE === statusFilter);
    }

    setFilteredStockList(filteredList);
  }, [searchTerm, stockList, statusFilter]);

  const toggleSelect = (svrstkid: string) => {
    setSelectedItems((prev) => (prev.includes(svrstkid) ? prev.filter((id) => id !== svrstkid) : [...prev, svrstkid]));
  };

  const handleBulkUpdate = async (type: "Active" | "StockOut") => {
    if (selectedItems.length === 0) {
      toast.info("Please select at least one item.");
      return;
    }
    try {
      const response = await UpdateStockOutTypeStatus(selectedItems.join(","), type);
      const action = response[0]?.ActionType;
      if (action > 0) {
        toast.success(`Successfully updated`);
        setSelectedItems([]);
        fetchData();
      } else {
        const ErrorMessage = response[0]?.ErrorMessage;
        toast.error(ErrorMessage);
      }
    } catch (error) {
      console.error("Bulk update error:", error);
      toast.error("Failed to update some items.");
    }
  };

  const handleSelectAllStockOut = () => {
    const stockOutItems = filteredStockList.filter((item) => item.TYPE === "StockOut");
    const stockOutIDs = stockOutItems.map((item) => item.SVRSTKID);

    setSelectedItems((prev) => {
      const newSelection = [...new Set([...prev, ...stockOutIDs])];
      return newSelection;
    });

    const nonStockOutItems = filteredStockList.filter((item) => item.TYPE !== "StockOut");
    const reordered = [...stockOutItems, ...nonStockOutItems];
    setFilteredStockList(reordered);

    toast.success("All 'StockOut' items selected and moved to top.");
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setSelectedItems([]); // Clear selections when filter changes
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {loading && <Spinner />}

      <div className="w-full px-4 py-6 md:px-6 lg:mt-0 mt-20 lg:px-8 xl:px-10">
        <div className="flex flex-row justify-between items-center gap-4 flex-wrap">
          <BackButton />
          <h3 className="md:text-3xl text-xl font-semibold">Stock List Items</h3>

          {/* Filter Dropdown and Action Buttons */}
          <div className="flex flex-row gap-2 flex-wrap items-center">
            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Items</option>
              <option value="Active">Active Only</option>
              <option value="StockOut">StockOut Only</option>
            </select>

            <button onClick={() => handleBulkUpdate("Active")} className="btn btn-success">
              Mark as Active
            </button>
            <button onClick={() => handleBulkUpdate("StockOut")} className="btn btn-error">
              Mark as Stock Out
            </button>
            <button onClick={handleSelectAllStockOut} className="btn btn-warning">
              Select All StockOut
            </button>
          </div>

          <input
            type="text"
            placeholder="Search by Item Name"
            className="w-full md:w-auto px-4 py-2 rounded-md input-info"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredStockList?.length || 0} items
          {statusFilter !== "All" && ` (${statusFilter})`}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>

        {/* Mobile Cards */}
        <div className="grid md:hidden mt-6 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 max-h-[40rem] overflow-y-auto">
          {filteredStockList?.map((item, index) => {
            let img = item.ImageFiles ? item.ImageFiles.split("|")[1] : "";
            let url = img ? `${process.env.NEXT_PUBLIC_WEBSERVICE_URL_REACT_IMAGE_URL}/${img}` : cocnut;
            return (
              <div key={index} className="relative bg-blue-200 border border-blue-200 shadow-md rounded-lg overflow-hidden p-4">
                <input
                  type="checkbox"
                  className="absolute top-2 left-2 size-5"
                  checked={selectedItems.includes(item.SVRSTKID)}
                  onChange={() => toggleSelect(item.SVRSTKID)}
                />
                <h4 className="text-lg text-warning-content font-semibold mb-2 ml-6">{item.itm_NAM}</h4>
                <div className="grid grid-cols-3">
                  <div className="col-span-2">
                    <p className="text-warning-content mb-2">SP: {item.SalePrice}</p>
                    <p className="text-warning-content mb-2">
                      Status:
                      <span
                        className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                          item.TYPE === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.TYPE}
                      </span>
                    </p>
                  </div>
                  <div className="col-span-1">
                    <img
                      src={url}
                      onError={(e) => (e.currentTarget.src = cocnut)}
                      alt="product img"
                      className="size-12 border border-black me-3"
                    />
                  </div>
                </div>
                <p className={`text-${item.FinalStock === "0" ? "error" : "success"} mb-2`}>Stock: {item.FinalStock}</p>
              </div>
            );
          })}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-slate-500 shadow sm:rounded-lg overflow-auto mt-8 customHeightTable">
          <table className="min-w-full divide-y table divide-gray-200">
            <thead className="bg-primary sticky top-0">
              <tr>
                <th className="px-2 py-3"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Sale Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Stock</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStockList?.map((item, index) => {
                let img = item.ImageFiles ? item.ImageFiles.split("|")[1] : "";
                let url = img ? `${process.env.NEXT_PUBLIC_WEBSERVICE_URL_REACT_IMAGE_URL}/${img}` : cocnut;
                return (
                  <tr key={index}>
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        className="size-5"
                        checked={selectedItems.includes(item.SVRSTKID)}
                        onChange={() => toggleSelect(item.SVRSTKID)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm text-gray-900 flex justify-start items-center">
                        <img
                          src={url}
                          onError={(e) => (e.currentTarget.src = cocnut)}
                          alt="product img"
                          className="size-12 border border-black me-3"
                        />
                        <p className="font-medium text-black">{item.itm_NAM}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.TYPE === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.TYPE}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.SalePrice}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.FinalStock}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockOut;
