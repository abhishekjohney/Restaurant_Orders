import React, { Dispatch, SetStateAction, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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
  currentSeatNos?: string; // Current seats for the selected order
}

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
  const prevOrderIdRef = React.useRef<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [isOccupiedOpen, setIsOccupiedOpen] = useState(false);
  const [isAddSeatsMode, setIsAddSeatsMode] = useState(false);
  const [currentSeats, setCurrentSeats] = useState<string[]>([]);

  // 👉 1. Handle seat setup when switching orders in "Add Seats" mode
  React.useEffect(() => {
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

  // 👉 2. Reset seat state when switching from "Add Seats" to "Create New Order"
  React.useEffect(() => {
    if (!isAddSeatsMode) {
      setSelected([]);
      setCurrentSeats([]);
      prevOrderIdRef.current = null;
    }
  }, [isAddSeatsMode]);

  // Group occupied seats by OrderID
  const occupiedGroups = data
    .filter(
      (item) => item.SeatType === "Order" && (!isAddSeatsMode || item.OrderID !== parseInt(formData.orderId)) // 👈 exclude current order in Add Seat mode
    )
    .reduce((acc: Record<number, string[]>, item) => {
      const seats = item.SeatNos.split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!acc[item.OrderID]) acc[item.OrderID] = [];
      acc[item.OrderID].push(...seats);
      return acc;
    }, {});

  const occupiedSeats = Object.values(occupiedGroups).flat();

  // Filter available tables only
  const tables = data.filter((item) => item.SeatType === "Table");

  const toggleSeat = (label: string, disabled: boolean) => {
    if (disabled) return;
    const updated = selected.includes(label) ? selected.filter((item) => item !== label) : [...selected, label];
    setSelected(updated);
    onSelect(updated.join(","));
  };

  const toggleAllForTable = (table: TableStatusType, selectAll: boolean) => {
    const seatLabels = table.SeatNos.split(",")
      .map((seat) => seat.trim())
      .filter(Boolean);
    let updated: string[];

    if (selectAll) {
      const selectable = seatLabels.filter((seat) => !occupiedSeats.includes(seat));
      updated = Array.from(new Set([...selected, ...selectable]));
    } else {
      updated = selected.filter((label) => !seatLabels.includes(label));
    }

    setSelected(updated);
    onSelect(updated.join(","));
  };

  const handleCreateOrAddSeats = () => {
    if (isAddSeatsMode && formData.orderId) {
      // Add seats to existing order
      close(false);
      handleCartSubmit();
      // The selected seats will be handled by the parent component through onSelect
    } else {
      // Create new order
      close(false);
      createNewOrder();
    }
  };

  // Check if we can add seats (need both toggle on and an order selected)
  const canAddSeats = isAddSeatsMode && formData.orderId;
  const hasSelectedOrder = formData.orderId !== "";

  return (
    <div className="space-y-4 p-4">
      {/* Occupied Seats Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Currently Occupied Seats</h2>
          <button
            type="button"
            onClick={() => setIsOccupiedOpen((prev) => !prev)}
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            {isOccupiedOpen ? (
              <>
                <ChevronUp className="size-6" size={25} />
              </>
            ) : (
              <>
                <ChevronDown className="size-6" size={25} />
              </>
            )}
          </button>
        </div>

        {isOccupiedOpen && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(occupiedGroups).map(([orderId, seats]) => {
              const isSelected = formData.orderId === orderId;
              const entryDateStr = data.find((d) => d.OrderID.toString() === orderId)?.EntryDateTimeStr || "";

              return (
                <button
                  type="button"
                  onClick={() => setFormData({ orderId })}
                  onDoubleClick={() => close(false)}
                  key={orderId}
                  className={`border rounded-xl shadow p-4 transition-all
              ${isSelected ? "bg-yellow-300 border-yellow-500" : "bg-yellow-50 border-yellow-300"}
            `}
                >
                  <h3 className="text-lg font-semibold text-yellow-800 mb-1">Order ID: {orderId}</h3>
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
            })}
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
              onChange={(e) => setIsAddSeatsMode(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Show warning if add seats mode is on but no order selected */}
      {isAddSeatsMode && !hasSelectedOrder && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">
            <strong>Note:</strong> Please select an existing order from the occupied seats above to add seats to it.
          </p>
        </div>
      )}

      {/* Show selected order info when in add seats mode */}
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
        {tables.map((table) => {
          const seatLabels = table.SeatNos.split(",")
            .map((seat) => seat.trim())
            .filter(Boolean);
          const allSelectable = seatLabels.filter((seat) => !occupiedSeats.includes(seat));
          const allSelected = allSelectable.every((seat) => selected.includes(seat));

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
                  const isDisabled = occupiedSeats.includes(label) && !selected.includes(label); // disable only if not in current selection
                  const isChecked = selected.includes(label);
                  const isCurrent = currentSeats?.includes(label); // new

                  return (
                    <label
                      key={label}
                      className={`flex items-center gap-1 px-2 py-1 rounded border text-sm font-medium font-montserrat ${
                        isDisabled ? "bg-red-300 text-black cursor-not-allowed border-none" : "cursor-pointer"
                      } ${isChecked ? "bg-blue-500 text-white" : "bg-blue-100 border-2 border-black"} ${isCurrent ? "border-green-500" : ""}`}
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
        <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black" onClick={() => close(false)}>
          OK
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          onClick={() => {
            close(false);
            onSelect("");
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TableSeatSelector;
