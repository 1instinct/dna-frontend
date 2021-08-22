import * as React from "react";
import type { AppProps /*, AppContext */ } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { Hydrate } from "react-query/hydration";
import { ReactQueryDevtools } from "react-query/devtools";
import { AuthProvider } from "../config/auth";
import { MainMenu } from "../components";
import PageHeader from "../components/PageHeader";
import styled from "@emotion/styled";
import "swiper/swiper-bundle.min.css";
import { menusData } from "../components/MainMenu/data/menusData";
import "./app.css";
import { Header } from "../components";

// Styles
import { ThemeProvider } from "@emotion/react";
import { theme } from "../styles/theme";
import { GlobalStyles } from "../styles/global-styles";
import { pxIphone } from "../utils";
import "../styles/fonts.css";
import "./app.css";

const queryClient = new QueryClient();
const CustomIcon = styled.img`
  width: ${pxIphone(37)};
  height: auto;
`;
export default function MyApp({ Component, pageProps }: AppProps) {
  React.useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Hydrate state={pageProps.dehydratedState}>
          <ThemeProvider theme={theme}>
            <GlobalStyles />
            <PageHeader />
            <MainMenu
              showMenuHeader={true}
              customBurgerIcon={<CustomIcon src={"/BURGER.png"} />}
              pcMenuItemClassName={"pc-menu-item"}
              pcWrapClassName={"pc-menu-wrap"}
              outterContainerId={"outter-container"}
              pageWrapId={"page-wrap"}
              animationType={"slide"}
              menusData={menusData}
              right={false}></MainMenu>
            <Component {...pageProps} />
          </ThemeProvider>
        </Hydrate>
      </AuthProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
