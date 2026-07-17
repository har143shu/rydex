"use client"
import React, {useState } from 'react'
import {motion} from "motion/react";
import {useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react';
import dynamic from "next/dynamic";


const SearchMap = dynamic(() => import("@/components/Searchmap"), {
  ssr: false,
});


function Page() {
  const params = useSearchParams();
  const[pickupLocation,setPickupLocation] = useState(params.get("pickup") || "");
  const[dropLocation,setDropLocation] = useState(params.get("drop") || "");
  const[km, setKm] = useState<number>(0);

  const mobile = params.get("mobile");
  const pickupLat = Number(params.get("pickuplat"));
  const pickupLon = Number(params.get("pickuplon"));
  const dropLat = Number(params.get("droplat"));
  const dropLon = Number(params.get("droplon"));
  const vehicle = params.get("vehicle") || "";
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-100 rext-zinc-900 overflow-x-hidden">
      {/* back icon */}
      <div className="absolute top-5 left-5 z-50">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => router.back()}
          className="w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors"
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden mb-5"
          >
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
        </div>
      </motion.div>
    </div>
  );
}

export default Page