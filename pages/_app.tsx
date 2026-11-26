import React, { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { AuthProvider } from "../config/auth";
import { MainMenu } from "../components/MainMenu";
import { Header } from "../components/Header";
import { ComingSoon } from "../components/ComingSoon";
import { RefCapture } from "../components/shared/RefCapture";
import { FromAppCapture } from "../components/shared/FromAppCapture";
import { AppCallout, AppPresenceProvider } from "../components/AppCallout";
import { useRouter } from "next/router";
import Head from "next/head";
import * as tracking from "../config/tracking";
import { captureUtmParams } from "../hooks/useUtmParams";

// Styles
import "../styles/globals.css";
import "swiper/swiper-bundle.min.css";
import "../styles/fonts.css";
import "../public/fonts/black-tie/black-tie.css";
import "swiper/swiper.scss";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "../components/Terms/ElectronicSignaturesModal.css";
import "../components/Terms/FinancialPrivacyModal.css";
import "./app.css";

const isDarkMode = (process.env.NEXT_PUBLIC_DARK_MODE || "false") === "true";
// Every page needs a non-empty <title>; pages that set their own override this one.
const DEFAULT_TITLE =
  process.env.NEXT_PUBLIC_PAGE_TITLE ||
  process.env.NEXT_PUBLIC_SITE_TITLE ||
  "Store";

export default function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [wholesale, setWholesale] = useState(false);
  const router = useRouter();
  const isMaint = process.env.NEXT_PUBLIC_IS_MAINT_MODE || "true";

  useEffect(() => {
    console.log("MAINT? ", isMaint);
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }
    captureUtmParams();
  }, []);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      tracking.trackPageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  if (isMaint && isMaint === "true") {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Hydrate state={pageProps.dehydratedState}>
            <Head>
              <title>{DEFAULT_TITLE}</title>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
              />
            </Head>
            <AppPresenceProvider>
              <FromAppCapture />
              <main id="main-content">
                <ComingSoon />
              </main>
            </AppPresenceProvider>
          </Hydrate>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Hydrate state={pageProps.dehydratedState}>
          <Head>
            <title>{DEFAULT_TITLE}</title>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
          </Head>
          <AppPresenceProvider>
            <FromAppCapture />
            <RefCapture />
            <div className="m-0 flex h-screen w-full flex-col overflow-visible bg-background p-0 font-body text-body-md text-foreground">
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Skip to content
              </a>
              <AppCallout variant="bar" />
              <Header darkMode={isDarkMode} />
              <MainMenu
                showMenuHeader
                onMenuItemClick={(key: string) => router.push(key)}
                customBurgerIcon={<i className="btb bt-bars" />}
                pcMenuItemClassName={"pc-menu-item"}
                pcWrapClassName={"pc-menu-wrap"}
                outterContainerId={"outter-container"}
                pageWrapId={"page-wrap"}
                animationType={"slide"}
                right={false}
              />
              <main
                id="main-content"
                tabIndex={-1}
                className="flex min-h-0 flex-1 flex-col overflow-auto focus:outline-none"
              >
                <Component {...pageProps} wholesale={wholesale} />
              </main>
            </div>
          </AppPresenceProvider>
        </Hydrate>
      </AuthProvider>
    </QueryClientProvider>
  );
}
