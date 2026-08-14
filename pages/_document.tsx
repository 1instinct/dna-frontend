import Document, {
  Html,
  Main,
  NextScript,
  Head,
  DocumentContext
} from "next/document";
import uaParser from "ua-parser-js";
import {
  Context as ResponsiveContext,
  MediaQueryAllQueryable
} from "react-responsive";
import * as React from "react";
import * as tracking from "../config/tracking";
import * as constants from "../utilities/constants";

const withResponsiveContext = (App: any, req: any) => {
  const contextValue = (() => {
    if (!req) {
      // it's a static render, when no req https://github.com/vercel/next.js/issues/7791
      return;
    }
    const { device } = uaParser(req.headers["user-agent"]);
    const isMobile = device.type === "mobile";
    return { width: isMobile ? 767 : 768 };
  })();
  return (props: any) =>
    typeof window !== "undefined" ? (
      <App {...props} />
    ) : (
      ((
        <ResponsiveContext.Provider
          value={contextValue as MediaQueryAllQueryable}
        >
          <App {...props} />
        </ResponsiveContext.Provider>
      ) as React.ReactElement)
    );
};

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => withResponsiveContext(App, ctx.req)
      });

    const initialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }
  render() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://beeper.buzz";
    const siteTitle =
      process.env.NEXT_PUBLIC_PAGE_TITLE ||
      process.env.NEXT_PUBLIC_SITE_TITLE ||
      "Beeper";
    const siteDesc =
      process.env.NEXT_PUBLIC_PAGE_DESC ||
      process.env.NEXT_PUBLIC_SITE_DESC ||
      "Play With Music";
    const sitePhone = process.env.NEXT_PUBLIC_PHONE || "+1-917-300-8103";
    const ogImgPath =
      process.env.NEXT_PUBLIC_OG_IMG_PATH || "/images/beeper-og-image.png";
    const ogImgWidth = process.env.NEXT_PUBLIC_OG_IMG_WIDTH || "512";
    const ogImgHeight = process.env.NEXT_PUBLIC_OG_IMG_HEIGHT || "211";
    const twitterSlug = process.env.NEXT_PUBLIC_TWITTER_SLUG || "beeper.buzz";
    const facebookSlug = process.env.NEXT_PUBLIC_FACEBOOK_SLUG || "beeper.buzz";

    const OpenGraphObject = `
        "@context": "http://schema.org",
        "@type": "Organization",
        "url": "${siteUrl}",
        "contactPoint": [{
          "@type": "ContactPoint",
          "telephone": "${sitePhone}",
          "contactType": "General Inquiry"
        }]
      `;

    const FacebookPixelObject = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${tracking.FB_PIXEL_ID}');
        fbq('track', 'PageView');
      `;

    return (
      <Html className="dark">
        <Head>
          <meta charSet="utf-8" />
          <meta name="description" content={siteDesc} />
          <meta name="keywords" content="" />
          <meta name="robots" content="noodp" />
          <meta property="og:locale" content="en_US" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={siteTitle} />
          <meta property="og:site_name" content={siteTitle} />
          <meta property="og:description" content={siteDesc} />
          <meta property="og:url" content={siteUrl} />

          <meta property="og:image" content={`${siteUrl}${ogImgPath}`} />
          <meta property="og:image:width" content={ogImgWidth} />
          <meta property="og:image:height" content={ogImgHeight} />

          <meta
            property="article:publisher"
            content={`https://www.facebook.com/${facebookSlug}`}
          />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:description" content={siteDesc} />
          <meta name="twitter:title" content={siteTitle} />
          <meta name="twitter:site" content={siteUrl} />
          <meta name="twitter:image" content={`${siteUrl}${ogImgPath}`} />

          <meta name="twitter:creator" content={`@${twitterSlug}`} />

          <link rel="icon" href="/img/favicon.ico" />
          <link rel="canonical" href={siteUrl} />
          <link rel="pingback" href={siteUrl} />
          {/* Non-critical CSS — loaded async after first paint */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(){
                  var sheets = [
                    '//cdn-images.mailchimp.com/embedcode/classic-10_7.css',
                    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
                    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap'
                  ];
                  sheets.forEach(function(href){
                    var l = document.createElement('link');
                    l.rel = 'stylesheet';
                    l.href = href;
                    document.head.appendChild(l);
                  });
                })();
              `
            }}
          />
          <script type="application/ld+json">{OpenGraphObject}</script>
          {/* Stripe — defer until needed (checkout page loads it) */}
          <script src="https://js.stripe.com/v3/" defer></script>
          {/* Analytics — all async/defer, non-blocking */}
          <script
            async
            src={
              "https://www.googletagmanager.com/gtag/js?id=" +
              tracking.GA_TRACKING_CODE
            }
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', "${tracking.GA_TRACKING_CODE}", {
                  'send_page_view': true,
                  'page_path': window.location.pathname,
                  'debug_mode': ${tracking.GA_DEBUG_MODE},
                });
              `
            }}
          />
          {/* Google Maps — defer, only needed on address forms */}
          <script
            defer
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`}
          />
          <script dangerouslySetInnerHTML={{ __html: FacebookPixelObject }} />
          <script
            src="https://crm-api.instinct.is/js/external-tracking.js"
            data-tracking-id={process.env.NEXT_PUBLIC_GHL_TRACKING_ID}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${tracking.FB_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        </Head>
        <body>
          <style
            dangerouslySetInnerHTML={{
              __html: `
              html, body, #__next {
                min-height: 100vh;
                background: #050012;
                color: #fff;
              }
              #__next > div {
                min-height: 100vh;
              }
              /* Splash screen — LogoBlob clone, visible before React hydrates */
              #splash {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 32px;
                background: #050012;
                transition: opacity 0.6s ease-out;
              }
              #splash.hidden {
                opacity: 0;
                pointer-events: none;
              }
              #splash-blob {
                width: 260px;
                height: 260px;
                filter: blur(24px);
                animation: splash-blob-float 8s ease-in-out infinite;
              }
              #splash-blob path {
                animation:
                  splash-blob-morph 56s ease-in-out infinite,
                  splash-blob-color 12s ease-in-out infinite;
              }
              #splash .splash-title {
                font-family: 'Press Start 2P', 'IBM Plex Mono', monospace;
                font-size: 14px;
                letter-spacing: 0.3em;
                color: #ff008a;
                text-shadow:
                  0 0 20px rgba(255,0,138,0.6),
                  0 0 40px rgba(255,0,138,0.3),
                  0 0 80px rgba(124,58,237,0.2);
                animation: splash-glow 2.5s ease-in-out infinite;
                z-index: 2;
              }
              #splash .splash-sub {
                font-family: 'IBM Plex Mono', monospace;
                font-size: 9px;
                letter-spacing: 0.3em;
                text-transform: uppercase;
                color: rgba(255,255,255,0.4);
                z-index: 2;
              }
              @keyframes splash-blob-morph {
                0%    { d: path("M43.3,-69.7C51.1,-62.3,49,-41.9,53.7,-26.1C58.4,-10.4,69.9,0.6,68.8,10.1C67.8,19.6,54.4,27.5,43.4,34.4C32.4,41.2,24,46.9,14.5,50.1C5,53.4,-5.6,54,-19.9,55.4C-34.2,56.8,-52.3,58.9,-58.2,51C-64.1,43.1,-57.9,25.3,-58.1,9.7C-58.3,-6,-65,-19.4,-65,-34C-65,-48.6,-58.4,-64.5,-46.4,-70C-34.4,-75.6,-17.2,-70.8,0.3,-71.2C17.7,-71.6,35.5,-77.2,43.3,-69.7Z"); }
                12.5% { d: path("M40.8,-63.9C54.3,-54.8,67.7,-45.9,76.2,-33.1C84.6,-20.3,88.1,-3.6,82,9C75.9,21.6,60.1,30,48.3,39.5C36.4,49,28.5,59.6,18.1,63.3C7.8,67,-5,63.9,-19.6,61.8C-34.1,59.7,-50.3,58.7,-59.9,50.4C-69.5,42.1,-72.5,26.5,-73.4,11.4C-74.3,-3.7,-73.2,-18.3,-65.9,-28.3C-58.6,-38.3,-45.1,-43.8,-33.1,-53.6C-21.1,-63.4,-10.5,-77.5,1.6,-80C13.7,-82.4,27.3,-73.1,40.8,-63.9Z"); }
                25%   { d: path("M36.4,-58.3C45.7,-50.6,51,-38.1,58.4,-25.6C65.9,-13,75.5,-0.4,76.7,13.1C77.9,26.5,70.8,40.9,59.4,48.4C48.1,55.9,32.5,56.7,18.3,59.4C4.2,62.2,-8.5,67.1,-21.3,66.2C-34.1,65.3,-47.1,58.7,-58.1,48.8C-69.1,38.9,-78,25.7,-82.2,10.5C-86.5,-4.7,-85.9,-21.8,-77.9,-34C-69.8,-46.1,-54.3,-53.2,-40.1,-58.7C-25.8,-64.3,-12.9,-68.3,0.3,-68.7C13.5,-69.2,27,-66.1,36.4,-58.3Z"); }
                37.5% { d: path("M35.1,-51.8C49.7,-45.2,68.6,-42.6,72.9,-33.3C77.3,-23.9,67,-7.9,62,7.1C57,22.1,57.4,36.1,50.9,44.9C44.4,53.7,31.2,57.4,17.4,63.4C3.5,69.4,-10.9,77.7,-24.1,76.4C-37.4,75.1,-49.5,64.3,-59.3,52C-69.1,39.6,-76.6,25.9,-75.7,12.7C-74.9,-0.5,-65.7,-13.2,-58.4,-25.7C-51.2,-38.3,-45.9,-50.7,-36.5,-59.7C-27.1,-68.7,-13.5,-74.3,-1.6,-71.7C10.2,-69.1,20.5,-58.4,35.1,-51.8Z"); }
                50%   { d: path("M29.3,-48.1C38.6,-39.7,47.3,-33.3,55.5,-23.9C63.8,-14.5,71.7,-2.2,71.7,10.7C71.6,23.5,63.5,36.9,52.2,44.7C41,52.5,26.6,54.8,12.4,59.1C-1.8,63.4,-15.8,69.7,-28.5,67.2C-41.3,64.6,-52.8,53.2,-62.2,40.1C-71.7,27,-79,12.2,-78.1,-1.8C-77.3,-15.8,-68.2,-29.1,-56.9,-38.1C-45.7,-47,-32.2,-51.6,-20.1,-58.2C-8,-64.7,2.6,-73.3,13.1,-72.5C23.5,-71.7,33.7,-61.5,29.3,-48.1Z"); }
                62.5% { d: path("M44.2,-72.5C55.3,-61.7,61.3,-46.2,67.7,-31.3C74.1,-16.4,80.9,-2,79.5,11.6C78.1,25.2,68.5,38,57,47.8C45.5,57.6,32.2,64.4,17.8,69.2C3.3,74,-12.3,76.8,-25.7,72.3C-39.1,67.8,-50.3,56,-60,43C-69.8,30.1,-78,16,-79.7,0.6C-81.3,-14.7,-76.4,-31.1,-66.2,-42.8C-56.1,-54.5,-40.6,-61.4,-26.3,-70.6C-12,-79.8,1.2,-91.2,14.4,-90C27.5,-88.8,33.1,-83.3,44.2,-72.5Z"); }
                75%   { d: path("M38.9,-66C49.2,-56.4,55.7,-43.8,62.9,-30.9C70.1,-18,77.8,-4.9,77.2,7.8C76.6,20.5,67.5,32.9,56.8,42.2C46.1,51.5,33.7,57.8,20.5,62.4C7.4,67.1,-6.5,70.2,-20.4,68.9C-34.3,67.6,-48.3,61.8,-56.4,51.1C-64.5,40.3,-66.7,24.7,-69.9,8.8C-73.2,-7.1,-77.5,-23.3,-72.3,-36C-67.1,-48.8,-52.4,-58.1,-38,-65.8C-23.6,-73.5,-9.4,-79.5,3.1,-84.5C15.5,-89.4,28.6,-75.6,38.9,-66Z"); }
                87.5% { d: path("M42.7,-73.1C53.1,-63.5,57.8,-47.7,64.8,-33.1C71.7,-18.5,80.8,-5.1,81.1,8.9C81.4,23,72.9,37.7,61.3,47.5C49.8,57.3,35.2,62.3,20.8,66.6C6.3,70.9,-8,74.6,-22.3,72.4C-36.7,70.3,-51,62.3,-60,50.2C-68.9,38,-72.5,21.7,-72.8,5.6C-73.2,-10.5,-70.3,-26.3,-62.1,-38.1C-53.9,-49.9,-40.5,-57.6,-27.5,-66C-14.4,-74.4,-1.8,-83.5,10.2,-83.2C22.2,-82.8,32.4,-82.7,42.7,-73.1Z"); }
                100%  { d: path("M43.3,-69.7C51.1,-62.3,49,-41.9,53.7,-26.1C58.4,-10.4,69.9,0.6,68.8,10.1C67.8,19.6,54.4,27.5,43.4,34.4C32.4,41.2,24,46.9,14.5,50.1C5,53.4,-5.6,54,-19.9,55.4C-34.2,56.8,-52.3,58.9,-58.2,51C-64.1,43.1,-57.9,25.3,-58.1,9.7C-58.3,-6,-65,-19.4,-65,-34C-65,-48.6,-58.4,-64.5,-46.4,-70C-34.4,-75.6,-17.2,-70.8,0.3,-71.2C17.7,-71.6,35.5,-77.2,43.3,-69.7Z"); }
              }
              @keyframes splash-blob-color {
                0%, 100% { fill: #7c3aed; }
                25%      { fill: #ff008a; }
                50%      { fill: #00ffff; }
                75%      { fill: #ff008a; }
              }
              @keyframes splash-blob-float {
                0%, 100% { transform: translate(0, 0) scale(1); }
                25%      { transform: translate(8px, -12px) scale(1.04); }
                50%      { transform: translate(-6px, 8px) scale(0.98); }
                75%      { transform: translate(-10px, -4px) scale(1.02); }
              }
              @keyframes splash-glow {
                0%, 100% { text-shadow: 0 0 20px rgba(255,0,138,0.6), 0 0 40px rgba(255,0,138,0.3), 0 0 80px rgba(124,58,237,0.2); }
                50%      { text-shadow: 0 0 30px rgba(255,0,138,0.9), 0 0 60px rgba(255,0,138,0.5), 0 0 100px rgba(124,58,237,0.4); }
              }
            `
            }}
          />
          {/* Splash screen — morphing LogoBlob clone, no JS needed */}
          <div id="splash">
            <svg
              id="splash-blob"
              viewBox="-100 -100 200 200"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M43.3,-69.7C51.1,-62.3,49,-41.9,53.7,-26.1C58.4,-10.4,69.9,0.6,68.8,10.1C67.8,19.6,54.4,27.5,43.4,34.4C32.4,41.2,24,46.9,14.5,50.1C5,53.4,-5.6,54,-19.9,55.4C-34.2,56.8,-52.3,58.9,-58.2,51C-64.1,43.1,-57.9,25.3,-58.1,9.7C-58.3,-6,-65,-19.4,-65,-34C-65,-48.6,-58.4,-64.5,-46.4,-70C-34.4,-75.6,-17.2,-70.8,0.3,-71.2C17.7,-71.6,35.5,-77.2,43.3,-69.7Z" />
            </svg>
            <div className="splash-title">BEEPER</div>
            <div className="splash-sub">play with music</div>
          </div>
          <script
            dangerouslySetInnerHTML={{
              __html: `
            // Hide splash once React mounts
            if (typeof window !== 'undefined') {
              window.addEventListener('load', function() {
                setTimeout(function() {
                  var s = document.getElementById('splash');
                  if (s) { s.classList.add('hidden'); setTimeout(function() { s.remove(); }, 600); }
                }, 300);
              });
            }
          `
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
export default MyDocument;
