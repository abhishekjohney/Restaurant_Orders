"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./_components/MapComponent"), { ssr: false });

export default function Home() {
  const [locations, setLocations] = useState<any[]>([
    { lng: 75.780117, lat: 11.265279, taskDone: false },
    { lng: 75.768079, lat: 11.281326, taskDone: true },
    { lng: 75.768186, lat: 11.298357, taskDone: true },
    { lng: 75.777211, lat: 11.296403, taskDone: false },
    { lng: 75.777788, lat: 11.289621, taskDone: true },
    { lng: 75.789042, lat: 11.285532, taskDone: false },
    { lng: 75.803002, lat: 11.281001, taskDone: true },
    { lng: 75.805109, lat: 11.273405, taskDone: false },
    { lng: 75.807076, lat: 11.264999, taskDone: true },
    { lng: 75.799526, lat: 11.26007, taskDone: true },
    { lng: 75.791751, lat: 11.267033, taskDone: true },
    { lng: 75.781384, lat: 11.258523, taskDone: false },
    { lng: 75.778229, lat: 11.252224, taskDone: true },
    { lng: 75.792202, lat: 11.252213, taskDone: false },
    { lng: 75.798001, lat: 11.24831, taskDone: true },
    { lng: 75.784458, lat: 11.246479, taskDone: true },
    { lng: 75.77482, lat: 11.241536, taskDone: false },
    { lng: 75.785923, lat: 11.238457, taskDone: true },
    { lng: 75.783529, lat: 11.243344, taskDone: true },
    { lng: 75.794655, lat: 11.244665, taskDone: true },
    { lng: 75.790299, lat: 11.234031, taskDone: false },
  ]);

  useEffect(() => {
    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLocations((prev: any) => [...prev, { lat: latitude, lng: longitude, taskDone: false }]);
      });
    };

    // Fetch location immediately and every 15 minutes
    updateLocation();
    const intervalId = setInterval(updateLocation, 15 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <h1>User Tracking Map</h1>
      <Map locations={locations} />
    </div>
  );
}
