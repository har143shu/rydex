"use client";
import { RootState } from "@/redux/store";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import { Check, Clock, Lock, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import RejectedCard from "./RejectedCard";
import StatusCard from "./StatusCard";
import ActionCard from "./ActionCard";
import axios from "axios";


type Step = {
  id: number;
  title: string;
  route?: string;
};


const STEPS: Step[] = [
  { id: 1, title: "Vehicle", route: "/partner/onboarding/vehicle" },
  { id: 2, title: "Documents", route: "/partner/onboarding/documents" },
  { id: 3, title: "Bank", route: "/partner/onboarding/bank" },
  { id: 4, title: "Review" },
  { id: 5, title: "Video KYC" },
  { id: 6, title: "Pricing" },
  { id: 7, title: "Final Review" },
  { id: 8, title: "Live" },
];
const TOTAL_STEPS = STEPS.length;

function PartnerDashboard() {
  const [activeStep, setActiveStep] = useState(0);

  const { userData } = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const progressPercentage = ((activeStep - 1) / (TOTAL_STEPS - 1)) * 100;
   const [loading, setLoading] = useState(false);

    const handleTakeAction = async()=>{
        setLoading(true);
        try{
          await axios.patch("api/partner/videokyc/request");
          window.location.reload();
        }catch(error){
          console.error(error);
        }finally{
          setLoading(false);
        }
      }
  const handleGoToStep = (step: Step) => {
    if (step.route && step.id <= activeStep) {
      router.push(step.route);
    }
  };

  useEffect(() => {
    if (userData) {
      const temp = () => {
        setActiveStep(userData.partnerOnBoardingSteps + 1);
      };
      temp();
    }
  }, [userData]);
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 px-4 pt-28 pb-20">
      <div className="max-w-7xl mx-auto space-y-16">
        <div>
          <h1 className="text-4xl font-bold">Partner Onboarding</h1>
          <p className="text-gray-600 mt-3">
            Complete all steps to activate your account
          </p>
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-xl border overflow-x-auto">
          <div className="relative min-w-200">
            <div className="absolute top-7 left-0 w-full h-0.75 bg-gray-200 rounded-full" />
            <motion.div
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.6 }}
              className="absolute top-7 left-0 h-0.75 bg-black rounded-full"
            />
            <div className="relative flex justify-between">
              {STEPS.map((step) => {
                const completed = step.id < activeStep;
                const active = step.id == activeStep;
                const locked = step.id > activeStep;
                return (
                  <motion.div
                    key={step.id}
                    onClick={() => handleGoToStep(step)}
                    whileHover={!locked ? { scale: 1.1 } : {}}
                    className="flex flex-col items-center z-10 cursor-pointer"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all
                                                     ${
                                                       completed
                                                         ? "bg-black text-white border-black"
                                                         : active
                                                           ? "border-black bg-white"
                                                           : "border-gray-300 text-gray-400 bg-white"
                                                     }`}
                    >
                      {completed ? (
                        <Check size={20} />
                      ) : locked ? (
                        <Lock size={20} />
                      ) : (
                        step.id
                      )}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-center">
                      {step.title}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {userData?.partnerStatus === "rejected" && activeStep === 4 && (
          <RejectedCard
            title={"Action Required"}
            rejectionReason={userData?.rejectionReason}
            actionTitle={"Review and Update"}
            onAction={() => router.push("/partner/onboarding/vehicle")}
          />
        )}

        {userData?.partnerStatus === "pending" && activeStep === 4 && (
          <StatusCard
            icon={<Clock size={18} />}
            title={"Documents under review"}
            desc={"Admin is verifying your documents."}
          />
        )}

        {activeStep == 5 &&
          (userData?.videoKycStatus === "approved" ? (
            <StatusCard
              icon={<Check size={18} />}
              title={"video kyc approved"}
              desc={"You can now proceed to pricing."}
            />
          ) : userData?.videoKycStatus === "rejected" ? (
            <RejectedCard
              title="Video KYC Rejected"
              rejectionReason={userData?.videoKycRejectionReason}
              actionTitle={loading ? "Requesting..." :"Try Again"}
              onAction = {handleTakeAction}
            />
          ) : userData?.videoKycStatus === "in_progress" &&
            userData?.videoKycRoomId ? (
            <ActionCard
              icon={<Video size={18} />}
              title={"Admin Started Video KYC"}
              button={"Join Call"}
              onclick={() =>
                router.push(`/video-kyc/${userData.videoKycRoomId}`)
              }
            />
          ) : (
            <StatusCard
              icon={<Clock size={20} />}
              title="Waiting for Admin"
              desc="Admin will initiate Video KYC shortly."
            />
          ))}

        {activeStep === 6 && (userData?.videoKycStatus === "approved" ? (
            <StatusCard
              icon={<Check size={18} />}
              title={"video kyc approved"}
              desc={"You can now proceed to pricing."}
            />
          ) :null)}
      </div>
    </div>
  );
}

export default PartnerDashboard;
