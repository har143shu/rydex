"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IndianRupee, PlusCircleIcon } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

type propsType = {
  open: boolean;
  onClose: () => void;

};

function PricingModel({ open, onClose}: propsType) {
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pricePerKm, setPricePerKm] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [waitingCharge, setWaitingCharge] = useState("");
  const[loading, setLoading] = useState(false);
  // const router = useRouter();

const handleSubmit = async()=>{
    const sanatizedPricePerKm = pricePerKm.trim();
    const sanatizedbasePrice = basePrice.trim();
    const sanatizedWaitingCharge = waitingCharge.trim();
    if(!sanatizedPricePerKm || !sanatizedbasePrice || !sanatizedWaitingCharge) return;

    const formData = new FormData();
    if (image) {
      formData.append("image", image);
    }
    formData.append("basePrice",sanatizedbasePrice);
    formData.append("waitingCharge",sanatizedWaitingCharge);
    formData.append("pricePerKm", sanatizedPricePerKm);

    setLoading(true);
    try{
      const {data} = await axios.patch("/api/partner/onboarding/pricing",formData);
      console.log(data);
      onClose();
    }catch(error){
      console.error(error);
    }finally{
    setLoading(false);
    }
  }

  const getPricingData = async()=>{
    try{
      const {data} = await axios.get("/api/partner/onboarding/pricing");
      if (data) {
        setPreviewImage(data.imageUrl || null);
        setBasePrice(data.basePrice?.toString() || "");
        setPricePerKm(data.pricePerKM?.toString() || "");
        setWaitingCharge(data.waitingCharge?.toString() || "");
        setVehicle(data);
      }
    }catch(error:any){
        console.log(error.response?.status);
        console.log(error.response?.data);
    }
  }

  useEffect(()=>{
    const temp = ()=>{
      getPricingData();
    }
    temp();
  },[])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        >
          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white px-4 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="py-4 border-b">
              <h2 className="text-xl font-bold">Pricing and Vehicle Image </h2>
            </div>
            <div className="p-6 space-y-6">
              <label
                htmlFor="image-input"
                // Height h-44 se badha kar h-52 ki hai taaki bike achhe se dikhe
                className="relative w-full h-52 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden hover:border-gray-400 transition-colors bg-gray-50/50"
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Vehicle preview"
                    // 1. 'object-contain' poori image dikhayega bina crop kiye
                    // 2. 'p-2' taaki bike border se touch na ho
                    className="absolute inset-0 w-full h-full object-contain p-2 rounded-2xl pointer-events-none"
                  />
                ) : (
                  <PlusCircleIcon className="text-gray-500" size={29} />
                )}

                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0];
                      setImage(file);
                      setPreviewImage(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>

              <div>
                <p className="text-sm font-semibold mb-1">Base Fare</p>
                <div className="flex items-center gap-2 border rounded-xl px-4 py-3 bg-white">
                  <IndianRupee size={18} />
                  <input
                    type="text"
                    placeholder="base fare"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full outline-none"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-1">Price Per KM</p>
                <div className="flex items-center gap-2 border rounded-xl px-4 py-3 bg-white">
                  <IndianRupee size={18} />
                  <input
                    type="text"
                    placeholder="price per KM"
                    value={pricePerKm}
                    onChange={(e) => setPricePerKm(e.target.value)}
                    className="w-full outline-none"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-1">Waiting Charge</p>
                <div className="flex items-center gap-2 border rounded-xl px-4 py-3 bg-white">
                  <IndianRupee size={18} />
                  <input
                    type="text"
                    placeholder="Waiting Charge"
                    value={waitingCharge}
                    onChange={(e) => setWaitingCharge(e.target.value)}
                    className="w-full outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button
                className="flex-1 border rounded-xl py-2 cursor-pointer"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-black text-white rounded-xl py-2 cursor-pointer"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PricingModel;
