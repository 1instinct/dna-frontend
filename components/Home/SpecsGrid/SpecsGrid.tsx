import React from "react";
import { motion } from "framer-motion";

const specs = [
  { label: "8\u00D7 FSR PADS" },
  { label: "2\u00D7 CAP-TOUCH SLIDERS" },
  { label: "AMOLED HUD" },
  { label: "BLE MIDI" }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const SpecsGrid: React.FC = () => {
  return (
    <section className="px-6 py-16 sm:px-12 md:px-24 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl"
      >
        <h2 className="neon-text-cyan mb-10 text-center font-pressstart text-sm sm:text-base md:text-lg">
          BEEPER {"\u0394"}8 SPECS
        </h2>

        <motion.div
          className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {specs.map((spec) => (
            <motion.div
              key={spec.label}
              variants={itemVariants}
              className="glass-panel flex items-center justify-center px-6 py-4 text-center"
            >
              <span className="neon-text-cyan font-micro5 text-sm leading-relaxed sm:text-base">
                {spec.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SpecsGrid;
