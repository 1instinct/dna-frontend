import React from "react";
import { ClassNames } from "@emotion/react";
import { LayoutProps } from "./types";
import { Footer } from "../Footer/Footer";
import footer from "../../data/footer.json";

import { Container, Content, Logo } from "./Layout.styles";

type LogoTypeFC = {
  imageFile: string;
  darkMode?: boolean;
};

export const MyLogo = ({ imageFile, darkMode }: LogoTypeFC) => (
  <Logo src={imageFile} darkMode={darkMode || false} />
);

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
                logo: <MyLogo imageFile="/pol-logo.png" darkMode={true} />,
                columns: footer.columns,
              }}
            />
          )}
        </ClassNames>
      </Content>
    </Container>
  );
};
