import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, Circle, useMap } from "react-leaflet";
import L from "leaflet";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const motorBikeIcon = L.divIcon({
  html: "<span style='display:flex;align-items:center;justify-content:center;width:34px;height:34px;border:2px solid white;border-radius:50%;background:#047857;box-shadow:0 1px 5px #0008;font-size:20px'>🏍️</span>",
  className: "motorbike-marker",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const currentLocationIcon = L.divIcon({
  html: "<span style='display:block;width:16px;height:16px;border:3px solid white;border-radius:50%;background:#2563eb;box-shadow:0 1px 6px #0008'></span>",
  className: "current-location-marker",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

interface LiveMapProps {
  pickup: [number, number];
  drop: [number, number];
  pickupName: string;
  dropName: string;
  distanceKm?: number;
  routeStarted: boolean;
  routeFinished: boolean;
  onLocationFound?: (position: [number, number]) => void;
}

interface OsrmRouteResponse {
  code: string;
  routes: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
    };
  }>;
}

interface NearbyPlace {
  id: string;
  name: string;
  address: string;
  position: [number, number];
  distanceKm: number;
}

interface NominatimPlace {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
}

const distanceBetweenKm = (first: [number, number], second: [number, number]) => {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(second[0] - first[0]);
  const longitudeDelta = radians(second[1] - first[1]);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(first[0])) * Math.cos(radians(second[0]))
    * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

const RouteViewport: React.FC<{ positions: [number, number][] }> = ({ positions }) => {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(L.latLngBounds(positions), { padding: [36, 36] });
    }
  }, [map, positions]);

  return null;
};

const RecenterMap: React.FC<{ position: [number, number] | null }> = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) map.setView(position, Math.max(map.getZoom(), 14), { animate: true });
  }, [map, position]);

  return null;
};

const getPositionAlongRoute = (
  route: [number, number][],
  segmentDistances: number[],
  totalDistance: number,
  progress: number
): [number, number] => {
  if (route.length < 2 || totalDistance === 0) return route[0] ?? [0, 0];

  const targetDistance = totalDistance * progress;
  let traversedDistance = 0;

  for (let index = 0; index < segmentDistances.length; index += 1) {
    const segmentDistance = segmentDistances[index];
    if (traversedDistance + segmentDistance >= targetDistance) {
      const segmentProgress = segmentDistance === 0
        ? 0
        : (targetDistance - traversedDistance) / segmentDistance;
      const [startLat, startLon] = route[index];
      const [endLat, endLon] = route[index + 1];
      return [
        startLat + (endLat - startLat) * segmentProgress,
        startLon + (endLon - startLon) * segmentProgress,
      ];
    }
    traversedDistance += segmentDistance;
  }

  return route[route.length - 1];
};

export const LiveMap: React.FC<LiveMapProps> = ({
  pickup,
  drop,
  pickupName,
  dropName,
  distanceKm,
  routeStarted,
  routeFinished,
  onLocationFound,
}) => {
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [bikeProgress, setBikeProgress] = useState(0);
  const [roadDistanceKm, setRoadDistanceKm] = useState<number | null>(null);
  const [routeDurationMinutes, setRouteDurationMinutes] = useState<number | null>(null);
  const [routeError, setRouteError] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ position: [number, number]; accuracy: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "error">("idle");
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [nearbyStatus, setNearbyStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [focusedPlace, setFocusedPlace] = useState<[number, number] | null>(null);
  const routePickup: [number, number] = currentLocation?.position ?? pickup;
  const routePickupName = currentLocation ? "Your location" : pickupName;

  const searchNearbyPlaces = async (position: [number, number]) => {
    setNearbyStatus("loading");
    setNearbyPlaces([]);
    const [latitude, longitude] = position;
    const latitudeOffset = 5 / 111;
    const longitudeOffset = 5 / (111 * Math.max(Math.cos((latitude * Math.PI) / 180), 0.1));
    const viewbox = [longitude - longitudeOffset, latitude + latitudeOffset, longitude + longitudeOffset, latitude - latitudeOffset].join(",");
    const searchTerms = ["orphanage", "NGO", "charity", "shelter"];
    const results = new Map<string, NearbyPlace>();
    let successfulSearches = 0;

    for (const [index, term] of searchTerms.entries()) {
      if (index > 0) await new Promise((resolve) => window.setTimeout(resolve, 1100));
      try {
        const params = new URLSearchParams({
          q: term,
          format: "jsonv2",
          limit: "20",
          viewbox,
          bounded: "1",
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
        if (!response.ok) continue;

        successfulSearches += 1;
        const places = (await response.json()) as NominatimPlace[];
        for (const place of places) {
          const placePosition: [number, number] = [Number(place.lat), Number(place.lon)];
          const distanceKm = distanceBetweenKm(position, placePosition);
          if (distanceKm > 5) continue;

          const id = String(place.place_id);
          results.set(id, {
            id,
            name: place.name || place.display_name.split(",")[0],
            address: place.display_name,
            position: placePosition,
            distanceKm,
          });
        }
      } catch {
        // Keep searching remaining terms if one request fails.
      }
    }

    setNearbyPlaces([...results.values()].sort((first, second) => first.distanceKm - second.distanceKm));
    setNearbyStatus(successfulSearches > 0 ? "ready" : "error");
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCurrentLocation({
          position: [coords.latitude, coords.longitude],
          accuracy: coords.accuracy,
        });
        onLocationFound?.([coords.latitude, coords.longitude]);
        setFocusedPlace(null);
        searchNearbyPlaces([coords.latitude, coords.longitude]);
        setLocationStatus("idle");
      },
      () => setLocationStatus("error"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  };

  useEffect(() => {
    const controller = new AbortController();
    setRoute(null);
    setBikeProgress(0);
    setRoadDistanceKm(null);
    setRouteDurationMinutes(null);
    setRouteError(false);

    const loadRoadRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${routePickup[1]},${routePickup[0]};${drop[1]},${drop[0]}?overview=full&geometries=geojson`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("Road route request failed");

        const data = (await response.json()) as OsrmRouteResponse;
        const bestRoute = data.routes[0];
        if (data.code !== "Ok" || !bestRoute) throw new Error("No road route found");

        setRoute(bestRoute.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]));
        setRoadDistanceKm(bestRoute.distance / 1000);
        setRouteDurationMinutes(Math.ceil(bestRoute.duration / 60));
      } catch (error) {
        if (!controller.signal.aborted) setRouteError(true);
      }
    };

    loadRoadRoute();
    return () => controller.abort();
  }, [routePickup[0], routePickup[1], drop[0], drop[1]]);

  const segmentDistances = useMemo(
    () => route?.slice(1).map((point, index) =>
      L.latLng(route[index]).distanceTo(L.latLng(point))
    ) ?? [],
    [route]
  );
  const totalRouteDistance = useMemo(
    () => segmentDistances.reduce((total, distance) => total + distance, 0),
    [segmentDistances]
  );

  useEffect(() => {
    if (!route || route.length < 2) return;
    if (routeFinished) {
      setBikeProgress(1);
      return;
    }
    if (!routeStarted) {
      setBikeProgress(0);
      return;
    }

    const animationDuration = 30_000;
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const progress = Math.min((Date.now() - startedAt) / animationDuration, 1);
      setBikeProgress(progress);
      if (progress >= 1) window.clearInterval(interval);
    }, 100);

    return () => window.clearInterval(interval);
  }, [route, routeStarted, routeFinished]);

  const bikePosition = useMemo(
    () => route
      ? getPositionAlongRoute(route, segmentDistances, totalRouteDistance, bikeProgress)
      : routePickup,
    [route, segmentDistances, totalRouteDistance, bikeProgress, routePickup]
  );

  const mapPositions = route ?? [routePickup, drop];
  const openStreetMapDirections = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${routePickup[0]}%2C${routePickup[1]}%3B${drop[0]}%2C${drop[1]}`;
  const routeProgressPercent = Math.round(bikeProgress * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <span className="font-medium">{routePickupName} to {dropName}</span>
        {roadDistanceKm !== null ? (
          <span className="font-semibold text-emerald-700">
            {roadDistanceKm.toFixed(1)} km · {routeDurationMinutes} min
          </span>
        ) : (
          <span className="text-slate-500">
            {routeError ? "Road route unavailable" : "Loading road route..."}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={locateMe}
          disabled={locationStatus === "loading"}
          className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-100 disabled:cursor-wait disabled:opacity-60"
        >
          {locationStatus === "loading" ? "Finding your location..." : "Locate Me"}
        </button>
        {locationStatus === "error" && (
          <p role="status" className="text-sm text-rose-700">
            Could not get your location. Allow location access in your browser and try again.
          </p>
        )}
        {currentLocation && (
          <p className="text-xs text-slate-600">
            Location accuracy: about {Math.round(currentLocation.accuracy)} m
          </p>
        )}
      </div>
      {routeStarted && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-600">
            <span>{routeFinished ? "Arrived at drop-off" : "Route progress"}</span>
            <span>{routeProgressPercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-600 transition-[width] duration-100"
              style={{ width: `${routeProgressPercent}%` }}
            />
          </div>
        </div>
      )}
      <div className="h-72 w-full rounded-lg overflow-hidden border border-slate-200 shadow-inner">
        <MapContainer bounds={L.latLngBounds([routePickup, drop])} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <RouteViewport positions={mapPositions} />
          <RecenterMap position={focusedPlace ?? currentLocation?.position ?? null} />
          {route && <Polyline positions={route} pathOptions={{ color: "#059669", weight: 5, opacity: 0.85 }} />}
          <Marker position={routePickup} icon={defaultIcon}>
            <Popup>Pickup: {routePickupName}</Popup>
            <Tooltip permanent direction="top" offset={[0, -34]} opacity={1}>
              Pickup: {routePickupName}
            </Tooltip>
          </Marker>
          <Marker position={drop} icon={defaultIcon}>
            <Popup>Drop: {dropName}</Popup>
            <Tooltip permanent direction="top" offset={[0, -34]} opacity={1}>
              Drop: {dropName}
            </Tooltip>
          </Marker>
          {currentLocation && (
            <>
              <Circle
                center={currentLocation.position}
                radius={currentLocation.accuracy}
                pathOptions={{ color: "#2563eb", fillColor: "#60a5fa", fillOpacity: 0.14, weight: 1 }}
              />
              <Marker position={currentLocation.position} icon={currentLocationIcon}>
                <Popup>Your current location</Popup>
                <Tooltip permanent direction="top" offset={[0, -12]} opacity={1}>
                  Your location
                </Tooltip>
              </Marker>
            </>
          )}
          {nearbyPlaces.map((place) => (
            <Marker key={place.id} position={place.position}>
              <Popup>
                <strong>{place.name}</strong>
                <br />
                {place.distanceKm.toFixed(1)} km from your location
              </Popup>
              <Tooltip>{place.name}</Tooltip>
            </Marker>
          ))}
          {route && (
            <Marker position={bikePosition} icon={motorBikeIcon}>
              <Popup>
                {routeFinished || bikeProgress >= 1
                  ? "Volunteer arrived at drop-off"
                  : routeStarted
                    ? "Volunteer riding to drop-off"
                    : "Volunteer waiting at pickup"}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      {routeError && (
        <p className="text-xs text-amber-700">
          Showing real map locations. Road route could not be loaded; try OpenStreetMap directions.
        </p>
      )}
      <a
        href={openStreetMapDirections}
        target="_blank"
        rel="noreferrer"
        className="inline-block text-sm font-medium text-emerald-700 underline underline-offset-2"
      >
        Open directions in OpenStreetMap
      </a>
      {distanceKm !== undefined && !currentLocation && roadDistanceKm === null && !routeError && (
        <span className="sr-only">Straight-line distance: {distanceKm} km</span>
      )}
      {currentLocation && (
        <section aria-live="polite" className="space-y-2 border-t border-slate-200 pt-3">
          <h3 className="text-sm font-semibold text-slate-800">Nearby NGOs and orphanages (within 5 km)</h3>
          {nearbyStatus === "loading" && <p className="text-sm text-slate-600">Searching OpenStreetMap...</p>}
          {nearbyStatus === "error" && (
            <p className="text-sm text-rose-700">Nearby search is unavailable right now. Try again with Locate Me.</p>
          )}
          {nearbyStatus === "ready" && nearbyPlaces.length === 0 && (
            <p className="text-sm text-slate-600">No nearby NGOs or orphanages were found in OpenStreetMap data.</p>
          )}
          {nearbyPlaces.length > 0 && (
            <ul className="max-h-56 space-y-2 overflow-y-auto">
              {nearbyPlaces.map((place) => (
                <li key={place.id} className="flex items-start justify-between gap-3 rounded border border-slate-200 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{place.name}</p>
                    <p className="truncate text-xs text-slate-500">{place.address}</p>
                    <p className="mt-1 text-xs font-medium text-blue-700">{place.distanceKm.toFixed(1)} km away</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFocusedPlace(place.position)}
                    className="shrink-0 rounded border border-blue-200 px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-50"
                  >
                    Show on map
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-slate-500">Results come from OpenStreetMap and may not include every local organization.</p>
        </section>
      )}
    </div>
  );
};