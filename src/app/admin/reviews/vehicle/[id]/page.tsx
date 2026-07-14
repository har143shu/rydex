"use client";
import { IUser } from "@/models/user.model";
import { vehicleType } from "@/models/vehicle.model";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  ImageIcon,
  IndianRupee,
  Loader2,
  Loader2Icon,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import AnimateCard from "@/components/AnimateCard";

interface IVehicle extends Document {
  owner: IUser;
  type: vehicleType;
  vehicleModel: string;
  number: string;
  imageUrl?: string;
  basePrice?: number;
  pricePerKM?: number;
  waitingCharge?: number;
  status: "approved" | "pending" | "rejected";
  rejectionReason?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function Page() {
  const { id } = useParams();
  const [data, setData] = useState<IVehicle | null>(null);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    if (
      document.referrer &&
      document.referrer.startsWith(window.location.origin)
    ) {
      router.back();
    } else {
      router.push("/");
    }
  };

    async function handleApprove(){
      setApproveLoading(true);
      try{
          const {data} = await axios.patch(`/api/admin/reviews/vehicle/${id}/approve`);
          router.push("/");
      }catch(error){
          console.log(error);
      }finally{
          setApproveLoading(false);
      }
    }
  
  async function handleReject(){
      const senitizedMsg = rejectionReason.trim();
      if(!senitizedMsg){
          return;
      }
      setRejectLoading(true);
      try{
          const {data} = await axios.patch(`/api/admin/reviews/vehicle/${id}/reject`,{
              rejectionReason:senitizedMsg
          });
          router.push("/");
      }catch(error){
          console.log(error);
      }finally{
          setRejectLoading(false);
      }
    }

  useEffect(() => {
    const handleGetVehicleData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/admin/reviews/vehicle/${id}`);
        setData(res.data);
      } catch (error: any) {
        console.log(
          error?.response?.data?.message ??
            "something went wrong while fetching vehicle data for pricing",
        );
      }finally{
        setLoading(false);
      }
    };
    handleGetVehicleData();
  }, [id]);


  if (loading) {
      return (
        <div
          className="min-h-screen grid place-items-center bg-gray-50/50"
          role="status"
        >
          <div className="flex flex-col items-center gap-3">
            {/* Animated Tailwind Spinner */}
            <Loader2Icon size={25} className="text-black/70 animate-spin" />
            <p className="text-sm font-medium text-gray-600 animate-pulse">
              Loading Vehicle Details...
            </p>
          </div>
        </div>
      );
    }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
      {/* sticky navbar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition cursor-pointer"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="max-w-40 truncate font-semibold text-lg">
              {data?.owner?.name}
            </div>
            <div className=" max-w-40 truncate text-xs text-gray-500">
              {data?.owner?.email}
            </div>
          </div>
          {data?.status === "approved" ? (
            <div className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-green-100 text-green-700">
              <CheckCircle size={14} />
              Approved
            </div>
          ) : data?.status === "rejected" ? (
            <div className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-red-100 text-red-700">
              <XCircle size={14} />
              Rejected
            </div>
          ) : (
            <div className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-yellow-100 text-yellow-700">
              <Clock size={14} />
              Pending
            </div>
          )}
        </div>
      </div>

      {/* FIX 1: Add 'items-start' to prevent vertical stretching */}
      <main className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12 items-start">
        {/* FIX 2: Add 'w-full h-fit self-start lg:sticky lg:top-24 border border-gray-100' */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl overflow-hidden shadow-xl bg-white w-full h-fit self-start lg:sticky lg:top-24 border border-gray-100"
        >
          {data?.imageUrl ? (
            /* FIX 3: Changed 'object-contain' to 'object-cover object-center w-full block' */
            <img
              src={data.imageUrl}
              alt="vehicle"
              className="w-full h-[450px] sm:h-[500px] object-cover object-center block"
            />
          ) : (
            <div className="h-[450px] w-full grid place-items-center text-gray-300 bg-gray-50">
              <ImageIcon size={32} />
            </div>
          )}
        </motion.div>

        <div className="space-y-8">
          <AnimateCard title={"Vehicle Details"} icon={<Truck size={18} />}>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Vehicle Type</span>
              <span className="font-semibold">{data?.type || "-"}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Registration Number</span>
              <span className="font-semibold">{data?.number || "-"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Model</span>
              <span className="font-semibold">{data?.vehicleModel || "-"}</span>
            </div>
          </AnimateCard>

          <AnimateCard
            title={"Pricing Configuration"}
            icon={<IndianRupee size={18} />}
          >
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Base Fare</span>
              <span className="font-semibold flex items-center  ">
                <IndianRupee size={13} />
                {data?.basePrice || 0}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Price Per KM</span>
              <span className=" font-semibold flex items-center  ">
                <IndianRupee size={13} />
                {data?.pricePerKM || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Waiting Charge</span>
              <span className="font-semibold flex items-center  ">
                <IndianRupee size={13} />
                {data?.waitingCharge || "-"}
              </span>
            </div>
          </AnimateCard>

          {data?.status == "pending" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-4xl p-8 shadow-xl space-y-6 border border-gray-100"
            >
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck size={18} />
                Admin Check
              </div>
              <p className="text-sm text-gray-500">
                Verify documents carefully before approving.
              </p>

              <div className="flex flex-col gap-4">
                <button
                  className="py-3 rounded-2xl bg-linear-to-r from-black to-gray-800 text-white font-semibold hover:opacity-90 transition cursor-pointer"
                  onClick={() => setShowApprove(true)}
                >
                  Approve
                </button>

                <button
                  className="py-3 rounded-2xl border font-semibold hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => setShowReject(true)}
                >
                  Reject
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
            <AnimatePresence>
              {showApprove && (
                <motion.div
                  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowApprove(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-white rounded-3xl p-6 w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h2 className="text-lg font-bold">Approve Partner?</h2>
                    <p className="text-sm text-gray-500 mt-2">
                      Confirm all information has been verified.
                    </p>
                    <div className="flex gap-3 mt-6">
                      <button
                        className="flex-1 py-2 rounded-xl border cursor-pointer"
                        onClick={() => setShowApprove(false)}
                      >
                        Cancel
                      </button>
                      <button
                        disabled={approveLoading}
                        className="cursor-pointer flex-1 flex items-center justify-center py-2 rounded-xl bg-black text-white"
                        onClick={handleApprove}
                      >
                        {approveLoading ? <Loader2 color="white" className="animate-spin" /> : "Yes, Approve"}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
      
            <AnimatePresence>
              {showReject && (
                <motion.div
                  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowReject(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-white rounded-3xl p-6 w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h2 className="text-lg font-bold">Reject Partner?</h2>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide the reason for rejection..."
                      className="w-full mt-3 rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 resize-none"
                      rows={4}
                    />
                    <div className="flex gap-3 mt-6">
                      <button
                        className="flex-1 py-2 rounded-xl border cursor-pointer"
                        onClick={() => setShowReject(false)}
                      >
                        Cancel
                      </button>
                      <button
                        disabled={rejectLoading}
                        className="cursor-pointer flex-1 flex items-center justify-center py-2 rounded-xl bg-black text-white"
                        onClick={handleReject}
                      >
                        {rejectLoading ? <Loader2 color="white" className="animate-spin" /> : "Reject"}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
    </div>
  );
}

export default Page;
