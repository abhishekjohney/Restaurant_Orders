import { ChevronDown, ChevronUp } from "lucide-react";
import React, { Dispatch, SetStateAction, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { TableStatusType } from "../types";
import ElapsedTimeDisplay from "./ElapsedTimeDisplay";

interface Props {
  data: TableStatusType[];
  onSelect: (selectedNames: string) => void;
  close: Dispatch<SetStateAction<boolean>>;
  formData: { orderId: string };
  createNewOrder: () => void;
  handleCartSubmit: () => void;
  setFormData: React.Dispatch<React.SetStateAction<{ orderId: string }>>;
  currentSeatNos?: string;
}

// Custom hook for localStorage counter
const useSelectedCounter = () => {
  const [selectedCounter, setSelectedCounter] = useState<string>("");

  useEffect(() => {
    const loc = localStorage.getItem("UserYear");
    if (loc) {
      const parts = loc.split("_");
      setSelectedCounter(parts[4] || "");
    }
  }, []);

  return selectedCounter;
};

// Custom hook for seat management
const useSeatManagement = (isAddSeatsMode: boolean, formData: { orderId: string }, currentSeatNos?: string) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [currentSeats, setCurrentSeats] = useState<string[]>([]);
  const prevOrderIdRef = useRef<string | null>(null);

  // Handle seat initialization for add seats mode
  useEffect(() => {
    const orderId = formData.orderId;

    if (isAddSeatsMode && orderId && currentSeatNos && prevOrderIdRef.current !== orderId) {
      const current = currentSeatNos
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      setSelected(current);
      setCurrentSeats(current);
      prevOrderIdRef.current = orderId;
    }
  }, [isAddSeatsMode, formData.orderId, currentSeatNos]);

  // Reset seat state when switching modes
  useEffect(() => {
    if (!isAddSeatsMode) {
      setSelected([]);
      setCurrentSeats([]);
      prevOrderIdRef.current = null;
    }
  }, [isAddSeatsMode]);

  return { selected, setSelected, currentSeats };
};

// Utility functions
const parseSeats = (seatNos: string): string[] =>
  seatNos
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const groupOccupiedSeats = (data: TableStatusType[], excludeOrderId?: number): Record<number, string[]> => {
  return data
    .filter((item) => item.SeatType === "Order" && (!excludeOrderId || item.OrderID !== excludeOrderId))
    .reduce((acc: Record<number, string[]>, item) => {
      const seats = parseSeats(item.SeatNos);
      if (!acc[item.OrderID]) acc[item.OrderID] = [];
      acc[item.OrderID].push(...seats);
      return acc;
    }, {});
};

const TableSeatSelector: React.FC<Props> = ({
  data,
  onSelect,
  close,
  setFormData,
  formData,
  createNewOrder,
  currentSeatNos,
  handleCartSubmit,
}) => {
  const selectedCounter = useSelectedCounter();
  const [isOccupiedOpen, setIsOccupiedOpen] = useState(false);
  const [isAddSeatsMode, setIsAddSeatsMode] = useState(false);
  const [showUserOnly, setShowUserOnly] = useState(true);

  const { selected, setSelected, currentSeats } = useSeatManagement(isAddSeatsMode, formData, currentSeatNos);

  // Memoized filtered data
  const filteredData = useMemo(() => {
    // Step 1: Filter by counter
    const counterData = selectedCounter === "ALL" ? data : data.filter((item) => item.CounterNo === selectedCounter);

    // Step 2: Apply user filter for occupied seats display
    const filteredForDisplay = showUserOnly ? counterData.filter((item) => item.isUserMatched || item.SeatType === "Table") : counterData;

    return {
      counterData,
      filteredForDisplay,
      tables: data.filter((item) => item.SeatType === "Table" && (selectedCounter === "ALL" || item.CounterNo === selectedCounter)),
    };
  }, [data, selectedCounter, showUserOnly]);

  // Memoized occupied groups
  const occupiedGroups = useMemo(() => {
    const excludeOrderId = isAddSeatsMode ? parseInt(formData.orderId) : undefined;
    return {
      forDisplay: groupOccupiedSeats(filteredData.filteredForDisplay, excludeOrderId),
      forTables: groupOccupiedSeats(filteredData.counterData, excludeOrderId),
    };
  }, [filteredData.filteredForDisplay, filteredData.counterData, isAddSeatsMode, formData.orderId]);

  // Memoized occupied seats list
  const occupiedSeats = useMemo(() => Object.values(occupiedGroups.forTables).flat(), [occupiedGroups.forTables]);

  // Memoized handlers
  const toggleSeat = useCallback(
    (label: string, disabled: boolean) => {
      if (disabled) return;

      setSelected((prev) => {
        const updated = prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label];
        onSelect(updated.join(","));
        return updated;
      });
    },
    [onSelect]
  );

  const toggleAllForTable = useCallback(
    (table: TableStatusType, selectAll: boolean) => {
      const seatLabels = parseSeats(table.SeatNos);

      setSelected((prev) => {
        let updated: string[];

        if (selectAll) {
          const selectable = seatLabels.filter((seat) => !occupiedSeats.includes(seat));
          updated = Array.from(new Set([...prev, ...selectable]));
        } else {
          updated = prev.filter((label) => !seatLabels.includes(label));
        }

        onSelect(updated.join(","));
        return updated;
      });
    },
    [occupiedSeats, onSelect]
  );

  const handleCreateOrAddSeats = useCallback(() => {
    if (isAddSeatsMode && formData.orderId) {
      close(false);
      handleCartSubmit();
    } else {
      close(false);
      createNewOrder();
    }
  }, [isAddSeatsMode, formData.orderId, close, handleCartSubmit, createNewOrder]);

  const handleOrderSelect = useCallback(
    (orderId: string) => {
      setFormData({ orderId });
    },
    [setFormData]
  );

  const handleClose = useCallback(() => {
    close(false);
    onSelect("");
  }, [close, onSelect]);

  const toggleOccupiedOpen = useCallback(() => {
    setIsOccupiedOpen((prev) => !prev);
  }, []);

  const toggleShowUserOnly = useCallback((checked: boolean) => {
    setShowUserOnly(checked);
  }, []);

  const toggleAddSeatsMode = useCallback((checked: boolean) => {
    setIsAddSeatsMode(checked);
  }, []);

  // Computed values
  const canAddSeats = isAddSeatsMode && formData.orderId;
  const hasSelectedOrder = formData.orderId !== "";

  return (
    <div className="space-y-4 p-4">
      {/* Occupied Seats Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Currently Occupied Seats</h2>
          <div className="flex items-center gap-3">
            {/* User Filter Toggle */}
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showUserOnly}
                onChange={(e) => toggleShowUserOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span>Show User Only</span>
            </label>

            {/* Accordion toggle */}
            <button
              type="button"
              onClick={toggleOccupiedOpen}
              className="text-blue-600 hover:underline flex items-center gap-1"
              aria-label={isOccupiedOpen ? "Hide occupied seats" : "Show occupied seats"}
            >
              {isOccupiedOpen ? <ChevronUp size={25} /> : <ChevronDown size={25} />}
            </button>
          </div>
        </div>

        {/* Filter status indicator */}
        {showUserOnly && (
          <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Filter Active:</strong> Showing only orders that belong to you
            </p>
          </div>
        )}

        {isOccupiedOpen && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(occupiedGroups.forDisplay).length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                {showUserOnly ? "No orders found for your account" : "No occupied seats found"}
              </div>
            ) : (
              Object.entries(occupiedGroups.forDisplay).map(([orderId, seats]) => {
                const isSelected = formData.orderId === orderId;
                const tableEntry = filteredData.filteredForDisplay.find((d) => d.OrderID.toString() === orderId);

                if (!tableEntry) return null;

                const {
                  EntryDateTimeStr: entryDateStr = "",
                  OrderNo: orderNo = "",
                  Amount: netAmount = "",
                  isUserMatched = false,
                } = tableEntry;

                return (
                  <button
                    type="button"
                    onClick={() => handleOrderSelect(orderId)}
                    onDoubleClick={() => close(false)}
                    key={orderId}
                    className={`border rounded-xl shadow p-4 transition-all relative
                      ${isSelected ? "bg-yellow-300 border-yellow-500" : "bg-yellow-50 border-yellow-300"}
                      ${!isUserMatched ? "opacity-75" : ""}
                    `}
                  >
                    {/* User ownership indicator */}
                    {!isUserMatched && !showUserOnly && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">Other User</span>
                      </div>
                    )}

                    <h3 className="text-lg font-semibold text-yellow-800 mb-1">Order No: {orderNo}</h3>
                    <h3 className="text-sm font-montserrat font-medium text-yellow-800 mb-1">Amount: {netAmount}</h3>
                    <p className="text-sm text-gray-600">
                      <ElapsedTimeDisplay entryTimeStr={entryDateStr} />
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {seats.map((seat, index) => (
                        <span key={index} className="bg-gray-400 text-white px-2 py-1 rounded text-sm">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Available Seats Section with Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Available Seats</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">{isAddSeatsMode ? "Add to existing order" : "Create new order"}</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isAddSeatsMode}
              onChange={(e) => toggleAddSeatsMode(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Status Messages */}
      {isAddSeatsMode && !hasSelectedOrder && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">
            <strong>Note:</strong> Please select an existing order from the occupied seats above to add seats to it.
          </p>
        </div>
      )}

      {isAddSeatsMode && hasSelectedOrder && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">
            <strong>Adding seats to Order ID:</strong> {formData.orderId}
          </p>
          {currentSeatNos && (
            <p className="text-sm mt-1">
              <strong>Current seats:</strong> {currentSeatNos}
            </p>
          )}
        </div>
      )}

      {/* Available Tables Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredData.tables.map((table) => {
          const seatLabels = parseSeats(table.SeatNos);
          const allSelectable = seatLabels.filter((seat) => !occupiedSeats.includes(seat));
          const allSelected = allSelectable.length > 0 && allSelectable.every((seat) => selected.includes(seat));

          return (
            <div key={table.TBLAutoID} className="bg-white border rounded-xl shadow p-4">
              <div className="flex items-center justify-start gap-2 mb-2">
                <h2 className="text-xl font-semibold">Table {table.TableName}</h2>
                <label className="flex items-center gap-1 text-sm">
                  <input type="checkbox" checked={allSelected} onChange={(e) => toggleAllForTable(table, e.target.checked)} />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {seatLabels.map((label) => {
                  const isDisabled = occupiedSeats.includes(label) && !selected.includes(label);
                  const isChecked = selected.includes(label);
                  const isCurrent = currentSeats?.includes(label);

                  return (
                    <label
                      key={label}
                      className={`flex items-center gap-1 px-2 py-1 rounded border text-sm font-medium font-montserrat ${
                        isDisabled ? "bg-red-300 text-black cursor-not-allowed border-none" : "cursor-pointer"
                      } ${isChecked ? "bg-blue-500 text-white" : "bg-blue-100 border-2 border-black"} ${
                        isCurrent ? "border-green-500" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={isDisabled}
                        checked={isChecked}
                        onChange={() => toggleSeat(label, isDisabled)}
                        className="hidden"
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end flex-row gap-2 mt-4">
        <button
          className={`px-4 py-2 text-white rounded-lg transition-colors ${
            isAddSeatsMode && !hasSelectedOrder ? "bg-gray-400 cursor-not-allowed" : "bg-gray-800 hover:bg-black"
          }`}
          onClick={handleCreateOrAddSeats}
          disabled={isAddSeatsMode && !hasSelectedOrder}
        >
          {canAddSeats ? "Add Seats" : "Create"}
        </button>

        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" onClick={handleClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default TableSeatSelector;
