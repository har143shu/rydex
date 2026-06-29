// ye fn bss api call karta h jab bhi iss fn ko call kiya jae
"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setUserData } from "@/redux/userSlice";

const useGetMe = (enabled: boolean) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!enabled) return;

    const getMe = async () => {
      try {
        const { data } = await axios.get("/api/user/me");

        if (data?.success) {
          console.log(data.user)
          dispatch(setUserData(data.user));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    getMe();
  }, [enabled, dispatch]);
};

export default useGetMe;