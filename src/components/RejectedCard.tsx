"use client"
import { AlertTriangle } from "lucide-react";
import { motion } from "motion/react";


type TypeRejectCard = {
  title: string;
  rejectionReason: string | undefined;
  actionTitle: string;
  onAction: () => void;
};


function RejectedCard({
  title,
  rejectionReason,
  actionTitle,
  onAction,
}: TypeRejectCard) {
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-linear-to-br from-red-50 to-orange-50/30 border border-red-200/60 rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 shadow-xs"
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-red-100/80 rounded-lg text-red-600 shrink-0 mt-0.5">
          <AlertTriangle size={18} />
        </div>

        <div className="space-y-2 flex-1">
          <h3 className="text-red-900 font-semibold text-sm sm:text-base">
            {title}
          </h3>
          <p className="text-red-700/80 text-sm sm:text-base leading-relaxed">
            {rejectionReason}
          </p>

          {onAction && (
            <div className="pt-2">
              <button
                onClick={()=>{
                  onAction();
                }}
                className="cursor-pointer inline-flex items-center justify-center px-5 py-2 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-medium shadow-2xs hover:bg-red-50 hover:border-red-300 active:scale-[0.98] transition-all duration-150"
              >
                {actionTitle || "Try again"}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default RejectedCard;
