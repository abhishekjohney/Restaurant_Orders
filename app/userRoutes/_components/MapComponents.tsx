// @ts-nocheck
"use client";

import React from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";

const customIcon = L.icon({
  iconUrl: "/images/svg/mapIcon.svg", // Path to your custom icon image
  iconSize: [25, 41], // Size of the icon [width, height]
  iconAnchor: [12, 41], // Anchor point of the icon [x, y]
  popupAnchor: [1, -34], // Where the popup opens relative to the icon
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png", // Optional shadow
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});
const MapComponent = () => {
  // Map center coordinates
  const center = [11.265012, 75.767958]; // Example: San Francisco

  const routeCoordinates = [
    { lng: 75.780117, lat: 11.265279, time: "9:00 AM" },
    { lng: 75.768079, lat: 11.281326, time: "9:15 AM" },
    { lng: 75.768186, lat: 11.298357, time: "9:30 AM" },
    { lng: 75.777211, lat: 11.296403, time: "9:45 AM" },
    { lng: 75.777788, lat: 11.289621, time: "10:00 AM" },
    { lng: 75.789042, lat: 11.285532, time: "10:15 AM" },
    { lng: 75.803002, lat: 11.281001, time: "10:30 AM" },
    { lng: 75.805109, lat: 11.273405, time: "10:45 AM" },
    { lng: 75.807076, lat: 11.264999, time: "11:00 AM" },
    { lng: 75.799526, lat: 11.26007, time: "11:15 AM" },
    { lng: 75.791751, lat: 11.267033, time: "11:30 AM" },
    { lng: 75.781384, lat: 11.258523, time: "11:45 AM" },
    { lng: 75.778229, lat: 11.252224, time: "12:00 PM" },
    { lng: 75.792202, lat: 11.252213, time: "12:15 PM" },
    { lng: 75.798001, lat: 11.24831, time: "12:30 PM" },
    { lng: 75.784458, lat: 11.246479, time: "12:45 PM" },
    { lng: 75.77482, lat: 11.241536, time: "1:00 PM" },
    { lng: 75.785923, lat: 11.238457, time: "1:15 PM" },
    { lng: 75.783529, lat: 11.243344, time: "1:30 PM" },
    { lng: 75.794655, lat: 11.244665, time: "1:45 PM" },
    { lng: 75.790299, lat: 11.234031, time: "2:00 PM" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen shadow-md mt-24 sm:mt-20 md:mt-0 flex items-start justify-start">
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} className="w-full min-w-96 min-h-screen h-full">
        {/* Add a TileLayer (map background) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Add Markers for each point */}
        {routeCoordinates.map((point, index) => (
          <Marker key={index} position={[point.lat, point.lng]} icon={customIcon}>
            <Popup>
              <b>Time:</b> {point.time}
            </Popup>
          </Marker>
        ))}

        {/* Add a Polyline to connect the points */}
        <Polyline positions={routeCoordinates.map((point) => [point.lat, point.lng])} pathOptions={{ color: "blue", weight: 4 }} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
