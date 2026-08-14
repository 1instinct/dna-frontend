import React from "react";
import { LayoutProps } from "./types";
import { Footer } from "../Footer/Footer";
import columns from "../Footer/footer.json";
import { Logo } from "@components/shared/Logo";

export const MyLogo = () => <Logo />;

export const Layout: React.FC<LayoutProps> = ({
  children,
  background
}: {
  children: JSX.Element[] | JSX.Element;
  background?: React.ReactNode;
}) => {
  return (
    <>
      {background}
      <main className="flex-1">
        {children}
        <Footer
          footerData={{
            logo: <MyLogo />,
            columns
          }}
        />
      </main>
    </>
  );
};
