import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./styles/**/*.{ts,tsx}"
  ],
  theme: {
    screens: {
      ss: "375px",
      xs: "414px",
      sm: "768px",
      md: "1024px",
      lg: "1280px",
      lgxl: "1440px",
      xl: "1800px"
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        brand: {
          DEFAULT: "#00ffff",
          secondary: "#7b61ff",
          bright: "#00e5ff",
          dark: "#0a0020",
          light: "#66ffff"
        },
        gray: {
          dark: "#333333",
          DEFAULT: "#666666",
          medium: "#999999",
          light: "#c4c4c4",
          bg: "#eeeeee"
        },
        black: {
          dark: "#333333",
          DEFAULT: "#000000",
          medium: "#585858",
          light: "#545454"
        },
        blue: {
          DEFAULT: "#7b61ff",
          medium: "#bdb1ff",
          light: "#9e8eff"
        },
        red: {
          DEFAULT: "#D04040",
          medium: "#f1c7c7",
          light: "#e89393"
        },
        green: {
          DEFAULT: "#006400",
          medium: "#b6ffb6",
          light: "#0dff0d"
        },
        todo: {
          DEFAULT: "#BFB081",
          medium: "#f8f6f1",
          light: "#f8f6f1"
        },
        design: {
          DEFAULT: "#FF6C52",
          medium: "#ffcfc8",
          light: "#ff9f8f"
        },
        developed: {
          DEFAULT: "#A5D8BC",
          medium: "#e8f5ee",
          light: "#d2eede"
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        neon: {
          cyan: "#00FFFF",
          magenta: "#FF00FF",
          pink: "#FF1493",
          lime: "#39FF14",
          amber: "#FF6600"
        },
        glass: {
          bg: "rgba(255, 255, 255, 0.05)",
          border: "rgba(255, 255, 255, 0.10)",
          highlight: "rgba(255, 255, 255, 0.15)"
        },
        surface: {
          deep: "#0A0020",
          void: "#000000"
        }
      },
      fontFamily: {
        title: ["ibmplexmono_body_bold", "monospace"],
        "title-mono": ["ibmplexmono_body_mono_bold", "monospace"],
        "title-condensed": ["ibmplexmono_body_condensed_med", "sans-serif"],
        body: ["Anybody ExtraLight", "sans-serif"],
        "body-bold": ["Anybody Light", "sans-serif"],
        "mono-bold": ["ibmplexmono_body_mono_bold", "monospace"],
        "mono-semibold": ["ibmplexmono_body_mono_semibold", "monospace"],
        "mono-extralight": ["ibmplexmono_body_mono_extralight", "monospace"],
        pressstart: ["PressStart2P", "monospace"]
      },
      fontSize: {
        "title-xxl": ["72px", { lineHeight: "86px", fontWeight: "700" }],
        "title-xl": ["33.87px", { lineHeight: "41px", fontWeight: "700" }],
        "title-lg": ["24px", { lineHeight: "30px", fontWeight: "700" }],
        "title-md": ["20px", { lineHeight: "24px", fontWeight: "700" }],
        "title-sm": ["14px", { lineHeight: "1.5rem", fontWeight: "400" }],
        "title-xs": ["10px", { lineHeight: "0.9rem", fontWeight: "400" }],
        "body-lg": ["20px", { lineHeight: "22px", fontWeight: "400" }],
        "body-md": ["18px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "16px", fontWeight: "400" }],
        "body-sm-bold": ["14px", { lineHeight: "16px", fontWeight: "700" }],
        "body-xs": ["9px", { lineHeight: "0.9rem", fontWeight: "400" }]
      },
      backgroundImage: {
        ambient: "linear-gradient(180deg, #00ffff 0%, #7b61ff 100%)",
        "brand-gradient":
          "linear-gradient(180deg, rgba(10, 0, 32, 0) 0%, #0a0020 51.56%)",
        "yellow-gradient":
          "linear-gradient(180deg, rgba(248, 207, 81, 0.64) 0%, rgba(248, 207, 81, 0) 100%)",
        "omniscient-pink":
          "linear-gradient(180deg, #00ffff 0%, rgba(0, 255, 255, 0) 100%)",
        "ambient-vectors":
          "linear-gradient(142.27deg, #00ffff 21.81%, #7b61ff 43.8%, #ff1493 66.99%)",
        "ambient-vectors-reversed":
          "linear-gradient(180deg, #00ffff 0%, #7b61ff 100%)"
      },
      boxShadow: {
        "brand-glow": "0px 4px 4px rgba(0, 255, 255, 0.3)",
        "brand-glow-primary-lg":
          "0px 4px 4px rgba(0, 255, 255, 0.4), -4px -4px 10px rgba(123, 97, 255, 0.3), 4px 4px 20px rgba(94, 0, 249, 0.42)",
        "brand-glow-primary-sm":
          "0px 2px 2px rgba(0, 0, 0, 0.25), -2px -2px 4px rgba(123, 97, 255, 0.2), 2px 2px 10px rgba(94, 0, 249, 0.42)",
        "brand-glow-secondary-sm":
          "2px 3px 2px 1px rgba(122, 73, 152, 0.25), 0px -1px 2px rgba(123, 97, 255, 0.2)",
        skeuomorphism: "1px 1px 3px #FFFFFF, -1px -1px 2px rgba(2, 2, 2, 0.33)"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "expo-in-out": "cubic-bezier(0.87, 0, 0.13, 1)",
        spring: "cubic-bezier(0.22, 1.36, 0.36, 1)"
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" }
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" }
        },
        "live-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.15)" }
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" }
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-5rem)" },
          to: { opacity: "1", transform: "translateX(0)" }
        },
        "slide-out-left": {
          from: { opacity: "1", transform: "translateX(0)" },
          to: { opacity: "0", transform: "translateX(-5rem)" }
        },
        "fade-in-out": {
          "0%": { opacity: "1" },
          "50%": { opacity: "0.25" },
          "100%": { opacity: "1" }
        },
        // Magic UI keyframes
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" }
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" }
        },
        "shimmer-slide": {
          to: { transform: "translate(calc(100cqw - 100%), 0)" }
        },
        "spin-around": {
          "0%": { transform: "translateZ(0) rotate(0)" },
          "15%, 35%": { transform: "translateZ(0) rotate(90deg)" },
          "65%, 85%": { transform: "translateZ(0) rotate(270deg)" },
          "100%": { transform: "translateZ(0) rotate(360deg)" }
        },
        shine: {
          "0%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "100% 100%" },
          to: { backgroundPosition: "0% 0%" }
        },
        gradient: {
          to: { backgroundPosition: "var(--bg-size, 300%) 0" }
        },
        "float-up": {
          "0%": {
            opacity: "1",
            transform: "translateY(0) translateX(0) scale(1)"
          },
          "100%": {
            opacity: "0",
            transform:
              "translateY(-120px) translateX(var(--drift-x, 0px)) scale(1.3)"
          }
        },
        "blob-breathe": {
          "0%, 100%": { transform: "scale(0.98)", opacity: "0.85" },
          "50%": { transform: "scale(1.02)", opacity: "1" }
        },
        "gradient-sweep": {
          "0%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "100% 100%" },
          "100%": { backgroundPosition: "0% 0%" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-expo-out",
        "fade-up": "fade-up 0.6s ease-expo-out",
        "scale-in": "scale-in 0.4s ease-expo-out",
        shimmer: "shimmer 3s linear infinite",
        "live-pulse": "live-pulse 2s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.5s ease-expo-out",
        "slide-in-left":
          "slide-in-left 0.33s cubic-bezier(0.215, 0.61, 0.355, 1)",
        "slide-out-left":
          "slide-out-left 0.33s cubic-bezier(0.215, 0.61, 0.355, 1)",
        "fade-in-out": "fade-in-out 0.33s linear infinite",
        // Magic UI animations
        marquee: "marquee var(--duration, 40s) infinite linear",
        "marquee-vertical":
          "marquee-vertical var(--duration, 40s) linear infinite",
        "shimmer-slide":
          "shimmer-slide var(--speed, 3s) ease-in-out infinite alternate",
        "spin-around": "spin-around calc(var(--speed, 3s) * 2) infinite linear",
        shine: "shine var(--duration, 14s) infinite linear",
        gradient: "gradient 8s linear infinite",
        "float-up": "float-up 2s ease-expo-out forwards",
        "blob-breathe": "blob-breathe 4s ease-in-out infinite",
        "gradient-sweep": "gradient-sweep 12s ease-in-out infinite"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
