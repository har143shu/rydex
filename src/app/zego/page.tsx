"use client";

import  { useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

function Page() {
  const { userData } = useSelector((state: RootState) => state.user);

  const containerRef = useRef<HTMLDivElement>(null);

  const startCall = async () => {
    if (!containerRef.current) {
      return;
    }

    try {
      const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverSecret!,
        "jhishfi",
        userData?._id.toString() || "vnjf",
        "ayush",
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

    //   Aage joinRoom() call karna hoga
      zp.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: "Copy Link",
            url: window.location.href,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div ref={containerRef}>
      <button onClick={startCall}>Click</button>
    </div>
  );
}

export default Page;
