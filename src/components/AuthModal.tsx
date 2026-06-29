"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2Icon, Lock, Mail, User, X } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { signIn, useSession } from "next-auth/react";

type propType = {
  open: boolean;
  onClose: () => void;
};

type stepType = "login" | "signup" | "otp";

function AuthModal({ open, onClose }: propType) {
  // state for changing ui for login|signup|otp
  const [step, setStep] = useState<stepType>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(""); // Naya state UI pe error dikhane ke liye
  const data = useSession();
  console.log(data);

  async function handleSignUp() {
    setError(""); // Purani error clear kar do
    // 1. Basic Validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all the fields.");
      return; // Aage API call mat karo
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // 2. API Call
      const { data } = await axios.post("/api/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      console.log("Registration successful:", data);
      setStep("otp");
    } catch (err: any) {
      console.log("Signup Error:", err);
      // 4. Backend se aayi error ko UI pe dikhane ke liye set karo
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    setError(""); // Purani errors clear karo
    // 1. Basic Validation
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      // NextAuth signIn call
      const data = await signIn("credentials", {
        email: email.trim(),
        password: password.trim(),
        redirect: false, // Iska matlab page khud refresh nahi hoga
      });

      // 2. NextAuth Error Handling
      if (data?.error) {
        // Agar credentials galat hain, toh error yahan aayegi
        console.log("Login failed:", data.error);
        setError("Invalid email or password. Please try again.");
        return;
      }

      // 3. Success State
      if (data?.ok) {
        console.log("Login successful!", data);
        // Modal close kar do ya next step pe bhej do
        onClose();
      }
    } catch (err) {
      // Ye tab chalega agar server crash ho jaye ya network issue ho
      console.log("Unexpected error during login:", err);
      setError("Something went wrong. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    const res = await signIn("google");
    console.log(res);
  }

  async function handleChangeOtp(index: number, value: string) {
    if (!/^[0-9]?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < otp.length - 1) {
      //toh mereko nect block pe focus karna h
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    if (!value && index > 0) {
      //toh mereko nect block pe focus karna h
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  }

async function handleVerifyEmail() {
  setError(""); // Purani error clear kar do

  // Variables ko ek hi baar trim karke store kar lo taaki baar-baar na karna pade
  const cleanEmail = email.trim();
  const sendOtp = otp.join("").trim();

  // 1. CRITICAL FIX & Basic Validation
  // Pehle yahan 'sendOtp.trim()' tha (bina NOT operator ke), isliye humesha true ho raha tha.
  // Maine OTP ki length ka check bhi lagaya hai (assuming 6 digit OTP hai).
  if (!cleanEmail || !sendOtp || sendOtp.length !== 6) {
    setError("Please enter a valid email and the complete 6-digit OTP.");
    return; // Aage API call mat karo
  }

  setLoading(true);

  try {
    // 2. API Call
    const { data } = await axios.post("/api/auth/verify-email", {
      email: cleanEmail,
      otp: sendOtp,
    });

    console.log("Verification successful:", data);
    setOtp(["", "", "", "", "", ""]);
    // Yahan tum chaho toh success toast notification bhi dikha sakte ho
    setStep("login");
  } catch (err: any) {
    console.log("Verification Error:", err);

    // 3. Backend se aayi error ko UI pe dikhane ke liye set karo
    setError(
      err.response?.data?.message || "Something went wrong. Please try again.",
    );
  } finally {
    // 4. Loading state false karo chahe success ho ya fail
    setLoading(false);
  }
}

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={"fixed inset-0 z-90 bg-black/80 backdrop-blur-md"}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 z-100 flex items-center justify-center px-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-[0_40px_100px_rgba(0,0,0,0.35)] p-6 sm:p-8 text-black"
            >
              {/* cross icon */}
              <div
                className="absolute cursor-pointer  right-4 top-4 text-gray-500 hover:text-black transition"
                onClick={onClose}
              >
                <X size={20} />
              </div>
              {/* title */}
              <div className="mb-6 text-center">
                <h1 className="text-3xl font-extrabold tracking-widest">
                  RYDEX
                </h1>
                <p className="mt-1 text-xs text-gray-500">
                  Premium Vehicle Booking
                </p>
              </div>

              {/*google button */}
              <button
                className=" w-full h-11 rounded-xl
                  border border-black/20
                  flex items-center justify-center gap-3
                  text-sm font-semibold
                  hover:bg-black hover:text-white
                  transition cursor-pointer"
                onClick={handleGoogleLogin}
              >
                <Image
                  src={"/google.png"}
                  alt="google"
                  width={20}
                  height={20}
                />
                Continue With Google
              </button>

              {/* line breaker */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-black/10" />
                <div className="text-xs text-gray-500">or</div>
                <div className="flex-1 h-px bg-black/10" />
              </div>

              <div>
                {step === "login" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <h1 className="text-xl font-semibold">Welcome back</h1>
                    <div className="mt-5 space-y-4">
                      <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                        <Mail size={18} className="text-gray-500" />
                        <input
                          type="email"
                          placeholder="Email"
                          onChange={(e) => setEmail(e.target.value)}
                          value={email}
                          className="w-full bg-transparent outline-none text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                        <Lock size={18} className="text-gray-500" />
                        <input
                          type="password"
                          placeholder="Password"
                          onChange={(e) => setPassword(e.target.value)}
                          value={password}
                          className="w-full bg-transparent outline-none text-sm"
                        />
                      </div>
                      {error && <p className="text-red-500 text-sm">{error}</p>}
                      <button
                        className="w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition flex justify-center items-center cursor-pointer"
                        onClick={handleLogin}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2Icon
                            size={18}
                            color="white"
                            className="animate-spin"
                          />
                        ) : (
                          "Login"
                        )}
                      </button>
                    </div>
                    <p className="mt-6 text-center text-sm text-gray-500">
                      {" "}
                      Don’t have an account?{" "}
                      <span
                        onClick={() => setStep("signup")}
                        className="text-black font-medium hover:underline cursor-pointer"
                      >
                        Sign Up
                      </span>
                    </p>
                  </motion.div>
                )}

                {step == "signup" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <h1 className="text-xl font-semibold">Create Account</h1>
                    <div className="mt-5 space-y-4">
                      <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                        <User size={18} className="text-gray-500" />
                        <input
                          type="text"
                          placeholder="Full Name"
                          onChange={(e) => setName(e.target.value)}
                          value={name}
                          className="w-full bg-transparent outline-none text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                        <Mail size={18} className="text-gray-500" />
                        <input
                          type="email"
                          placeholder="Email"
                          onChange={(e) => setEmail(e.target.value)}
                          value={email}
                          className="w-full bg-transparent outline-none text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                        <Lock size={18} className="text-gray-500" />
                        <input
                          type="password"
                          placeholder="Password"
                          onChange={(e) => setPassword(e.target.value)}
                          value={password}
                          className="w-full bg-transparent outline-none text-sm"
                        />
                      </div>
                      {error && <p className="text-red-500 text-sm">{error}</p>}
                      <button
                        onClick={handleSignUp}
                        className="w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition flex justify-center items-center cursor-pointer"
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2Icon
                            size={18}
                            color="white"
                            className="animate-spin"
                          />
                        ) : (
                          "Sign up"
                        )}
                      </button>
                    </div>
                    <p className="mt-6 text-center text-sm text-gray-500">
                      {" "}
                      Already have an account?{" "}
                      <span
                        onClick={() => setStep("login")}
                        className="text-black font-medium hover:underline cursor-pointer"
                      >
                        Login
                      </span>
                    </p>
                  </motion.div>
                )}
                {step === "otp" && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-xl font-semibold">Verify Email</h2>
                    <div className="mt-6 flex justify-between gap-2">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          id={`otp-${i}`}
                          value={digit}
                          maxLength={1}
                          className="w-10 h-12 sm:w-12
                            text-center text-lg font-semibold
                            rounded-xl bg-white
                            border border-black/20
                            outline-none"
                          onChange={(e) => handleChangeOtp(i, e.target.value)}
                        />
                      ))}
                    </div>
                    {error && <p className="text-red-500 ">{error}</p>}
                    <button
                      className="mt-6 w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 flex justify-center items-center transition cursor-pointer"
                      onClick={handleVerifyEmail}
                      disabled={loading}
                    >
                      {!loading ? (
                        "Verify OTP and Create Account"
                      ) : (
                        <Loader2Icon
                          size={18}
                          color="white"
                          className="animate-spin"
                        />
                      )}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AuthModal;
