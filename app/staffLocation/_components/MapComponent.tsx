"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, LoadScriptNext, DirectionsRenderer, Marker, InfoWindow } from "@react-google-maps/api";
import { StaffLocationInterfaceOnMap } from "@/types";
import { Play, Pause, RotateCcw, FastForward, Rewind } from "lucide-react";
import { toast } from "react-toastify";

const MapComponent = ({ locations }: { locations: StaffLocationInterfaceOnMap[] }) => {
  const [routeData, setRouteData] = useState<google.maps.DirectionsResult | null>(null);
  const [routeCounts, setRouteCounts] = useState<Record<string, number>>({});
  const [selectedMarker, setSelectedMarker] = useState<StaffLocationInterfaceOnMap | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [progress, setProgress] = useState(0);

  // Enhanced refs for smooth animation
  const animationRef = useRef<number | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const pathRef = useRef<google.maps.LatLng[]>([]);
  const currentIndexRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const lastFrameTimeRef = useRef(Date.now());

  const easeInOut = (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

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
            pathRef.current = result.routes[0].overview_path;
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
      currentIndexRef.current = 0;
      startTimeRef.current = Date.now();
      setProgress(0);
    } else {
      // ❌ No locations: cancel animation and reset stuff
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setRouteData(null);
      setCurrentPosition(null);
      setIsPlaying(false);
      pathRef.current = [];
      lastFrameTimeRef.current = Date.now();
      startTimeRef.current = Date.now();
      setRouteCounts({});
      setProgress(0);
      currentIndexRef.current = 0;
      toast.error("No locations available to display on the map.");
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [locations, calculateRoute]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const animateMarkerAlongRoute = useCallback(() => {
    if (!pathRef.current.length || !isPlaying) return;

    const moveMarker = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastFrameTimeRef.current;
      lastFrameTimeRef.current = currentTime;

      if (currentIndexRef.current < pathRef.current.length - 1) {
        const currentPath = pathRef.current[currentIndexRef.current];
        const nextPath = pathRef.current[currentIndexRef.current + 1];

        // Calculate time-based progress
        const duration = 1000 / animationSpeed; // Duration for each segment
        const elapsedTime = currentTime - startTimeRef.current;
        const rawProgress = Math.min(elapsedTime / duration, 1);
        const easedProgress = easeInOut(rawProgress);

        // Interpolate position
        const lat = currentPath.lat() + (nextPath.lat() - currentPath.lat()) * easedProgress;
        const lng = currentPath.lng() + (nextPath.lng() - currentPath.lng()) * easedProgress;

        const newPosition = { lat, lng };
        setCurrentPosition(newPosition);

        if (mapRef.current) {
          mapRef.current.panTo(newPosition);
        }

        const totalProgress = ((currentIndexRef.current + easedProgress) / (pathRef.current.length - 1)) * 100;
        setProgress(totalProgress);

        if (rawProgress >= 1) {
          currentIndexRef.current++;
          startTimeRef.current = currentTime;
        }

        animationRef.current = requestAnimationFrame(moveMarker);
      } else {
        stopAnimation();
      }
    };

    moveMarker();
  }, [isPlaying, animationSpeed, stopAnimation]);

  useEffect(() => {
    if (isPlaying) {
      lastFrameTimeRef.current = Date.now();
      startTimeRef.current = Date.now();
      animateMarkerAlongRoute();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animateMarkerAlongRoute]);

  const handleRestart = useCallback(() => {
    stopAnimation();
    currentIndexRef.current = 0;
    startTimeRef.current = Date.now();
    lastFrameTimeRef.current = Date.now();
    setProgress(0);
    setCurrentPosition({ lat: locations[0].lat, lng: locations[0].long });
  }, [locations, stopAnimation]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setAnimationSpeed(newSpeed);
    // Reset timing refs when speed changes
    startTimeRef.current = Date.now();
    lastFrameTimeRef.current = Date.now();
  }, []);

  const handleProgressChange = useCallback((newProgress: number) => {
    if (!pathRef.current.length) return;

    const newIndex = Math.floor((newProgress / 100) * (pathRef.current.length - 1));
    currentIndexRef.current = newIndex;
    startTimeRef.current = Date.now();
    lastFrameTimeRef.current = Date.now();

    const currentPath = pathRef.current[newIndex];
    setCurrentPosition({
      lat: currentPath.lat(),
      lng: currentPath.lng(),
    });

    setProgress(newProgress);
  }, []);

  const getRouteColor = useCallback(
    (startLat: number, startLng: number, endLat: number, endLng: number) => {
      const key = `${startLat},${startLng} → ${endLat},${endLng}`;
      const count = routeCounts[key] || 1;
      if (count === 1) return "#0000FF";
      if (count >= 2) return "#FF0000";
      return "#800000";
    },
    [routeCounts]
  );

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
            gestureHandling: "cooperative",
            panControlOptions: {
              position: window?.google?.maps?.ControlPosition?.TOP_RIGHT,
            },
          }}
          onLoad={(map) => {
            mapRef.current = map;
          }}
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
                  return null;
                default:
                  return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
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
        <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
