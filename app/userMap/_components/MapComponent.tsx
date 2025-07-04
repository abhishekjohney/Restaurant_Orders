"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, LoadScriptNext, DirectionsRenderer, Marker, InfoWindow } from "@react-google-maps/api";
import { StaffLocationInterfaceOnMap } from "@/types";
import { Play, Pause, RotateCcw, FastForward, Rewind } from "lucide-react";

const MapComponent = ({ locations }: { locations: StaffLocationInterfaceOnMap[] }) => {
  const [routeData, setRouteData] = useState<google.maps.DirectionsResult | null>(null);
  const [routeCounts, setRouteCounts] = useState<Record<string, number>>({});
  const [selectedMarker, setSelectedMarker] = useState<StaffLocationInterfaceOnMap | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const calculateRoute = useCallback(() => {
    if (locations.length < 2 || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();

    const waypoints = locations.slice(1, -1).map((loc) => ({
      location: { lat: loc.lat, lng: loc.long },
      stopover: true,
    }));

    directionsService.route(
      {
        origin: { lat: locations[0].lat, lng: locations[0].long },
        destination: { lat: locations[locations.length - 1].lat, lng: locations[locations.length - 1].long },
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setRouteData(result);
          if (result) {
            countRouteRepetitions(result);
          }
        } else {
          console.error(`Error fetching directions: ${status}`);
        }
      }
    );
  }, [locations]);

  const countRouteRepetitions = (result: google.maps.DirectionsResult) => {
    const newRouteCounts: Record<string, number> = {};
    result.routes[0].legs.forEach((leg) => {
      const key = `${leg.start_location.lat()},${leg.start_location.lng()} → ${leg.end_location.lat()},${leg.end_location.lng()}`;
      newRouteCounts[key] = (newRouteCounts[key] || 0) + 1;
    });
    setRouteCounts(newRouteCounts);
  };

  useEffect(() => {
    if (locations.length > 0) {
      calculateRoute();
      setCurrentPosition({ lat: locations[0].lat, lng: locations[0].long });
    }
    console.log(2);
  }, [locations, calculateRoute]);

  const getRouteColor = (startLat: number, startLng: number, endLat: number, endLng: number) => {
    const key = `${startLat},${startLng} → ${endLat},${endLng}`;
    const count = routeCounts[key] || 1;
    if (count === 1) return "#0000FF";
    if (count >= 2) return "#FF0000";
    return "#800000";
  };

  const animateMarkerAlongRoute = useCallback(() => {
    if (!routeData || !isPlaying) return;
  
    const path = routeData.routes[0].overview_path;
    
    // Use ref to track current index to avoid closure issues
    const indexRef = useRef(currentIndex);
    
    const moveMarker = () => {
      if (indexRef.current < path.length) {
        const newPosition = { 
          lat: path[indexRef.current].lat(), 
          lng: path[indexRef.current].lng() 
        };
        setCurrentPosition(newPosition);
        
        if (mapRef.current) {
          mapRef.current.panTo(newPosition);
        }
  
        setProgress((indexRef.current / (path.length - 1)) * 100);
        indexRef.current++;
        setCurrentIndex(indexRef.current);
  
        const speedFactor = 100 / animationSpeed;
        animationRef.current = setTimeout(moveMarker, speedFactor);
      } else {
        setIsPlaying(false);
      }
    };
  
    moveMarker();
  }, [routeData, isPlaying, animationSpeed, currentIndex]);

  useEffect(() => {
    console.log(77);
    if (isPlaying) {
      animateMarkerAlongRoute();
    }
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, animateMarkerAlongRoute]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setProgress(0);
    setCurrentPosition({ lat: locations[0].lat, lng: locations[0].long });
    setIsPlaying(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setAnimationSpeed(newSpeed);
  };

  const handleProgressChange = (newProgress: number) => {
    const newIndex = Math.floor((newProgress / 100) * (locations.length - 1));
    setCurrentIndex(newIndex);
    setProgress(newProgress);
    setCurrentPosition({ lat: locations[newIndex].lat, lng: locations[newIndex].long });
  };

  return (
    <div className="max-h-[88vh] md:max-h-[500px] max-w-screen-2xl md:max-w-screen-lg w-full h-full flex flex-col items-center">
      <LoadScriptNext googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY_FOR_MAP!}>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "500px" }}
          center={{ lat: locations[0]?.lat || 9.7488058, lng: locations[0]?.long || 77.1151811 }}
          zoom={16}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
          }}
          onLoad={(map) => {
            mapRef.current = map;
          }} // Capture map reference
        >
          {routeData &&
            routeData.routes[0].legs.map((leg, index) => (
              <DirectionsRenderer
                key={index}
                directions={{
                  ...routeData,
                  routes: [{ ...routeData.routes[0], legs: [leg] }],
                }}
                options={{
                  polylineOptions: {
                    strokeColor: getRouteColor(
                      leg.start_location.lat(),
                      leg.start_location.lng(),
                      leg.end_location.lat(),
                      leg.end_location.lng()
                    ),
                    strokeWeight:
                      getRouteColor(leg.start_location.lat(), leg.start_location.lng(), leg.end_location.lat(), leg.end_location.lng()) ===
                      "#FF0000"
                        ? 7
                        : 2,
                  },
                  suppressMarkers: true,
                }}
              />
            ))}

          {locations.map((loc, index) => {
            const getMarkerIcon = () => {
              switch (loc.Module) {
                case "ORDER":
                  return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
                case "LOGIN":
                case "LOGOUT":
                  return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
                case "PAYMENT":
                  return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
                case "TIMER UPDATES":
                  return null; // Custom red dot for TIMER UPDATES
                default:
                  return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"; // Default for tracking
              }
            };
            return (
              <Marker
                key={index}
                position={{ lat: loc.lat, lng: loc.long }}
                onClick={() => setSelectedMarker(loc)}
                icon={
                  loc.Module === "TIMER UPDATES"
                    ? {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 5,
                        fillColor: "#FF0000",
                        fillOpacity: 1,
                        strokeWeight: 0,
                      }
                    : getMarkerIcon() !== null
                    ? { url: getMarkerIcon() as string }
                    : undefined
                }
              />
            );
          })}

          {currentPosition && (
            <Marker
              position={currentPosition}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new google.maps.Size(40, 40),
              }}
            />
          )}

          {selectedMarker && (
            <InfoWindow position={{ lat: selectedMarker.lat, lng: selectedMarker.long }} onCloseClick={() => setSelectedMarker(null)}>
              <div className="font-semibold mx-2">
                <p>
                  <strong>Module:</strong> {selectedMarker.Module}
                </p>
                <p>
                  <strong>Place:</strong> {selectedMarker.LocPlace}
                </p>
                <p>
                  <strong>Time:</strong> {formatTimestamp(selectedMarker.CDate)}
                </p>
                <p>
                  <strong>Location:</strong> {selectedMarker.LocationString}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScriptNext>

      <div className="w-full max-w-3xl mt-4 px-4">
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-center gap-4">
            <button onClick={() => setIsPlaying(!isPlaying)} className="flex items-center gap-2">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button onClick={handleRestart} className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Restart
            </button>
            <button onClick={() => handleSpeedChange(Math.min(animationSpeed + 0.5, 3))} className="flex items-center gap-2">
              <FastForward className="w-4 h-4" />
              Speed Up
            </button>
            <button onClick={() => handleSpeedChange(Math.max(animationSpeed - 0.5, 0.5))} className="flex items-center gap-2">
              <Rewind className="w-4 h-4" />
              Slow Down
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Speed: {animationSpeed}x</span>
            {/* <Slider
              value={[animationSpeed]}
              min={0.5}
              max={3}
              step={0.5}
              onValueChange={(value) => handleSpeedChange(value[0])}
              className="w-48"
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
