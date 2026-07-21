"use client";
import { getSocket } from "@/lib/socket";
import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

function GeoUpdator({ userId }: { userId: string }) {
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    if (!userId) return;
    if (!navigator.geolocation) return;
    socketRef.current = getSocket();
    socketRef.current.emit("identity", userId);
    const watcher = navigator.geolocation.watchPosition(
      ({ coords }) => {
        if (socketRef.current) {
          socketRef.current.emit("update-location", {
            userId,
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        }
      },
      (error) => {
        console.log(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      },
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, [userId]);

  return null;
}

export default GeoUpdator;
