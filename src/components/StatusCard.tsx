import React from "react";
import { motion } from "motion/react";

type TypeStatusCard = {
  icon: React.ReactNode;
  title: string;
  desc: string;
};

function StatusCard({ icon, title, desc }: TypeStatusCard) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="
    bg-white
    rounded-2xl md:rounded-3xl
    p-5 sm:p-6 md:p-8
    shadow-xs hover:shadow-md
    border border-gray-100 hover:border-gray-200/80
    flex flex-col sm:flex-row
    gap-4 sm:gap-6
    items-start sm:items-center
    transition-all duration-200
  "
    >
      {/* Added zinc color and subtle inner border for 3D depth */}
      <div className="bg-zinc-900 text-white p-3.5 md:p-4 rounded-2xl shrink-0 shadow-sm border border-zinc-800">
        {icon}
      </div>

      <div className="flex-1 space-y-1">
        {/* tracking-tight makes headings look more modern */}
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 tracking-tight">
          {title}
        </h2>
        {/* leading-relaxed gives breathing room to description */}
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

export default StatusCard;
