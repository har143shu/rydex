"use client";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle,
  CreditCard,
  Landmark,
  Loader2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SiGooglepay } from "react-icons/si";
import { useEffect, useState } from "react";
import axios from "axios";

function Page() {
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upi, setUpi] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isNameValid = /^[A-Za-z\s.'-]{3,50}$/.test(accountHolder.trim());
  const isAccountValid = /^\d{9,18}$/.test(accountNumber.trim());
  const isIfscValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase());
  const isMobileValid = /^[6-9]\d{9}$/.test(mobileNumber.trim());
  const isUpiValid = !upi.trim() || /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(upi.trim());

  const canSubmit =
    isNameValid && isAccountValid && isIfscValid && isMobileValid;

  async function handleBankDetailSubmit() {
    setError("");
    setLoading(true);
    try {
      const sanitizedAccountHolder = accountHolder.trim();
      const sanitizedAccountNumber = accountNumber.trim();
      const sanitizedMobile = mobileNumber.trim();
      const sanitizedIfsc = ifsc.trim().toUpperCase();
      const sanitizedUpi = upi.trim();

      const { data } = await axios.post("/api/partner/onboarding/bank", {
        accountHolder: sanitizedAccountHolder,
        accountNumber: sanitizedAccountNumber,
        ifsc: sanitizedIfsc,
        upi: sanitizedUpi,
        mobileNumber: sanitizedMobile,
      });
      console.log(data);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ??
          "Something went wrong. Please try again.",
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const router = useRouter();

  useEffect(()=>{
    async function handleGetBankDetail() {
    try {
      const {data} = await axios.get("/api/partner/onboarding/bank");
      console.log(data)
      setAccountHolder(data.data.accountHolder);
      setAccountNumber(data.data.accountNumber);
      setIfsc(data.data.ifsc);
      setUpi(data.data.upi);
      setMobileNumber(data.mobileNumber);

    } catch (error) {
      console.error(error);
    }
  }
  handleGetBankDetail();
  },[]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8"
      >
        <div className="relative text-center">
          <button
            className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </button>

          <p className="text-xs text-gray-500 font-medium">step 3 of 3</p>

          <h1 className="text-2xl font-bold mt-1">Bank & Payout Setup</h1>
          <p className="text-sm text-gray-500 mt-2">Used for partner payouts</p>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="ahn"
              className="text-xs font-semibold text-gray-500"
            >
              Account holder name
            </label>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <BadgeCheck />
              </div>
              <input
                type="text"
                id="ahn"
                placeholder="As per bank records"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className={`flex-1 border-b pb-2 text-sm focus:outline-none
                                ${!isNameValid && accountHolder.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
              />
            </div>
            {!isNameValid && accountHolder.length > 0 && (
              <p className="mt-1 text-xs text-red-500">
                Enter valid account name
              </p>
            )}
          </div>

          <div>
            <label htmlFor="cc" className="text-xs font-semibold text-gray-500">
              Bank account number
            </label>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <CreditCard />
              </div>
              <input
                type="text"
                id="cc"
                placeholder="Enter account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className={`flex-1 border-b pb-2 text-sm focus:outline-none
                                ${!isAccountValid && accountNumber.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
              />
            </div>
            {!isAccountValid && accountNumber.length > 0 && (
              <p className="mt-1 text-xs text-red-500">
                Account number must be at least 9 digits
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="ifsc"
              className="text-xs font-semibold text-gray-500"
            >
              IFSC Code
            </label>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <Landmark />
              </div>
              <input
                type="text"
                id="ifsc"
                placeholder="HDFC0001234"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                className={`flex-1 border-b pb-2 text-sm focus:outline-none
                                ${!isIfscValid && ifsc.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
              />
            </div>
            {!isIfscValid && ifsc.length > 0 && (
              <p className="mt-1 text-xs text-red-500">Invalid IFSC code</p>
            )}
          </div>

          <div>
            <label htmlFor="mn" className="text-xs font-semibold text-gray-500">
              Mobile number
            </label>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <BadgeCheck />
              </div>
              <input
                type="text"
                id="mn"
                placeholder="10 digit mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className={`flex-1 border-b pb-2 text-sm focus:outline-none
                                ${!isMobileValid && mobileNumber.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
              />
            </div>
            {!isMobileValid && mobileNumber.length > 0 && (
              <p className="mt-1 text-xs text-red-500">
                Enter a valid 10-digit mobile number
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="upi"
              className="text-xs font-semibold text-gray-500"
            >
              UPI ID (optional)
            </label>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <SiGooglepay size={35} />
              </div>
              <input
                type="text"
                id="upi"
                placeholder="name@upi"
                value={upi}
                onChange={(e) => setUpi(e.target.value)}
                className={`flex-1 border-b pb-2 text-sm focus:outline-none
                                ${!isUpiValid && upi.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
              />
            </div>
            {!isUpiValid && upi.length > 0 && (
              <p className="mt-1 text-xs text-red-500">Enter a valid upi</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3 text-xs text-gray-500">
          <CheckCircle size={16} />
          <p>
            {" "}
            Bank details are verified before first payout. This usually takes
            24–48 hours.
          </p>
        </div>
        {error && <p className="text-red-500 text-sm pt-4">*{error}</p>}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleBankDetailSubmit}
          disabled={!canSubmit || loading}
          className="mt-8 w-full h-14 rounded-2xl bg-black text-white font-semibold disabled:opacity-40 transition flex items-center justify-center cursor-pointer"
        >
          {loading ? (
            <Loader2Icon size={18} color="white" className="animate-spin" />
          ) : (
            "Continue"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Page;
