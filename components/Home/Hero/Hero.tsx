import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export interface HeroProps {
  title?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
}

const Hero: React.FC<HeroProps> = () => {
  return (
    <section className="relative overflow-hidden px-6 py-20 sm:px-12 sm:py-28 md:px-24 md:py-32">
      {/* Dark gradient background with radial neon glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255, 0, 255, 0.12) 0%, rgba(255, 0, 255, 0.04) 40%, transparent 70%)"
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="neon-text-magenta font-pressstart text-xl leading-relaxed sm:text-2xl md:text-3xl lg:text-4xl"
        >
          BEEPER {"\u0394"}8
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="mt-6 font-title text-sm tracking-wide text-white sm:text-base"
        >
          PRE-ORDER NOW &mdash; SHIPS FALL &apos;26
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          className="mt-4 max-w-xl font-title text-sm leading-relaxed text-gray-400"
        >
          An expressive, pocket-sized instrument with 8 force-sensing pads, dual
          capacitive sliders, an AMOLED display, and BLE MIDI &mdash; designed
          to make music anywhere.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.45 }}
          className="mt-8"
        >
          <Link href="/beeper-8" className="neon-btn inline-block">
            PRE-ORDER NOW
          </Link>
        </motion.div>

        {/* Price */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.6 }}
          className="mt-6 font-title text-sm text-neon-cyan"
        >
          Starting at $199.99
        </motion.p>
      </div>
    </section>
  );
};

export default Hero;
