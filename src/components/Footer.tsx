"use client";
import { motion } from "motion/react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

// Map karne ke liye links ka data (Taaki code clean rahe)
const footerLinks = [
  {
    title: "Company",
    links: ["About Us", "Careers", "Blog", "Press"],
  },
  {
    title: "Vehicles",
    links: ["Cars", "Bikes", "Trucks", "Electric"],
  },
  {
    title: "Support",
    links: ["Help Center", "Terms of Service", "Privacy Policy", "Contact"],
  },
];

function Footer() {
  return (
    <div className="w-full bg-[#0a0a0a] text-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
        // pt-16 aur pb-12 alag kiya taaki border bottom wale div ke upar perfectly aaye
        className="max-w-7xl mx-auto px-6 pt-16 pb-12"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* 1. Brand Section */}
          <div className="col-span-1">
            <h2 className="text-3xl font-black tracking-tighter">
              RYDEX<span className="text-blue-500">.</span>
            </h2>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-xs">
              Book any vehicle — from bikes to trucks. Trusted owners.
              Transparent pricing.
            </p>

            <div className="flex gap-3 mt-6">
              {[FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn].map(
                (Icon, i) => (
                  <motion.a
                    key={i}
                    whileHover={{ y: -3, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="#"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-colors duration-300"
                  >
                    <Icon size={18} />
                  </motion.a>
                ),
              )}
            </div>
          </div>

          {/* 2, 3, 4. Links Section */}
          {footerLinks.map((section, idx) => (
            <div key={idx} className="flex flex-col">
              <h3 className="font-semibold text-white tracking-wide mb-5">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-gray-400 text-sm hover:text-white transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} RYDEX. All rights reserved.</p>

          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
