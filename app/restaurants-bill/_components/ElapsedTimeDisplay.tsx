// components/ElapsedTimeDisplay.tsx
import React from "react";
import useElapsedTime from "../hooks/useElapsedTime";

const ElapsedTimeDisplay: React.FC<{ entryTimeStr: string }> = ({ entryTimeStr }) => {
  const elapsedTime = useElapsedTime(entryTimeStr);
  return <span className="ml-2 text-green-700 font-semibold">({elapsedTime})</span>;
};

export default ElapsedTimeDisplay;
