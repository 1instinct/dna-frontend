import React from "react";
import styled from "@emotion/styled";
import { ClassNames } from "@emotion/react";
import { LayoutProps } from "./types";
import { MobileMenu, Foot } from "../../components";
import { menusData } from "../MobileMenu/data/menusData";
import { Column } from "../Foot/Foot";
const Logo = styled.div`
  width: 181px;
  height: 45px;
  font-size: 24px;
  line-height: 45px;
  border: 1px solid #969696;
  color: #fff;
  font-weight: bold;
  font-family: Montserrat;
  text-align: center;
  margin-bottom: 60px;
  @media (max-width: 375px) {
    width: 80px;
    height: 19.83px;
    font-size: 10px;
    line-height: 19.83px;
    margin-bottom: 55.07px;
  }
`;
const MyLogo: React.FC = () => <Logo>POL</Logo>;
const CameraIcon = styled.img`
  width: 11px;
  height: auto;
  margin-right: 3.88px;
  @media (max-width: 375px) {
    width: 20.71px;
    height: auto;
    margin-right: 7.76px;
  }
`;
const FacebookIcon = styled.img`
  width: 6.81px;
  height: auto;
  margin-right: 3.88px;
  @media (max-width: 375px) {
    width: 13.63px;
    height: auto;
    margin-right: 7.76px;
  }
`;
const PlayIcon = styled.img`
  width: 12.29px;
  height: auto;
  margin-right: 3.88px;
  @media (max-width: 375px) {
    width: 24.59px;
    height: auto;
    margin-right: 7.76px;
  }
`;
const CircleIcon = styled.img`
  width: 10.35px;
  height: auto;
  @media (max-width: 375px) {
    width: 20.71px;
    height: auto;
  }
`;
const iconLinks = [
  {
    icon: <CameraIcon src={"/camera.png"} />,
    url: ""
  },
  {
    icon: <FacebookIcon src={"/facebook.png"} />,
    url: ""
  },
  {
    icon: <PlayIcon src={"/play.png"} />,
    url: ""
  },
  {
    icon: <CircleIcon src={"/circle.png"} />,
    url: ""
  }
];
const columns: Column[] = [
  {
    title: "Contact Info",
    descriptions: [
      "4920 S. Soto  St.\n" + "Vernon, CA, 90058",
      "+1 (310) 715-1370",
      "ecom@polclothing.com"
    ],
    iconLinks
  },
  {
    title: "Information",
    links: [
      {
        text: "accessibility statement",
        url: ""
      },
      {
        text: "CA Privacy Right",
        url: ""
      },
      {
        text: "Prop 65",
        url: ""
      },
      {
        text: "Rewards",
        url: ""
      },
      { text: "Returns / exchanges / damages", url: "" },
      { text: "Terms of Use & Privacy Policy", url: "" },
      { text: "contact us", url: "" }
    ]
  },
  {
    title: "My Account",
    links: [
      {
        text: "Customer Info",
        url: ""
      },
      { text: "Addresses", url: "" },
      { text: "Orders", url: "" },
      { text: "My Cart", url: "" },
      { text: "WishList", url: "" }
    ]
  },
  {
    title: "About Us",
    descriptions: [
      "POL Clothing is a wholesale supplier to boutiques all over the world. POL focuses on coming together at the crossroads of fashion and business and creating styles inspired by the world around us."
    ]
  }
];
export const Container = styled.main`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: calc(100% - 235px);
`;
export const Content = styled.div`
  flex: 1;
  overflow: scroll;
`;
export const Layout: React.FC<LayoutProps> = ({
  children
}: {
  children: JSX.Element[] | JSX.Element;
}) => {
  return (
    <Container>
      <MobileMenu
        pcMenuItemClassName={"pc-menu-item"}
        outterContainerId={"outter-container"}
        pageWrapId={"page-wrap"}
        animationType={"slide"}
        menusData={menusData}
        right={false}></MobileMenu>
      <Content>
        {children}
        {/*<Footer
        showContact={true}
        showLegal={true}
        showSocial={true}
        styles={{ color: "#000", backgroundColor: "#183558", padding: "100px 0" }}
        links={[
          {
            type: "legal",
            text: "hello world",
            url: "http://localhost:3000",
            icon: () => <i className="fa fa-facebook-official icon" aria-hidden="true"></i>
          },
          {
            type: "contact",
            text: "hello world",
            url: "http://localhost:3000",
            icon: () => <i className="fa fa-facebook-official icon" aria-hidden="true"></i>
          },
          {
            type: "social",
            text: "hello world",
            url: "http://localhost:3000",
            icon: () => <i className="fa fa-facebook-official icon" aria-hidden="true"></i>
          },
          {
            type: "social",
            text: "hello world",
            url: "http://localhost:3000",
            icon: () => <i className="fa fa-facebook-official icon" aria-hidden="true"></i>
          },
          {
            type: "social",
            text: "hello world",
            url: "http://localhost:3000",
            icon: () => <i className="fa fa-facebook-official icon" aria-hidden="true"></i>
          }
        ]}
      />*/}
        <ClassNames>
          {({ css, cx }) => (
            <Foot
              classes={{
                root: css`
                  background-color: #000;
                `
              }}
              footerData={{ logo: <MyLogo />, columns, mobileIconLinks: iconLinks }}
            />
          )}
        </ClassNames>
      </Content>
    </Container>
  );
};
