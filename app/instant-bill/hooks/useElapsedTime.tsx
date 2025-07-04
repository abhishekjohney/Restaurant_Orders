import { useEffect, useState } from "react";

function useElapsedTime(entryTimeStr: string | null) {
  const [elapsed, setElapsed] = useState("00:00:00");

  useEffect(() => {
    if (!entryTimeStr) return;

    const [, timeStr] = entryTimeStr.split(" ");
    if (!timeStr) return;

    const [hh, mm, ss] = timeStr.split(":").map(Number);

    const interval = setInterval(() => {
      const now = new Date();
      const entryTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, ss);

      let diff = Math.floor((now.getTime() - entryTime.getTime()) / 1000);
      if (diff < 0) diff += 86400; // handle past-midnight cases

      const h = String(Math.floor(diff / 3600)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const s = String(diff % 60).padStart(2, "0");

      setElapsed(`${h}:${m}:${s}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [entryTimeStr]);

  return elapsed;
}
export default useElapsedTime;
