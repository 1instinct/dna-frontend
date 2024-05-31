import React, { useState, useEffect } from "react";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { Hydrate } from "react-query/hydration";
import { ReactQueryDevtools } from "react-query/devtools";
import { AuthProvider } from "../config/auth";
import { MainMenu, Header, ComingSoon } from "../components";

import { menusData } from "../components/MainMenu/data/menusData";
import { useRouter } from "next/router";
import Head from "next/head";
import * as tracking from "../config/tracking";

import { ThemeProvider } from "@emotion/react";
import { theme } from "../styles/theme";
import { GlobalStyles } from "../styles/global-styles";

import "./app.css";
import "../styles/fonts.css";
import "../public/fonts/black-tie/black-tie.css";
import "swiper/swiper-bundle.min.css";
import "swiper/swiper.scss";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "../components/Terms/ElectronicSignaturesModal.css";
import "../components/Terms/FinancialPrivacyModal.css";

import { AppWrapper } from "./_app.styles";

export default function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [wholesale, setWholesale] = useState(true);
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

  const renderContent = (theme: any) => {
    const darkMode = theme.isDarkMode ? theme.isDarkMode : false;

    if (isMaint && isMaint === "true") {
      return <ComingSoon />;
    }

    return (
      <AppWrapper>
        <Header darkMode={darkMode} />
        <MainMenu
          showMenuHeader
          customBurgerIcon={<i className="btb bt-bars" />}
          pcMenuItemClassName={"pc-menu-item"}
          pcWrapClassName={"pc-menu-wrap"}
          outterContainerId={"outter-container"}
          pageWrapId={"page-wrap"}
          animationType={"slide"}
          menusData={menusData}
          right={false}
        />
        <Component {...pageProps} wholesale={wholesale} />
      </AppWrapper>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Hydrate state={pageProps.dehydratedState}>
          <ThemeProvider theme={theme}>
            <GlobalStyles theme={theme} />
            <Head>
              <title>{process.env.NEXT_PUBLIC_PAGE_TITLE}</title>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0, minimal-ui"
              />
            </Head>
            {renderContent(theme)}
          </ThemeProvider>
        </Hydrate>

        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
