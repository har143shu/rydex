"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Image from "next/image";
import { Check, Loader2Icon, Mic, MicOff, PhoneOff, Video, VideoOff, X, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { AnimatePresence,motion } from "motion/react";

function Page() {
  const { userData } = useSelector((state: RootState) => state.user);
  const [joined, setJoined] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const[loading,setLoading] = useState(false);
  const[approveLoading,setApproveLoading] = useState(false);
  const[rejectLoading,setRejectLoading] = useState(false);
  const[isAcceptModelOpen, setIsAcceptModelOpen] = useState(false);
  const[isRejectModelOpen, setIsRejectModelOpen] = useState(false);


  const[reason,setReason] = useState("");



  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const {roomId} = useParams();
  const router = useRouter();

const startCall = async () => {
  if (!containerRef.current) return;
  setLoading(true);
  try {
    const { ZegoUIKitPrebuilt } =
      await import("@zegocloud/zego-uikit-prebuilt");

    const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
    const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!;

    const displayName=userData?.role=="admin"?"Admin":`${userData?.name} (${userData?.email})`
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appId,
      serverSecret,
      roomId?.toString() || "Room-id",
      userData?._id.toString() || "partner-id",
      displayName,
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container:containerRef.current,
      sharedLinks: [
        {
          name: "Copy Link",
          url: window.location.href,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showPreJoinView: false,
    });
    setJoined(true);
  } catch (err) {
    console.log(err);
  }finally{
  setLoading(false);
  }
};

  const toggleCamera = () => {
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => (track.enabled = !isCameraOn));
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => (track.enabled = !isMicOn));
    setIsMicOn(!isMicOn);
  };

  const handleReject = async()=>{
    setRejectLoading(true);
    if(!reason.trim()){
      setRejectLoading(false);
      return;
    }
    try{
      const {data} = await axios.patch("/api/admin/videokyc/complete",{
        roomId:roomId,
        action:"rejected",
        rejectionReason:reason,
      })
      console.log(data);
      router.push("/");

    }catch(error:any){
      console.log(error?.response?.data?.message || "error occurred");
    }finally{
    setRejectLoading(false);
    }
  }

  const handleApprove = async () => {
    setApproveLoading(true);
    try {
      const { data } = await axios.patch("/api/admin/videokyc/complete", {
        roomId: roomId,
        action: "approved",
      });
      console.log(data);
      router.push("/");
    } catch (error: any) {
      console.log(error?.response?.data?.message || "error occurred");
    }finally{
    setApproveLoading(false);
    
    }
  };

  useEffect(() => {
    //ye useEffect browser se mic and audio ki permission set
    //karke ek liveStram bnake ek box me render karwaega
    if (joined) return;
    let localstream: MediaStream;

    const init = async () => {
      try {
        localstream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(localstream);
        if (previewRef.current) {
          previewRef.current.srcObject = localstream;
        }
      } catch (error) {
        console.log(error);
      }
    };
    init();
  }, [joined]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="px-6 py-2 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Image src={"/logo.png"} alt="logo" width={44} height={44} priority />
          <p className="text-xs text-gray-400 mt-2">
            {userData?.role == "admin"
              ? "Admin Verification"
              : "Partner Video KYC"}
          </p>
        </div>

        {joined && (
          <div className="flex gap-4 flex-wrap">
            {userData?.role === "admin" && (
              <>
                <button
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full text-sm flex items-center cursor-pointer gap-2"
                  onClick={() => setIsAcceptModelOpen(true)}
                >
                  <Check size={15} /> Accept
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm flex items-center cursor-pointer gap-2"
                  onClick={() => setIsRejectModelOpen(true)}
                >
                  <XCircle size={15} /> Reject
                </button>
              </>
            )}
            <button onClick={()=>router.push("/")} className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-full text-sm flex items-center cursor-pointer gap-2">
              <PhoneOff size={15} /> End Call
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 relative">
        <div
          ref={containerRef}
          className={`absolute inset-0 ${joined ? "block" : "hidden"}`}
        />
        {!joined && (
          <div className="flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center  px-4 py-10">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <video
                  ref={previewRef}
                  autoPlay
                  playsInline
                  className="w-full h-75 sm:h-100 object-cover"
                />

                {!isCameraOn && (
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <VideoOff size={40} />
                  </div>
                )}
                {!isMicOn && (
                  <div className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 border border-red-500/40 backdrop-blur-md">
                    <MicOff size={20} className="text-red-500" />
                  </div>
                )}
              </div>
              <div className="space-y-8 text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold">
                  Secure Video KYC
                </h1>
                <div className="flex justify-center lg:justify-start gap-6">
                  <button
                    onClick={toggleCamera}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition cursor-pointer ${
                      isCameraOn
                        ? "bg-white text-black"
                        : "bg-white/10 border border-white/20"
                    }`}
                  >
                    {isCameraOn ? <Video /> : <VideoOff />}
                  </button>

                  <button
                    onClick={toggleMic}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition cursor-pointer ${
                      isMicOn
                        ? "bg-white text-black"
                        : "bg-white/10 border border-white/20"
                    }`}
                  >
                    {isMicOn ? <Mic /> : <MicOff />}
                  </button>
                </div>

                <button
                  onClick={startCall}
                  disabled={loading}
                  className="w-full bg-white text-black py-4 rounded-xl font-semibold cursor-pointer flex justify-center"
                >
                  {loading ? (
                    <Loader2Icon
                      size={18}
                      className="animate-spin text-black"
                    />
                  ) : (
                    "Join Secure Call"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* models */}
      <AnimatePresence>
        {isAcceptModelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
              <button
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-zinc-800 hover:text-white"
                onClick={() => setIsAcceptModelOpen(false)}
              >
                <X size={16} />
              </button>

              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                  <Check size={22} className="text-green-500" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Confirm Approval
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Are you sure you want to approve this partner Video KYC?
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setIsAcceptModelOpen(false)}
                  className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 font-medium text-gray-300 transition hover:bg-zinc-700 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  disabled={approveLoading}
                  onClick={handleApprove}
                  className="flex-1 rounded-xl bg-green-600 py-2.5 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {approveLoading ? "Processing..." : "Approve"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRejectModelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
              <button
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-zinc-800 hover:text-white"
                onClick={() => setIsRejectModelOpen(false)}
              >
                <X size={16} />
              </button>

              <h2 className="text-xl font-semibold text-white">
                Reject Partner
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Please provide a reason before rejecting this partner request.
              </p>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="mt-5 w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              />

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setIsRejectModelOpen(false)}
                  className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 font-medium text-gray-300 transition hover:bg-zinc-700 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  disabled={rejectLoading}
                  onClick={handleReject}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {rejectLoading ? "Processing..." : "Reject"}
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
