import React, { useState } from "react";
import { motion } from "framer-motion";

export interface NewsletterProps {
  title?: string | null;
  content?: string;
  backgroundColor?: string;
  privacyText?: string;
  showSocialLinks?: boolean;
}

const Newsletter: React.FC<NewsletterProps> = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        body: JSON.stringify({
          email,
          newContact: true
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const body = await res.json();
      if (body.error) {
        setStatus("error");
        setMessage(body.error);
      } else {
        setStatus("success");
        setMessage("You're in. We'll keep you posted.");
        setEmail("");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="px-6 py-16 sm:px-12 md:px-24 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="glass-panel mx-auto max-w-2xl px-8 py-12 text-center sm:px-12"
      >
        <h2 className="neon-text-cyan mb-6 font-pressstart text-sm sm:text-base">
          STAY IN THE LOOP
        </h2>

        <p className="mb-8 font-title text-sm leading-relaxed text-gray-400">
          Get notified about new products, sample packs, and firmware updates.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="neon-focus flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 font-title text-sm text-white placeholder:text-gray-500"
          />
          <button
            type="submit"
            className="neon-btn whitespace-nowrap"
            disabled={status === "sending"}
          >
            {status === "sending" ? "SENDING..." : "SUBSCRIBE"}
          </button>
        </form>

        {/* Status messages */}
        {status === "error" && (
          <p className="mt-4 font-title text-xs text-red-400">{message}</p>
        )}
        {status === "success" && (
          <p className="mt-4 font-title text-xs text-neon-cyan">{message}</p>
        )}

        <p className="mt-6 font-title text-[0.65rem] text-gray-600">
          No spam, ever. Unsubscribe anytime.
        </p>
      </motion.div>
    </section>
  );
};

export default Newsletter;
