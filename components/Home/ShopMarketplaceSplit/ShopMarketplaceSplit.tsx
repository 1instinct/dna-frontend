import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const ShopMarketplaceSplit: React.FC = () => {
  return (
    <section className="px-6 py-16 sm:px-12 md:px-24 md:py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Shop Panel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Link href="/browse?mode=shop" className="group block">
            <div className="glass-panel glass-panel-hover relative flex min-h-[280px] flex-col items-center justify-center p-8 text-center transition-all duration-300 group-hover:scale-[1.02] md:min-h-[300px]">
              {/* Decorative icon area */}
              <div className="mb-6 text-5xl opacity-60 transition-opacity duration-300 group-hover:opacity-90">
                <span role="img" aria-label="device">
                  🎛️
                </span>
              </div>

              <h3 className="neon-text-cyan mb-4 font-pressstart text-lg sm:text-xl">
                SHOP
              </h3>
              <p className="font-mono-semibold max-w-xs text-sm text-gray-400 sm:text-base">
                Devices, Accessories & Apparel
              </p>
            </div>
          </Link>
        </motion.div>

        {/* Marketplace Panel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        >
          <Link href="/browse?mode=marketplace" className="group block">
            <div className="glass-panel glass-panel-hover relative flex min-h-[280px] flex-col items-center justify-center p-8 text-center transition-all duration-300 group-hover:scale-[1.02] md:min-h-[300px]">
              {/* Decorative icon area */}
              <div className="mb-6 text-5xl opacity-60 transition-opacity duration-300 group-hover:opacity-90">
                <span role="img" aria-label="music">
                  🎵
                </span>
              </div>

              <h3 className="neon-text-magenta mb-4 font-pressstart text-lg sm:text-xl">
                MARKETPLACE
              </h3>
              <p className="font-mono-semibold max-w-xs text-sm text-gray-400 sm:text-base">
                Sample Packs, Synths & Visualizers
              </p>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ShopMarketplaceSplit;
