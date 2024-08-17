import React from "react";
import styled from "@emotion/styled";
import { ClassNames } from "@emotion/react";
import { LayoutProps } from "./types";
import { Footer } from "../Footer/Footer";
import columns from "../Footer/footer.json";
import { Logo } from "@components/shared/Logo";

import { Container, Content } from "./Layout.styles";

type LogoTypeFC = {
  imageFile: string;
  darkMode?: boolean;
};

export const MyLogo = ({ imageFile, darkMode }: LogoTypeFC) => <Logo />;

export const Layout: React.FC<LayoutProps> = ({
  children
}: {
  children: JSX.Element[] | JSX.Element;
}) => {
  return (
    <Container>
      <Content>
        {children}
        <ClassNames>
          {({ css, cx }) => (
            <Footer
              footerData={{
                logo: <MyLogo />,
                columns
              }}
            />
          )}
        </ClassNames>
      </Content>
    </Container>
  );
};
