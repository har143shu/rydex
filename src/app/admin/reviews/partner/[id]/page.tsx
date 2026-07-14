"use client";
import AnimateCard from "@/components/AnimateCard";
import { IPartnerBank } from "@/models/PartnerBank.model";
import { IPartnerDocs } from "@/models/partnerDocs.model";
import { IUser } from "@/models/user.model";
import { IVehicle } from "@/models/vehicle.model";
import { AnimatePresence, motion } from "motion/react";

import axios from "axios";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Loader2Icon,
  Car,
  Landmark,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DocPreview from "@/components/DocPreview";

function ReviewPage() {
  const [partnerData, setPartnerData] = useState<IUser | null>(null);
  const [vehicleData, setVehicleData] = useState<IVehicle | null>(null);
  const [documentData, setDocumentData] = useState<IPartnerDocs | null>(null);
  const [bankData, setBankData] = useState<IPartnerBank | null>(null);
  const[rejectionReason, setRejectionReason] = useState("");
  

  const [showApprove, setShowApprove] = useState<boolean>(false);
  const [showReject, setShowReject] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [rejectLoading, setRejectLoading] = useState<boolean>(false);
  const [approveLoading, setApproveLoading] = useState<boolean>(false);
  const router = useRouter();
  const { id } = useParams();

  async function handleApprove(){
    setApproveLoading(true);
    try{
        const {data} = await axios.patch(`/api/admin/reviews/partner/${id}/approve`);
        router.push("/");
        console.log(data);
    }catch(error){
        console.log(error);
    }finally{
        setApproveLoading(false);
    }
  }

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

async function handleReject(){
    console.log(rejectionReason);
    const senitizedMsg = rejectionReason.trim();
    if(!senitizedMsg){
        return;
    }
    setRejectLoading(true);
    try{
        const {data} = await axios.patch(`/api/admin/reviews/partner/${id}/reject`,{
            rejectionReason:senitizedMsg
        });
        router.push("/");
        console.log(data);
    }catch(error){
        console.log(error);
    }finally{
        setRejectLoading(false);
    }
  }

  const handleGetPartnerReviewData = async () => {
    if (!id) {
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/admin/reviews/partner/${id}`);
      setPartnerData(data.partner);
      setVehicleData(data.vehicle);
      setDocumentData(data.documents);
      setBankData(data.bank);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const temp = () => {
      handleGetPartnerReviewData();
    };
    temp();
  }, []);

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
            Loading Partner Details...
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
              {partnerData?.name}
            </div>
            <div className=" max-w-40 truncate text-xs text-gray-500">
              {partnerData?.email}
            </div>
          </div>
          {partnerData?.partnerStatus === "approved" ? (
            <div className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-green-100 text-green-700">
              <CheckCircle size={14} />
              Approved
            </div>
          ) : partnerData?.partnerStatus === "rejected" ? (
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

      {/* card */}

      <main className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <AnimateCard title="Vehicle Details" icon={<Car size={18} />}>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Vehicle Type</span>
              <span className="font-semibold">{vehicleData?.type || "-"}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Registration Number</span>
              <span className="font-semibold">
                {vehicleData?.number || "-"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Model</span>
              <span className="font-semibold">
                {vehicleData?.vehicleModel || "-"}
              </span>
            </div>
          </AnimateCard>

          <AnimateCard title="Vehicle Details" icon={<Car size={18} />}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <DocPreview label={"Aadhaar"} url={documentData?.aadharUrl} />
              <DocPreview
                label={"Registration Certificate"}
                url={documentData?.rcUrl}
              />
              <DocPreview
                label={"Driving License"}
                url={documentData?.licenseUrl}
              />
            </div>
          </AnimateCard>
        </div>

        <div className="space-y-8">
          <AnimateCard title={"Bank Details"} icon={<Landmark size={18} />}>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Account Holder</span>
              <span className="font-semibold">
                {bankData?.accountHolder || "-"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Account Number</span>
              <span className="font-semibold">
                {bankData?.accountNumber || "-"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">IFSC Code</span>
              <span className="font-semibold">{bankData?.ifsc || "-"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Upi</span>
              <span className="font-semibold">{bankData?.upi || "-"}</span>
            </div>
          </AnimateCard>

          {partnerData?.partnerStatus === "pending" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-4xl p-8 shadow-xl space-y-6"
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

export default ReviewPage;
