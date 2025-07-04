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
  setFormData: React.Dispatch<React.SetStateAction<{ orderId: string }>>;
}

const TableSeatSelector: React.FC<Props> = ({ data, onSelect, close, setFormData, formData, createNewOrder }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [isOccupiedOpen, setIsOccupiedOpen] = useState(false);

  // Group occupied seats by OrderID
  const occupiedGroups = data
    .filter((item) => item.SeatType === "Order")
    .reduce((acc: Record<number, string[]>, item) => {
      const seats = item.SeatNos.split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!acc[item.OrderID]) acc[item.OrderID] = [];
      acc[item.OrderID].push(...seats);
      return acc;
    }, {});

  // Flat list of all occupied seats
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

  return (
    <div className="space-y-4 p-4">
      {/* <h2 className="text-2xl font-bold mb-2">Currently Occupied Seats</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(occupiedGroups).map(([orderId, seats]) => {
          const isSelected = formData.orderId === orderId; // ✅ Check if selected

          const entryDateStr = data.find((d) => d.OrderID.toString() === orderId)?.EntryDateTimeStr || "";

          return (
            <button
              type="button"
              onClick={() => setFormData({ orderId })}
              onDoubleClick={() => {
                close(false);
              }}
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
      </div> */}

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

      {/* Available tables */}
      <h2 className="text-2xl font-bold mb-2">Available Seats</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-4">
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
                  const isDisabled = occupiedSeats.includes(label);
                  const isChecked = selected.includes(label);

                  return (
                    <label
                      key={label}
                      className={`flex items-center gap-1 px-2 py-1 rounded border text-sm 
                        ${isDisabled ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-blue-100 cursor-pointer"}
                        ${isChecked ? "bg-blue-500 text-white" : ""}
                      `}
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

      <div className="flex justify-end flex-row gap-2 mt-4">
        <button
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black"
          onClick={() => {
            close(false);
            createNewOrder();
          }}
        >
          Create
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
