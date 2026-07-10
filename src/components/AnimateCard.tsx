import React from 'react'
import {motion} from "motion/react"

type TypeCard={
    title:string | null,
    icon:React.ReactNode,
    children:React.ReactNode,

}

function AnimateCard({title,icon,children}:TypeCard) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-4xl p-8 shadow-xl space-y-6"
    >
      <div className="flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </div>
      {children}
    </motion.div>
  );
}

export default AnimateCard