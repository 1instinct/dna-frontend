import React from "react";
import { LayoutProps } from "./types";
import { Footer } from "../Footer/Footer";
import columns from "../Footer/footer.json";
import { Logo } from "@components/shared/Logo";

export const MyLogo = () => <Logo />;

export const Layout: React.FC<LayoutProps> = ({
  children
}: {
  children: JSX.Element[] | JSX.Element;
}) => {
  return (
    <main className="flex-1 overflow-auto scrollbar-none">
      <div className="flex-1 overflow-auto">
        {children}
        <Footer
          footerData={{
            logo: <MyLogo />,
            columns
          }}
        />
      </div>
    </main>
  );
};
