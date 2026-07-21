"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bike,
  Car,
  CheckCircle,
  LocateFixed,
  Phone,
  Truck,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { vehicleType } from "@/models/vehicle.model";
import axios from "axios";

const stepVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const VEHICLES = [
  { id: "bike", label: "Bike", Icon: Bike, desc: "Quick & affordable" },
  { id: "auto", label: "Auto", Icon: Car, desc: "Everyday rides" },
  { id: "car", label: "Car", Icon: Car, desc: "Comfort rides" },
  { id: "loading", label: "Loading", Icon: Truck, desc: "Small cargo" },
  { id: "truck", label: "Truck", Icon: Truck, desc: "Heavy transport" },
];

type Place = {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  lat: number;
  lng: number;
};

function Page() {
  const [vehicle, setVehicle] = useState<vehicleType | null>(null);
  const [mobileNumber, setMobileNumber] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [pickupLat, setPickupLat] = useState<number>();
  const [pickupLon, setPickupLon] = useState<number>();
  const [pickupCountry, setPickupCountry] = useState("");
  const [dropLat, setDropLat] = useState<number>();
  const [dropLon, setDropLon] = useState<number>();
  const [dropCountry, setDropCountry] = useState("");
  const [searchSuggestion, setSearchSuggestion] = useState<Place[]>([]); //for pickup
  const [dropSearchSuggestion, setDropSearchSuggestion] = useState<Place[]>([]); //for drop

  const [locateLoading, setLocateLoading] = useState(false);

  // 1. Return type interface define kiya
  interface LocationCoords {
    latitude: number;
    longitude: number;
    accuracy: number;
  }

  // 2. Promise ko <LocationCoords> generic type provide kiya
  const getUserLocation = (): Promise<LocationCoords> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          resolve({ latitude, longitude, accuracy });
        },
        (error) => {
          reject(error);
        },
        options,
      );
    });
  };

  const fetchUserLocation = async () => {
    setLocateLoading(true);
    try {
      const { latitude, longitude} = await getUserLocation();
      setPickupLat(latitude);
      setPickupLon(longitude);
      const { data } = await axios.get(
        `https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}`,
      );

      if (data.features.length) {
        // 1. Clean Destructuring
        const { name, street, city, state, postcode, country } =
          data.features[0].properties;

        // 2. Array banao aur falsy values hatao
        const rawParts = [name, street, city, state, postcode, country].filter(
          Boolean,
        );
        const uniqueAddress = [...new Set(rawParts)].join(", ");
        setPickupLocation(uniqueAddress);
        setPickupCountry(country);
      }

      //   console.log("Reverse Geocoding Data:", data);
    } catch (error) {
      // Type narrowing approach taaki ESLint warning na de
      if (error instanceof Error) {
        console.error("Location Error:", error.message);
      } else {
        console.error("An unknown error occurred:", error);
      }
    } finally {
      setLocateLoading(false);
    }
  };

  const searchAddress = async (
    q: string,
    setSearch: (r: Place[]) => void,
    allowedCountry?:string | null // ye variable sirf drop location ke liye h 
  ) => {
    if (!q || q.trim().length < 3) {
      return;
    }
    try {
      const { data } = await axios.get(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=10&lang=en`,
      );
      console.log(data);

      let rawSearchSuggestionList: Place[] = (data.features ?? []).map(
        (f: any) => {
          return {
            id: String(f.properties.osm_id),
            name: f.properties.name,
            city: f.properties.city,
            state: f.properties.state,
            country: f.properties.country,
            countryCode: f.properties.countryCode,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
          };
        },
      );
      if(allowedCountry) rawSearchSuggestionList = rawSearchSuggestionList.filter((place)=>(place.country === allowedCountry));
      setSearch(rawSearchSuggestionList);
    } catch (error) {
      setSearch([]);
      console.log(error);
    }
  };

  const formatSuggestion = (p: Place) => {
    const rawParts = [p.name, p.city, p.state, p.country].filter(Boolean);
    const uniqueAddress = [...new Set(rawParts)].join(", ");
    return uniqueAddress;
  };

  // ye length mereko bta rhi h ki abhi tak mene kitne block bhr diye h
  const progress = [
    !!vehicle,
    !!(mobileNumber.length === 10),
    !!pickupLocation,
    !!dropLocation,
  ].filter(Boolean).length;

  const canContinue = !!(vehicle && mobileNumber && pickupLocation && dropLocation && pickupLat && pickupLon && dropLat && dropLon && pickupCountry && dropCountry);

  const router = useRouter();


  
  return (
    <div
      onClick={() => {
        setSearchSuggestion([]);
        setDropSearchSuggestion([]);
      }}
      className="min-h-screen bg-zinc-100 flex items-center justify-center px-4 py-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-4 mb-6 px-1">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => router.push("/")}
            className="w-11 h-11 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft size={13} className="text-zinc-900" />
          </motion.button>

          <div className="flex-1 min-w-0">
            <h1 className="text-zinc-900 text-xl font-black tracking-tight">
              Book a Ride
            </h1>
            <p className="text-zinc-400 text-xs mt-0.5">
              Fill in the details below
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {[0, 1, 2, 3].map((d, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i < progress ? 20 : 8,
                  background: i < progress ? "#09090b" : "#d4d4d8",
                }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-visible">
          <div className="h-1 bg-zinc-900 w-[90%] m-auto rounded-sm" />

          <div className="p-6 space-y-7">

            <motion.div
              variants={stepVariants}
              initial={"hidden"}
              animate={"visible"}
              transition={{ delay: 0.05 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
                  <span className="text-white text-[9px] font-black">1</span>
                </div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Choose Vehicle
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {VEHICLES.map((v, i) => {
                  const active = vehicle == v.id;
                  return (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.07 + i * 0.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setVehicle(v.id as vehicleType)}
                      className={`relative p-3.5 rounded-2xl border flex items-center gap-3 text-left transition-all cursor-pointer duration-200 ${
                        active
                          ? "bg-zinc-900 border-zinc-900 shadow-lg"
                          : "bg-zinc-50 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          active ? "bg-white" : "bg-zinc-200"
                        }`}
                      >
                        <v.Icon
                          size={18}
                          className={active ? "text-zinc-900" : "text-zinc-600"}
                        />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-bold truncate ${active ? "text-white" : "text-zinc-900"}`}
                        >
                          {v.label}
                        </p>
                        <p
                          className={`text-[10px] truncate ${active ? "text-zinc-400" : "text-zinc-400"}`}
                        >
                          {v.desc}
                        </p>
                      </div>

                      <div className="absolute top-2.5 right-2.5">
                        <CheckCircle
                          size={13}
                          className="text-white fill-white/20"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <div className="h-px bg-zinc-200" />

            <motion.div
              variants={stepVariants}
              initial={"hidden"}
              animate={"visible"}
              transition={{ delay: 0.05 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
                  <span className="text-white text-[9px] font-black">2</span>
                </div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Mobile Number
                </p>
              </div>

              <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 focus-within:border-zinc-900 focus-within:bg-white transition-all">
                <div className="w-8 h-8 rounded-xl bg-zinc-200 flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-zinc-600" />
                </div>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) =>
                    setMobileNumber(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter your mobile number"
                  inputMode="numeric"
                  maxLength={15}
                  className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
                />
                <AnimatePresence>
                  {mobileNumber.length === 10 && (
                    <CheckCircle
                      size={16}
                      className="text-emerald-600 fill-emerald-50 shrink-0"
                    />
                  )}
                </AnimatePresence>
              </div>

              <p className="text-zinc-400 text-[10px] mt-1.5 ml-1">
                Ride updates will be sent to this number
              </p>
            </motion.div>

            <div className="h-px bg-zinc-200" />

            <motion.div
              variants={stepVariants}
              initial={"hidden"}
              animate={"visible"}
              transition={{ delay: 0.05 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
                  <span className="text-white text-[9px] font-black">3</span>
                </div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Route
                </p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-visible">
                <div className="relative z-50">
                  <div className="flex items-center gap-3 px-4 py-3.5 focus-within:bg-white rounded-t-2xl transition-colors">
                    <div className="flex flex-col items-center shrink-0">
                      <div className='w-3 h-3 rounded-full bg-zinc-900 border-2 border-white shadow"' />
                      <div className="w-px h-5 bg-zinc-300 mt-1" />
                    </div>

                    <input
                      onChange={(e) => {
                        setPickupLocation(e.target.value);
                        searchAddress(e.target.value, setSearchSuggestion);
                      }}
                      value={pickupLocation}
                      placeholder="Pickup location"
                      className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
                    />
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={fetchUserLocation}
                      disabled={locateLoading}
                      className="w-8 h-8 rounded-xl bg-zinc-200 hover:bg-zinc-300 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <LocateFixed
                        size={14}
                        className={`text-zinc-700 ${locateLoading && "animate-spin"}`}
                      />
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {searchSuggestion.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-h-28 overflow-y-auto divide-y divide-zinc-100/80 ring-1 ring-black/5 z-50 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-300"
                      >
                        {searchSuggestion.map((suggestion, i) => {
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.02, duration: 0.15 }}
                              onClick={() => {
                                setPickupLocation(formatSuggestion(suggestion));
                                setPickupCountry(suggestion.country ?? "");
                                setPickupLat(suggestion.lat);
                                setPickupLon(suggestion.lng);
                                setSearchSuggestion([]);
                              }}
                              className="group flex items-center gap-3 w-full px-3.5 py-2.5 text-left hover:bg-linear-to-r hover:from-zinc-50/80 hover:to-zinc-100/50 transition-all duration-150 cursor-pointer select-none first:rounded-t-2xl last:rounded-b-2xl"
                            >
                              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-100/80 text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                                <MapPin size={14} />
                              </div>

                              <span className="text-xs font-medium text-zinc-700 group-hover:text-zinc-950 transition-colors truncate w-full">
                                {formatSuggestion(suggestion)}
                              </span>
                              <ChevronRight
                                size={14}
                                className="text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-auto"
                              />
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-px bg-zinc-200" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 px-4 py-3.5 focus-within:bg-white rounded-t-2xl transition-colors">
                    <div className="flex flex-col items-center shrink-0">
                      <div className='w-3 h-3 rounded-full bg-zinc-900 border-2 border-white shadow"' />
                    </div>

                    <input
                      disabled={!pickupCountry}
                      onChange={(e) => {
                        setDropLocation(e.target.value);
                        searchAddress(
                          e.target.value,
                          setDropSearchSuggestion,
                          pickupCountry,
                        );
                      }}
                      value={dropLocation}
                      placeholder={
                        pickupCountry
                          ? "Drop location"
                          : "Select pick up Location"
                      }
                      className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
                    />

                    <div className="w-8 h-8 rounded-xl bg-zinc-200 hover:bg-zinc-300 transition-colors flex items-center justify-center shrink-0 cursor-pointer">
                      <MapPin size={14} className={`text-zinc-700`} />
                    </div>
                  </div>

                  <AnimatePresence>
                    {dropSearchSuggestion.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-h-28 overflow-y-auto divide-y divide-zinc-100/80 ring-1 ring-black/5 z-50 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-300"
                      >
                        {dropSearchSuggestion.map((suggestion, i) => {
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.02, duration: 0.15 }}
                              onClick={() => {
                                setDropLocation(formatSuggestion(suggestion));
                                setDropCountry(suggestion.country ?? "");
                                setDropLat(suggestion.lat);
                                setDropLon(suggestion.lng);
                                setDropSearchSuggestion([]);
                              }}
                              className="group flex items-center gap-3 w-full px-3.5 py-2.5 text-left hover:bg-linear-to-r hover:from-zinc-50/80 hover:to-zinc-100/50 transition-all duration-150 cursor-pointer select-none first:rounded-t-2xl last:rounded-b-2xl"
                            >
                              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-100/80 text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                                <MapPin size={14} />
                              </div>

                              <span className="text-xs font-medium text-zinc-700 group-hover:text-zinc-950 transition-colors truncate w-full">
                                {formatSuggestion(suggestion)}
                              </span>
                              <ChevronRight
                                size={14}
                                className="text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-auto"
                              />
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={canContinue ? { scale: 1.02 } : {}}
                disabled={!canContinue}
                onClick={() => {
                  router.push(
                    `/user/search?pickup=${encodeURIComponent(pickupLocation)}&drop=${encodeURIComponent(dropLocation)}&vehicle=${vehicle}&mobile=${encodeURIComponent(mobileNumber)}&pickuplat=${pickupLat}&pickuplon=${pickupLon}&droplat=${dropLat}&droplon=${dropLon}`,
                  );
                }}
                className="cursor-pointer w-full h-14 rounded-2xl bg-zinc-900 hover:bg-black disabled:opacity-35 text-white font-black text-sm tracking-wide flex items-center justify-center gap-2.5 transition-colors shadow-lg disabled:shadow-none"
              >
                <span>Continue</span>
              </motion.button>
            </motion.div>
            
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Page;
