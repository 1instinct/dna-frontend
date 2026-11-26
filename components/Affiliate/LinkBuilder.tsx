import React, { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { cn } from "@lib/utils";
import { buildAffiliateLink, linkOrigin } from "@lib/affiliate/link";
import { Panel, ghostBtn, hintClass, labelClass } from "./ui";

type QrMatrix = { size: number; path: string };

/** QR modules as one SVG path (qrcode-generator, loaded only here). */
const useQr = (text: string | null): QrMatrix | null => {
  const [qr, setQr] = useState<QrMatrix | null>(null);
  useEffect(() => {
    let live = true;
    if (!text) {
      setQr(null);
      return;
    }
    import("qrcode-generator")
      .then((mod) => {
        const qrcode = mod.default;
        const q = qrcode(0, "M");
        q.addData(text);
        q.make();
        const size = q.getModuleCount();
        let path = "";
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (q.isDark(r, c)) path += `M${c} ${r}h1v1h-1z`;
          }
        }
        if (live) setQr({ size, path });
      })
      .catch(() => live && setQr(null));
    return () => {
      live = false;
    };
  }, [text]);
  return qr;
};

const svgMarkup = (qr: QrMatrix) => {
  const q = 4; // quiet zone, in modules
  const s = qr.size + q * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${
    s * 8
  }" height="${
    s * 8
  }" shape-rendering="crispEdges"><rect width="${s}" height="${s}" fill="#fff"/><path transform="translate(${q} ${q})" d="${
    qr.path
  }" fill="#000"/></svg>`;
};

export const LinkBuilder: React.FC<{ code: string; link?: string }> = ({
  code,
  link
}) => {
  const [page, setPage] = useState("");
  const [copied, setCopied] = useState(false);
  const origin = linkOrigin(
    link,
    typeof window !== "undefined" ? window.location.origin : ""
  );
  const host = origin.replace(/^https?:\/\//, "");
  const built = useMemo(
    () => (origin ? buildAffiliateLink(origin, page, code) : null),
    [origin, page, code]
  );
  const qr = useQr(built);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    if (!built) return;
    try {
      await navigator.clipboard.writeText(built);
      setCopied(true);
    } catch {
      // Clipboard blocked: select the text so it can be copied by hand.
      const el = document.getElementById("aff-link-out");
      const sel = window.getSelection();
      if (el && sel) {
        const range = document.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  };

  const download = () => {
    if (!qr) return;
    const blob = new Blob([svgMarkup(qr)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `affiliate-${code}-qr.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <Panel title="Your link" id="aff-link">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <label htmlFor="aff-page" className={labelClass}>
            Link to any page
          </label>
          <div className="flex items-stretch overflow-hidden rounded-md border border-border/30 bg-muted/50 focus-within:border-brand">
            <span className="flex select-none items-center whitespace-nowrap border-r border-border/30 px-2.5 font-body text-[13px] text-foreground/55">
              {host}/
            </span>
            <input
              id="aff-page"
              value={page}
              onChange={(e) => setPage(e.target.value)}
              placeholder="browse"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-body text-[16px] leading-5 text-foreground placeholder:text-foreground/45 focus:outline-none"
            />
          </div>
          <p className={cn(hintClass, !built && page && "text-amber-700")}>
            {built || !page
              ? "Paste a product or page address, or leave it blank for the home page."
              : `Only ${host} pages can carry your code.`}
          </p>

          <div className="mt-4 rounded-md border border-brand/30 bg-muted p-3">
            <output
              id="aff-link-out"
              htmlFor="aff-page"
              className="block break-all font-body text-[14px] leading-5 text-brand"
            >
              {built || "—"}
            </output>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              disabled={!built}
              className={ghostBtn}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden />
              )}
              {copied ? "Copied" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={download}
              disabled={!qr}
              className={ghostBtn}
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              Download QR code
            </button>
            <span className="sr-only" aria-live="polite">
              {copied ? "Link copied" : ""}
            </span>
          </div>
        </div>

        <figure className="m-0 shrink-0 self-center sm:self-start">
          <div className="h-[132px] w-[132px] rounded-md bg-white p-2">
            {qr ? (
              <svg
                viewBox={`0 0 ${qr.size} ${qr.size}`}
                className="h-full w-full"
                shapeRendering="crispEdges"
                role="img"
                aria-label={`QR code for ${built}`}
              >
                <path d={qr.path} fill="#000000" />
              </svg>
            ) : (
              <div className="h-full w-full animate-pulse rounded-sm bg-muted" />
            )}
          </div>
          <figcaption className="mt-1.5 text-center font-body text-[11px] text-foreground/55">
            Scans to this link
          </figcaption>
        </figure>
      </div>
    </Panel>
  );
};

export default LinkBuilder;
