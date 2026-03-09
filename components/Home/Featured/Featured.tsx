import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export interface FeaturedProduct {
  name: string;
  price: string;
  href: string;
  image?: string;
}

export interface FeaturedProps {
  data?: any[];
  title?: string;
  products?: FeaturedProduct[];
}

/** Static placeholder products matching seed data */
const PLACEHOLDER_PRODUCTS: FeaturedProduct[] = [
  {
    name: "Beeper \u03948",
    price: "$199.99",
    href: "/beeper-8"
  },
  {
    name: "Carrying Case",
    price: "$29.99",
    href: "/beeper-carrying-case"
  },
  {
    name: "USB-C Cable",
    price: "$12.99",
    href: "/browse"
  },
  {
    name: "Carry Case",
    price: "$29.99",
    href: "/browse"
  },
  {
    name: "Lo-Fi Starter Kit",
    price: "$9.99",
    href: "/browse?mode=marketplace"
  },
  {
    name: "Synthwave Pack",
    price: "$14.99",
    href: "/browse?mode=marketplace"
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const Featured: React.FC<FeaturedProps> = ({ products, title }) => {
  const items = products || PLACEHOLDER_PRODUCTS;

  return (
    <section className="overflow-x-clip py-16 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="neon-text-cyan mb-8 text-center font-pressstart text-sm sm:text-base md:text-lg">
          {title || "FEATURED"}
        </h2>
      </motion.div>

      {/* Horizontal scroll container — inner div centers when content fits */}
      <div
        className="overflow-x-auto pb-4"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0, 255, 255, 0.3) transparent"
        }}
      >
        <motion.div
          className="mx-auto flex w-fit gap-5 px-6 sm:px-12 md:px-24"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {items.map((product) => (
            <motion.div key={product.name} variants={cardVariants}>
              <Link href={product.href} className="block">
                <div className="glass-panel group flex w-[200px] flex-shrink-0 flex-col items-center p-5 transition-all duration-500 hover:-translate-y-1 hover:border-transparent hover:bg-white/[0.08] hover:shadow-[0_0_18px_rgba(0,255,255,0.25)] sm:w-[220px]">
                  {/* Image placeholder */}
                  <div className="mb-4 flex h-[140px] w-full items-center justify-center rounded-lg bg-white/[0.03] sm:h-[160px]">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="font-micro5-charted text-base text-gray-600">
                        IMG
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <p className="w-full truncate text-center font-title text-xs text-white sm:text-sm">
                    {product.name}
                  </p>

                  {/* Price */}
                  <p className="mt-1 font-ds-digital text-sm tracking-wider text-neon-cyan sm:text-base">
                    {product.price}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Featured;
