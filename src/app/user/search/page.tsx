"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bike,
  Car,
  MapPin,
  Navigation,
  RefreshCcw,
  Search,
  Truck,
  Zap,
} from "lucide-react";
import dynamic from "next/dynamic";
import axios from "axios";
import VehicleCard from "@/components/VehicleCard";
import { vehicleType } from "@/models/vehicle.model";

const SearchMap = dynamic(() => import("@/components/Searchmap"), {
  ssr: false,
});

const VEHICLE_META: any = {
  bike: { label: "Bike", Icon: Bike },
  auto: { label: "Auto", Icon: Car },
  car: { label: "Car", Icon: Car },
  loading: { label: "Loading", Icon: Truck },
  truck: { label: "Truck", Icon: Truck },
};
 interface IVehicle{
    _id: string;
    owner:string
    type:vehicleType,
    vehicleModel:string,
    number:string,
    imageUrl?:string,
    basePrice?:number,
    pricePerKM?:number,
    waitingCharge?:number,
    status:"approved" | "pending" | "rejected",
    rejectionReason?:string,
    isActive:boolean,
    createdAt:Date,
    updatedAt:Date
}


function Page() {
  const params = useSearchParams();
  // console.log(params.toString());
  const [pickupLocation, setPickupLocation] = useState(
    params.get("pickup") || "",
  );
  const [dropLocation, setDropLocation] = useState(params.get("drop") || "");
  const [km, setKm] = useState<number>(0);
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);

  const mobile = params.get("mobile");
  const pickupLat = Number(params.get("pickuplat"));
  const pickupLon = Number(params.get("pickuplon"));
  const dropLat = Number(params.get("droplat"));
  const dropLon = Number(params.get("droplon"));
  const vehicle = params.get("vehicle") || "";

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const meta = VEHICLE_META[vehicle];

  const getNearByVehicles = async (
    latitude: number,
    longitude: number,
    vehicleType: string,
  ) => {
    // console.log("client sode",latitude,longitude);
    setLoading(true);

    try {
      const { data } = await axios.post("/api/vehicles/find-near", {
        latitude,
        longitude,
        vehicleType,
      });
      // console.log(data)
      setVehicles(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!pickupLat || !pickupLon || !vehicle) return;
    const temp = () => {
      getNearByVehicles(pickupLat, pickupLon, vehicle);
    };
    temp();
  }, [pickupLat, pickupLon, vehicle, pickupLocation]);

  return (
    <div className="min-h-screen bg-zinc-100 rext-zinc-900 overflow-x-hidden">
      {/* back icon */}
      <div className="absolute top-5 left-5 z-50">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => router.back()}
          className="w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors cursor-pointer"
        >
          <ArrowLeft size={17} className="text-zinc-900" />
        </motion.button>
      </div>

      {/* map */}
      <div className="relative w-full h-[52vh] z-0">
        <SearchMap
          pickupLocation={pickupLocation}
          dropLocation={dropLocation}
          onChange={(pickup, drop) => {
            setPickupLocation(pickup);
            setDropLocation(drop);
          }}
          changeDist={setKm}
        />
      </div>

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 22 }}
        className="relative z-20 -mt-10 bg-white rounded-t-[28px] border-t border-zinc-200 shadow-[0_-8px_40px_rgba(0,0,0,0.08)] pt-5 pb-20 min-h-[52vh]"
      >
        <div className="px-5 lg:px-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden mb-5"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100">
              <div className="flex flex-col items-center pt-1.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
                <div
                  className="w-px flex-1 bg-zinc-300 my-1"
                  style={{ minHeight: 14 }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5">
                  Pickup
                </p>
                <p className="text-sm text-zinc-900 font-semibold leading-snug truncate">
                  {pickupLocation || "-"}
                </p>
              </div>
              <MapPin size={14} className="text-zinc-400 shrink-0" />
            </div>
            <div className="flex gap-3 px-4 py-3 border-b border-zinc-100 items-center">
              <div className="flex flex-col items-center pt-1.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5">
                  drop
                </p>
                <p className="text-sm text-zinc-900 font-semibold leading-snug truncate">
                  {dropLocation || "-"}
                </p>
              </div>
              <Navigation size={14} className="text-zinc-400 shrink-0" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-4"
          >
            <div>
              <h2 className="text-zinc-900 text-lg font-black tracking-tight">
                {loading
                  ? "Finding Vehicles"
                  : vehicles.length > 0
                    ? "Available"
                    : "No Nearby Vehicles"}
              </h2>
              {meta && (
                <div className="text-zinc-400 text-xs mt-0.5">
                  {meta.label} rides near your pickup
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="searching"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-full"
                >
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-300 border-t-zinc-700 animate-spin" />
                  <span className="text-zinc-500 text-xs font-semibold">
                    Searching...
                  </span>
                </motion.div>
              ) : vehicles.length > 0 ? (
                <motion.div
                  key="live"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full"
                >
                  <Zap
                    size={11}
                    className="text-emerald-600 fill-emerald-600"
                  />
                  <span className="text-emerald-700 text-xs font-bold">
                    Live
                  </span>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {!loading && vehicles.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-14 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-4">
                  <Search size={26} className="text-zinc-400" />
                </div>
                <p className="text-zinc-900 font-bold text-base mb-1">
                  Vehicles Not Found
                </p>
                <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
                  {meta.label || "Vehicle"} drivers are available near your
                  pickup right now.
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    getNearByVehicles(pickupLat, pickupLon, vehicle)
                  }
                  className="mt-5 flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  <RefreshCcw size={14} /> Retry Search
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vehicles.map((v,i)=>(
               <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.06,
                  duration: 0.38,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <VehicleCard vehicle={v} distance={km}
                  onBook={()=>{
                    const url = new URLSearchParams({
                      pickupLocation,
                      dropLocation,
                      vehicle: v.type,
                      driverId: v.owner,
                      vehicleId: String(v._id),
                      fare: String(
                        Math.round(v.basePrice! + v.pricePerKM! * km),
                      ),
                      pickUpLat: String(pickupLat),
                      pickUpLon: String(pickupLon),
                      dropLat: String(dropLat),
                      dropLon: String(dropLon),
                      mobile: String(mobile),
                    });
                    router.push(`/user/checkout?${url.toString()}`);
                  }}
                />
              </motion.div>
            ))}
           </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Page;
