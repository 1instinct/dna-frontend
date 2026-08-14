import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatedLogo } from "../Logo/AnimatedLogo";

// 8 unique SVG blob paths — sequenced for smooth morphing
const blobs = [
  "M43.3,-69.7C51.1,-62.3,49,-41.9,53.7,-26.1C58.4,-10.4,69.9,0.6,68.8,10.1C67.8,19.6,54.4,27.5,43.4,34.4C32.4,41.2,24,46.9,14.5,50.1C5,53.4,-5.6,54,-19.9,55.4C-34.2,56.8,-52.3,58.9,-58.2,51C-64.1,43.1,-57.9,25.3,-58.1,9.7C-58.3,-6,-65,-19.4,-65,-34C-65,-48.6,-58.4,-64.5,-46.4,-70C-34.4,-75.6,-17.2,-70.8,0.3,-71.2C17.7,-71.6,35.5,-77.2,43.3,-69.7Z",
  "M40.8,-63.9C54.3,-54.8,67.7,-45.9,76.2,-33.1C84.6,-20.3,88.1,-3.6,82,9C75.9,21.6,60.1,30,48.3,39.5C36.4,49,28.5,59.6,18.1,63.3C7.8,67,-5,63.9,-19.6,61.8C-34.1,59.7,-50.3,58.7,-59.9,50.4C-69.5,42.1,-72.5,26.5,-73.4,11.4C-74.3,-3.7,-73.2,-18.3,-65.9,-28.3C-58.6,-38.3,-45.1,-43.8,-33.1,-53.6C-21.1,-63.4,-10.5,-77.5,1.6,-80C13.7,-82.4,27.3,-73.1,40.8,-63.9Z",
  "M36.4,-58.3C45.7,-50.6,51,-38.1,58.4,-25.6C65.9,-13,75.5,-0.4,76.7,13.1C77.9,26.5,70.8,40.9,59.4,48.4C48.1,55.9,32.5,56.7,18.3,59.4C4.2,62.2,-8.5,67.1,-21.3,66.2C-34.1,65.3,-47.1,58.7,-58.1,48.8C-69.1,38.9,-78,25.7,-82.2,10.5C-86.5,-4.7,-85.9,-21.8,-77.9,-34C-69.8,-46.1,-54.3,-53.2,-40.1,-58.7C-25.8,-64.3,-12.9,-68.3,0.3,-68.7C13.5,-69.2,27,-66.1,36.4,-58.3Z",
  "M35.1,-51.8C49.7,-45.2,68.6,-42.6,72.9,-33.3C77.3,-23.9,67,-7.9,62,7.1C57,22.1,57.4,36.1,50.9,44.9C44.4,53.7,31.2,57.4,17.4,63.4C3.5,69.4,-10.9,77.7,-24.1,76.4C-37.4,75.1,-49.5,64.3,-59.3,52C-69.1,39.6,-76.6,25.9,-75.7,12.7C-74.9,-0.5,-65.7,-13.2,-58.4,-25.7C-51.2,-38.3,-45.9,-50.7,-36.5,-59.7C-27.1,-68.7,-13.5,-74.3,-1.6,-71.7C10.2,-69.1,20.5,-58.4,35.1,-51.8Z",
  "M29.3,-48.1C38.6,-39.7,47.3,-33.3,55.5,-23.9C63.8,-14.5,71.7,-2.2,71.7,10.7C71.6,23.5,63.5,36.9,52.2,44.7C41,52.5,26.6,54.8,12.4,59.1C-1.8,63.4,-15.8,69.7,-28.5,67.2C-41.3,64.6,-52.8,53.2,-62.2,40.1C-71.7,27,-79,12.2,-78.1,-1.8C-77.3,-15.8,-68.2,-29.1,-56.9,-38.1C-45.7,-47,-32.2,-51.6,-20.1,-58.2C-8,-64.7,2.6,-73.3,13.1,-72.5C23.5,-71.7,33.7,-61.5,29.3,-48.1Z",
  "M44.2,-72.5C55.3,-61.7,61.3,-46.2,67.7,-31.3C74.1,-16.4,80.9,-2,79.5,11.6C78.1,25.2,68.5,38,57,47.8C45.5,57.6,32.2,64.4,17.8,69.2C3.3,74,-12.3,76.8,-25.7,72.3C-39.1,67.8,-50.3,56,-60,43C-69.8,30.1,-78,16,-79.7,0.6C-81.3,-14.7,-76.4,-31.1,-66.2,-42.8C-56.1,-54.5,-40.6,-61.4,-26.3,-70.6C-12,-79.8,1.2,-91.2,14.4,-90C27.5,-88.8,33.1,-83.3,44.2,-72.5Z",
  "M38.9,-66C49.2,-56.4,55.7,-43.8,62.9,-30.9C70.1,-18,77.8,-4.9,77.2,7.8C76.6,20.5,67.5,32.9,56.8,42.2C46.1,51.5,33.7,57.8,20.5,62.4C7.4,67.1,-6.5,70.2,-20.4,68.9C-34.3,67.6,-48.3,61.8,-56.4,51.1C-64.5,40.3,-66.7,24.7,-69.9,8.8C-73.2,-7.1,-77.5,-23.3,-72.3,-36C-67.1,-48.8,-52.4,-58.1,-38,-65.8C-23.6,-73.5,-9.4,-79.5,3.1,-84.5C15.5,-89.4,28.6,-75.6,38.9,-66Z",
  "M42.7,-73.1C53.1,-63.5,57.8,-47.7,64.8,-33.1C71.7,-18.5,80.8,-5.1,81.1,8.9C81.4,23,72.9,37.7,61.3,47.5C49.8,57.3,35.2,62.3,20.8,66.6C6.3,70.9,-8,74.6,-22.3,72.4C-36.7,70.3,-51,62.3,-60,50.2C-68.9,38,-72.5,21.7,-72.8,5.6C-73.2,-10.5,-70.3,-26.3,-62.1,-38.1C-53.9,-49.9,-40.5,-57.6,-27.5,-66C-14.4,-74.4,-1.8,-83.5,10.2,-83.2C22.2,-82.8,32.4,-82.7,42.7,-73.1Z"
];

// ── CSS keyframes (injected once) ─────────────────────────────────
const TOTAL_DURATION = 56;
const blobKeyframes = blobs
  .map(
    (d, i) => `${((i / blobs.length) * 100).toFixed(2)}% { d: path("${d}"); }`
  )
  .concat([`100% { d: path("${blobs[0]}"); }`])
  .join("\n  ");

const STYLE_ID = "logoblob-keyframes";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes blob-morph {
      ${blobKeyframes}
    }
    @keyframes blob-color {
      0%, 100% { fill: #7c3aed; stroke: #ff008a; }
      25% { fill: #ff008a; stroke: #7c3aed; }
      50% { fill: #7c3aed; stroke: #00ffff; }
      75% { fill: #ff008a; stroke: #ff008a; }
    }
    @keyframes blob-opacity {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.28; }
    }
  `;
  document.head.appendChild(style);
}

const BLOB_BOX_SHADOW = [
  "0 0 30px rgba(124, 58, 237, 0.6)",
  "0 0 20px rgba(124, 58, 237, 0.7)",
  "0 0 12px rgba(255, 0, 138, 0.6)",
  "0 0 8px rgba(255, 0, 138, 0.7)",
  "0 0 25px rgba(0, 255, 255, 0.4)",
  "0 0 15px rgba(0, 255, 255, 0.3)"
].join(", ");

// ── Sonic Signature Synthesizer ───────────────────────────────────
// Generates a short brand jingle using Web Audio API oscillators.
// Returns an AnalyserNode for real-time frequency visualization.

function playSonicSignature(): {
  analyser: AnalyserNode;
  ctx: AudioContext;
} | null {
  if (typeof window === "undefined" || !window.AudioContext) return null;

  const ctx = new AudioContext();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.8;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.25, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.8);
  masterGain.connect(analyser);
  analyser.connect(ctx.destination);

  // Convolver for space (simple reverb via feedback delay)
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.12;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.3;
  const wetGain = ctx.createGain();
  wetGain.gain.value = 0.4;
  masterGain.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wetGain);
  wetGain.connect(analyser);

  // Beeper sonic signature: ascending arpeggio with detuned unison
  // C4 → E4 → G4 → C5 → E5 (bright major arpeggio)
  const notes = [
    { freq: 261.63, time: 0.0, dur: 0.6 }, // C4
    { freq: 329.63, time: 0.15, dur: 0.5 }, // E4
    { freq: 392.0, time: 0.3, dur: 0.5 }, // G4
    { freq: 523.25, time: 0.5, dur: 0.7 }, // C5
    { freq: 659.25, time: 0.7, dur: 0.9 } // E5 (ring out)
  ];

  notes.forEach(({ freq, time, dur }) => {
    const t = ctx.currentTime + time;

    // Main oscillator (saw for that synth character)
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, t);

    // Detuned unison oscillator (±7 cents for width)
    const osc2 = ctx.createOscillator();
    osc2.type = "sawtooth";
    osc2.frequency.setValueAtTime(freq * Math.pow(2, 7 / 1200), t);

    // Sub oscillator (sine, one octave down)
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(freq / 2, t);

    // Per-note envelope
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.3, t + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, t + dur);

    // Filter sweep per note
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(freq * 4, t);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, t + dur);
    filter.Q.value = 2;

    osc.connect(filter);
    osc2.connect(filter);
    sub.connect(env);
    filter.connect(env);
    env.connect(masterGain);

    osc.start(t);
    osc.stop(t + dur + 0.1);
    osc2.start(t);
    osc2.stop(t + dur + 0.1);
    sub.start(t);
    sub.stop(t + dur + 0.1);
  });

  return { analyser, ctx };
}

// ── Reactive Blob SVG ─────────────────────────────────────────────

const ReactiveBlobSvg = ({
  filterId,
  energy,
  bass,
  onClick
}: {
  filterId: string;
  energy: number; // 0..1 overall amplitude
  bass: number; // 0..1 low-frequency energy
  onClick?: () => void;
}) => {
  // Energy drives: scale, blur, glow intensity, stroke width
  const scale = 1 + energy * 0.35;
  const blurAmount = 3 + energy * 8;
  const strokeWidth = 10 + bass * 15;
  const glowOpacity = 0.4 + energy * 0.5;

  return (
    <svg
      style={{
        position: "relative",
        display: "block",
        transform: `scale(${scale})`,
        transition: "transform 0.06s ease-out"
      }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      height="220px"
      width="220px"
      onClick={onClick}
      className={onClick ? "pointer-events-auto" : undefined}
    >
      <defs>
        <filter id={filterId}>
          <feGaussianBlur stdDeviation={blurAmount} />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`} transform="translate(100 100)">
        <path
          stroke="#ff008a"
          strokeWidth={strokeWidth}
          fill="#7c3aed"
          d={blobs[0]}
          style={{
            opacity: glowOpacity,
            animation: `blob-morph ${TOTAL_DURATION}s ease-in-out infinite, blob-color ${TOTAL_DURATION}s ease-in-out infinite`
          }}
        />
      </g>
    </svg>
  );
};

// ── Static Blob SVG (no audio) ────────────────────────────────────

const StaticBlobSvg = ({
  filterId,
  onClick
}: {
  filterId: string;
  onClick?: () => void;
}) => (
  <svg
    style={{ position: "relative", display: "block" }}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 200"
    height="220px"
    width="220px"
    onClick={onClick}
    className={onClick ? "pointer-events-auto" : undefined}
  >
    <defs>
      <filter id={filterId}>
        <feGaussianBlur stdDeviation="3" />
      </filter>
    </defs>
    <g filter={`url(#${filterId})`} transform="translate(100 100)">
      <path
        stroke="#ff008a"
        strokeWidth="10"
        fill="#7c3aed"
        d={blobs[0]}
        style={{
          animation: `blob-morph ${TOTAL_DURATION}s ease-in-out infinite, blob-color ${TOTAL_DURATION}s ease-in-out infinite, blob-opacity ${
            TOTAL_DURATION * 0.5
          }s ease-in-out infinite`
        }}
      />
    </g>
  </svg>
);

// ── LogoBlob Component ────────────────────────────────────────────

interface LogoBlobProps {
  hasBlob?: boolean;
  isDark?: boolean;
  isAnimated?: boolean;
  showTagline?: boolean;
  animateLetters?: boolean;
  playSonic?: boolean; // Play the synthesized sonic signature on mount/click
  soundSrc?: string; // Path to an mp3/wav file to play instead of the synth jingle
}

export const LogoBlob = ({
  hasBlob,
  isDark,
  isAnimated = false,
  showTagline = false,
  animateLetters = true,
  playSonic = false,
  soundSrc
}: LogoBlobProps) => {
  const [open, toggle] = useState(false);
  const [energy, setEnergy] = useState(0);
  const [bass, setBass] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<{ analyser: AnalyserNode; ctx: AudioContext } | null>(
    null
  );
  const rafRef = useRef<number>(0);
  const logoPath = process.env.NEXT_PUBLIC_LOGO_PATH || "";

  // Frequency analysis loop
  const analyseFrame = useCallback(() => {
    if (!audioRef.current) return;
    const { analyser, ctx } = audioRef.current;

    if (ctx.state === "closed") {
      setEnergy(0);
      setBass(0);
      setIsPlaying(false);
      return;
    }

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    // Overall energy (RMS of all bins)
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    const avg = sum / data.length / 255;

    // Bass energy (first 8 bins ≈ 0-340Hz)
    let bassSum = 0;
    const bassBins = Math.min(8, data.length);
    for (let i = 0; i < bassBins; i++) bassSum += data[i];
    const bassAvg = bassSum / bassBins / 255;

    setEnergy(avg);
    setBass(bassAvg);

    rafRef.current = requestAnimationFrame(analyseFrame);
  }, []);

  const playAudioFile = useCallback(
    (src: string): { analyser: AnalyserNode; ctx: AudioContext } | null => {
      if (typeof window === "undefined" || !window.AudioContext) return null;

      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const audio = new Audio(src);
      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audio.play().catch((e) => console.warn("[LogoBlob] Audio play failed:", e));

      // Auto-cleanup when audio ends
      audio.addEventListener("ended", () => {
        cancelAnimationFrame(rafRef.current);
        setEnergy(0);
        setBass(0);
        setIsPlaying(false);
        ctx.close().catch(() => {});
        audioRef.current = null;
      });

      return { analyser, ctx };
    },
    []
  );

  const triggerSonic = useCallback(() => {
    if (isPlaying) return;

    // If soundSrc is provided, play the audio file; otherwise synthesize
    const result = soundSrc
      ? playAudioFile(soundSrc)
      : playSonicSignature();
    if (!result) return;

    audioRef.current = result;
    setIsPlaying(true);

    rafRef.current = requestAnimationFrame(analyseFrame);

    // Fallback cleanup for synthesized jingle (no "ended" event)
    if (!soundSrc) {
      setTimeout(() => {
        cancelAnimationFrame(rafRef.current);
        setEnergy(0);
        setBass(0);
        setIsPlaying(false);
        result.ctx.close().catch(() => {});
        audioRef.current = null;
      }, 2500);
    }
  }, [isPlaying, analyseFrame, soundSrc, playAudioFile]);

  // Auto-play sonic signature on mount if prop is set
  useEffect(() => {
    if (playSonic) {
      // Delay slightly to ensure user gesture context (autoplay policy)
      const id = setTimeout(triggerSonic, 500);
      return () => clearTimeout(id);
    }
  }, [playSonic]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      audioRef.current?.ctx.close().catch(() => {});
    };
  }, []);

  const handleBlobClick = () => {
    triggerSonic();
    toggle(!open);
  };

  if (isAnimated) {
    return (
      <div className="relative flex items-center justify-center">
        {/* Blob behind the logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="rounded-full animate-blob-breathe"
            style={{
              filter: `blur(${6 + energy * 10}px)`,
              transition: "filter 0.06s ease-out"
            }}
          >
            {isPlaying ? (
              <ReactiveBlobSvg
                filterId="blur-animated"
                energy={energy}
                bass={bass}
                onClick={handleBlobClick}
              />
            ) : (
              <StaticBlobSvg
                filterId="blur-animated"
                onClick={handleBlobClick}
              />
            )}
          </div>
        </div>
        {/* Logo on top */}
        <div
          className="relative z-10 w-[90%] h-auto sm:w-auto sm:h-[160px] [&_svg]:w-full [&_svg]:h-auto sm:[&_svg]:w-auto sm:[&_svg]:h-[160px]"
          style={{
            transform: `scale(${1 + energy * 0.05})`,
            transition: "transform 0.06s ease-out"
          }}
          onClick={handleBlobClick}
        >
          <AnimatedLogo showTagline={showTagline} animate={animateLetters} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="absolute -mt-[100px] sm:-mt-[200px] rounded-full animate-blob-breathe"
        style={{ boxShadow: BLOB_BOX_SHADOW }}
      >
        <StaticBlobSvg filterId="blur-default" onClick={handleBlobClick} />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="w-[90%] h-auto -mt-10 relative sm:w-auto sm:h-[160px]"
        src={logoPath}
        alt=""
        onClick={handleBlobClick}
      />
    </>
  );
};

export default LogoBlob;
