"use client";
import axios from "axios";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  Users,
  Video,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Kpi from "./Kpi";
import TabButton from "./TabButton";
import { AnimatePresence, motion } from "motion/react";
import ContentList from "./ContentList";

type statsType = {
  totalApprovedPartners: number;
  totalPartners: number;
  totalPendingPartners: number;
  totalRejectedPartners: number;
};
type activeTabType = "partner" | "kyc" | "vehicle";
function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<activeTabType>("partner");
  const [stats, setStats] = useState<statsType | null>(null);

  const [partnerForReview, setPartnerForReview] = useState<any>();
  const [partnerForKyc, setPartnerForKyc] = useState<any>();
  const [partnerForVehicle, setPartnerForVehilce] = useState<any>();

  const router = useRouter();
  const handleGetAdminDashboardData = async () => {
    try {
      const { data } = await axios.get("/api/admin/dashboard");
      setStats(data.stats);
      setPartnerForReview(data.partnerForReview);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGetPartnerDataForVideoKyc = async () => {
    try {
      const { data } = await axios.get("/api/admin/videokyc/pending");
      setPartnerForKyc(data.partnerForKyc)
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const temp = () => {
      handleGetAdminDashboardData();
      handleGetPartnerDataForVideoKyc();
    };
    temp();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b z-40">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <div>
            <Image
              className="cursor-pointer"
              src={"/logo.png"}
              onClick={() => router.push("/")}
              alt="logo"
              width={44}
              height={44}
              priority
            />
          </div>
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-black text-white">
            <ShieldCheck size={18} color="white" />
            <span>Admin Dashboard</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Kpi
            label="Total Partners"
            value={stats?.totalPartners}
            icon={<Users />}
            variant={"totalPartners"}
          />
          <Kpi
            label="Approved Partners"
            value={stats?.totalApprovedPartners}
            icon={<CheckCircle2 />}
            variant={"approved"}
          />
          <Kpi
            label="Pending Partners"
            value={stats?.totalPendingPartners}
            icon={<Clock />}
            variant={"pending"}
          />
          <Kpi
            label="Rejected Partners"
            value={stats?.totalRejectedPartners}
            icon={<XCircle />}
            variant={"rejected"}
          />
        </div>

        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 flex flex-wrap gap-2">
          <TabButton
            active={activeTab === "partner"}
            icon={<Users size={15} />}
            count={partnerForReview?.length ?? 0}
            onClick={() => setActiveTab("partner")}
          >
            Pending Partner Review
          </TabButton>

          <TabButton
            active={activeTab === "kyc"}
            icon={<Video size={15} />}
            count={partnerForKyc?.length ?? 0}
            onClick={() => setActiveTab("kyc")}
          >
            Pending Partner KYC
          </TabButton>

          <TabButton
            active={activeTab === "vehicle"}
            icon={<Truck size={18} />}
            count={partnerForVehicle?.length ?? 0}
            onClick={() => setActiveTab("vehicle")}
          >
            Pending Partner Vehicle
          </TabButton>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-3"
          >
            {activeTab == "partner" && (
              <ContentList data={partnerForReview ?? []} type={"partner"} />
            )}
            {activeTab == "kyc" && (
              <ContentList data={partnerForKyc ?? []} type={"kyc"} />
            )}
            {activeTab == "vehicle" && (
              <ContentList data={partnerForVehicle ?? []} type={"vehicle"} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default AdminDashboard;
