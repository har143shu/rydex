"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { AnimatePresence, motion } from "motion/react";
import { MapPin, Navigation } from "lucide-react";

type mapProps = {
  pickupLocation: string;
  dropLocation: string;
  onChange: (pickup: string, drop: string) => void;
  changeDist: (d: number) => void;
};

const pickUpIcon = new L.DivIcon({
  html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 14px 28px rgba(0,0,0,0.8))">
      <div style="
        background: #000000;
        color: #ffffff;
        padding: 7px 16px;
        border-radius: 100px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        white-space: nowrap;
        font-family: -apple-system, system-ui, sans-serif;
        border: 1px solid rgba(255, 255, 255, 0.25);
        box-shadow: 0 4px 15px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        gap: 6px;
      ">
        <span style="font-size:8px;opacity:0.8;">●</span> PICKUP
      </div>
      <div style="width:2px;height:14px;background:linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,1) 100%);"></div>
      <div style="
        width:12px;height:12px;background:#000000;border-radius:50%;
        border:3px solid #ffffff;
        box-shadow: 0 0 10px rgba(255,255,255,0.5), 0 0 0 3px #000000;
      "></div>
    </div>`,
  className: "",
  iconSize: [110, 60],
  iconAnchor: [55, 60],
});

const dropIcon = new L.DivIcon({
  html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 14px 28px rgba(0,0,0,0.8))">
      <div style="
        background: #000000;
        color: #ffffff;
        padding: 7px 16px;
        border-radius: 100px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        white-space: nowrap;
        font-family: -apple-system, system-ui, sans-serif;
        border: 1px solid rgba(255, 255, 255, 0.25);
        box-shadow: 0 4px 15px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        gap: 6px;
      ">
        <span style="font-size:9px;opacity:0.8;">■</span> DROP
      </div>
      <div style="width:2px;height:14px;background:linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,1) 100%);"></div>
      <div style="
        width:12px;height:12px;background:#ffffff;border-radius:2px;
        border:3px solid #000000;
        box-shadow: 0 0 10px rgba(255,255,255,0.5), 0 0 0 2px #ffffff;
      "></div>
    </div>`,
  className: "",
  iconSize: [110, 60],
  iconAnchor: [55, 60],
});

interface FitBoundProps {
  p1: [number, number];
  p2: [number, number];
  // 1. Polyline route ke saare coordinates ka array pass karna zaroori hai
  routeCoordinates?: [number, number][];
}

export function FitBound({ p1, p2, routeCoordinates }: FitBoundProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const timer = setTimeout(() => {
      map.invalidateSize();

      // Agar route ki polyline hai toh wo use karo, warna start-end points
      const pointsToFit =
        routeCoordinates && routeCoordinates.length > 0
          ? routeCoordinates
          : [p1, p2];

      const bounds = L.latLngBounds(pointsToFit);

      // Balanced padding: Nechhe ke white card ke hisab se safe margins
      map.fitBounds(bounds, {
        paddingTopLeft: [40, 60], // [left, top] - Upar ke buttons se bachne ke liye
        paddingBottomRight: [40, 140], // [right, bottom] - 140px safe hai (280 bohot zyada tha!)
        maxZoom: 16, // Thoda aur zoom-in allow kiya hai clear dikhne ke liye
        animate: true,
        duration: 0.5,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [map, p1, p2, routeCoordinates]);

  return null;
}

function Searchmap({
  pickupLocation,
  dropLocation,
  onChange,
  changeDist,
}: mapProps) {
  const [p1, setP1] = useState<[number, number]>(); // lat and lon for pickup
  const [p2, setP2] = useState<[number, number]>(); // lat and lon for drop
  const [route, setRoute] = useState<[number, number][]>([]);
  const [km, setKm] = useState<number>(0);
  const [ready, setReady] = useState(false);
  const [time, setTime] = useState<number>(0);

  const getGeoLocation = async (
    address: string,
  ): Promise<[number, number] | null> => {
    try {
      const { data } = await axios.get(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`,
      );

      if (data.features.length === 0) {
        return null;
      }

      const [longitude, latitude] = data.features[0].geometry.coordinates;

      return [latitude, longitude];
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const reverseCoding = async (lat: number, lon: number) => {
    const { data } = await axios.get(
      `https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}`,
    );

    if (!data.features.length) return;
    // 1. Clean Destructuring
    const { name, street, city, state, postcode, country } =
      data.features[0].properties;

    // 2. Array banao aur falsy values hatao
    const rawParts = [name, street, city, state, postcode, country].filter(
      Boolean,
    );
    const uniqueAddress = [...new Set(rawParts)].join(", ");
    return uniqueAddress;
  };

  const loadRoute = async (p: [number, number], d: [number, number]) => {
    try {
      const { data } = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${p[1]},${p[0]};${d[1]},${d[0]}?overview=full&geometries=geojson`,
      );
      //mereko routes ka lat lon ek state me store kar lo
      if (data.routes.length === 0) return;

      setRoute(
        data.routes[0].geometry.coordinates.map(
          ([lon, lat]: [number, number]) => [lat, lon],
        ),
      );
      const distInKm = +(data.routes[0].distance / 1000).toFixed(2);
      const etaTime = Math.ceil(data.routes[0].duration / 60);
      setKm(distInKm);
      changeDist(distInKm);
      setTime(etaTime);
    } catch (error) {
      console.log(error);
    }
  };

  const dragPickupIcon = async (lat: number, lon: number) => {
    setP1([lat, lon]);
    if (p2) {
      loadRoute([lat, lon], p2);
    }
    const newPickup = await reverseCoding(lat, lon);
    if (newPickup) {
      onChange(newPickup, dropLocation);
    }
  };
  const dragDropIcon = async (lat: number, lon: number) => {
    setP2([lat, lon]);
    if (p1) {
      loadRoute(p1, [lat, lon]);
    }
    const newDrop = await reverseCoding(lat, lon);
    if (newDrop) {
      onChange(pickupLocation, newDrop);
    }
  };

  useEffect(() => {
    (async () => {
      setReady(false);
      if (pickupLocation && dropLocation) {
        const [latLonPickup,latLonDrop] = await Promise.all([getGeoLocation(pickupLocation),getGeoLocation(dropLocation)]);
        if (!latLonPickup || !latLonDrop) return;
        setP1(latLonPickup);
        setP2(latLonDrop);
        loadRoute(latLonPickup, latLonDrop);
      }
      setReady(true);
    })();
  }, [pickupLocation, dropLocation]);

  return (
    <div className="relative h-full w-full bg-zinc-100">
      <MapContainer
        style={{ width: "100%", height: "100%" }}
        center={[26.9124, 75.7873]}
        zoom={13}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">"CARTO"</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        />
        {p1 && p2 && <FitBound p1={p1} p2={p2} routeCoordinates={route} />}
        {p1 && (
          <Marker
            position={p1}
            icon={pickUpIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const m = e.target.getLatLng();
                dragPickupIcon(m.lat, m.lng);
              },
            }}
          />
        )}
        {p2 && (
          <Marker
            icon={dropIcon}
            position={p2}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const m = e.target.getLatLng();
                dragDropIcon(m.lat, m.lng);
              },
            }}
          />
        )}
        {route.length > 0 && (
          <>
            {/* 1. Base Shadow / Glow Layer (Creates 3D Depth) */}
            {/* 1. White Outer Border Layer */}
            <Polyline
              positions={route}
              pathOptions={{
                color: "#ffffff",
                weight: 7, // White outline
                opacity: 0.9,
                lineCap: "round",
                lineJoin: "round",
              }}
            />

            {/* 2. Inner Black Core Line */}
            <Polyline
              positions={route}
              pathOptions={{
                color: "#000000",
                weight: 4, // Black core
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}
      </MapContainer>

      {!ready && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 z-999 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center gap-4"
          >
            <div className="relative w-14 h-14 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-900"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border border-transparent border-t-zinc-300"
              />
              <MapPin size={15} className="text-zinc-800" />
            </div>

            <div className="text-center">
              <p className="text-zinc-900 text-xs font-black tracking-[0.22em] uppercase">
                Loading Map
              </p>
              <p className="text-zinc-400 text-[10px] font-medium tracking-wider mt-0.5 animate-pulse">
                Plotting your route…
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {ready && km !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-12 left-4 z-500 flex items-center gap-2 bg-white border border-zinc-200 px-3.5 py-2 rounded-xl shadow-lg"
          >
            <Navigation size={13} className="text-zinc-900" />
            <span className="text-zinc-900 text-xs font-bold">{km} km</span>
            <span className="w-px h-3 bg-zinc-200" />
            <span> ~{time} min</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Searchmap;
