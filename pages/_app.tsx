import React, { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { AuthProvider } from "../config/auth";
import { MainMenu } from "../components/MainMenu";
import { Header } from "../components/Header";
import { ComingSoon } from "../components/ComingSoon";
import { useRouter } from "next/router";
import Head from "next/head";
import * as tracking from "../config/tracking";

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
              <title>{process.env.NEXT_PUBLIC_PAGE_TITLE}</title>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0, minimal-ui"
              />
            </Head>
            <ComingSoon />
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
            <title>{process.env.NEXT_PUBLIC_PAGE_TITLE}</title>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0, minimal-ui"
            />
          </Head>
          <div className="m-0 flex h-screen w-full flex-col overflow-visible bg-background p-0 font-body text-body-md text-foreground">
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
            <Component {...pageProps} wholesale={wholesale} />
          </div>
        </Hydrate>
      </AuthProvider>
    </QueryClientProvider>
  );
}
