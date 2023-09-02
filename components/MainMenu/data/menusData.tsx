import AccessAlarmIcon from "@material-ui/icons/AccessAlarm";
import AssignmentIcon from "@material-ui/icons/Assignment";
import LaptopMacIcon from "@material-ui/icons/LaptopMac";
import { menuDataItem } from "../types";
import styled from "@emotion/styled";
export const NewDigWrap = styled.div`
  display: flex;
  background-color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.black.primary
      : p.theme.colors.white.primary};
  padding-top: 23px;
  padding-bottom: 23px;
  transform: translate3d(0px, 0px, 100px);
  justify-content: center;
  align-items: flex-start;
`;
export const Column = styled.div`
  margin-right: 98px;
  display: flex;
  flex-direction: column;
  &:first-of-type {
    margin-left: 99px;
  }
  &:last-child {
    margin-right: 108px;
  }
`;
export const ColumnItem = styled.div`
  font-family: Roboto Condensed;
  font-size: 14px;
  line-height: 16px;
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  text-transform: capitalize;
  margin-bottom: 5px;
  cursor: pointer;
`;
export const Divider = styled.div`
  width: 1px;
  height: 262px;
  background-color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;
export const ImgWrapper = styled.div`
  margin-left: 116px;
  width: 296px;
`;
export const ColumnTitle = styled.div`
  font-family: "Roboto CondensedBold";
  font-size: 14px;
  line-height: 16px;
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  text-transform: uppercase;
  margin-bottom: 15px;
`;
export const ImageTitle = styled.div`
  font-size: 14px;
  line-height: 16px;
  font-family: "Roboto CondensedBold";
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  text-transform: uppercase;
`;
export const ImageInnerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
`;
export const MyImage = styled.img`
  width: 144px;
  height: auto;
`;
const NewDigs = () => {
  return (
    <NewDigWrap>
      <Column>
        <ColumnTitle>Categories</ColumnTitle>
        <ColumnItem>All Clothing</ColumnItem>
        <ColumnItem>Dresses</ColumnItem>
        <ColumnItem>Tops</ColumnItem>
        <ColumnItem>Pants</ColumnItem>
        <ColumnItem>Skirts</ColumnItem>
        <ColumnItem>Sweaters</ColumnItem>
        <ColumnItem>Denim</ColumnItem>
      </Column>
      <Column>
        <ColumnTitle>collections</ColumnTitle>
        <ColumnItem>Summer ‘21</ColumnItem>
        <ColumnItem>by POL</ColumnItem>
        <ColumnItem>Plus</ColumnItem>
        <ColumnItem>Denim</ColumnItem>
        <ColumnItem>POL TV</ColumnItem>
      </Column>
      <Column>
        <ColumnTitle>FEATURED</ColumnTitle>
        <ColumnItem>trend — 90s kids</ColumnItem>
        <ColumnItem>trend — dad's closet</ColumnItem>
        <ColumnItem>chill summer</ColumnItem>
        <ColumnItem>throw it back</ColumnItem>
        <ColumnItem>back to school</ColumnItem>
      </Column>
      <Column>
        <ColumnTitle>BRANDS</ColumnTitle>
        <ColumnItem>POL</ColumnItem>
        <ColumnItem>Levi</ColumnItem>
        <ColumnItem>teva</ColumnItem>
        <ColumnItem>doc marten</ColumnItem>
      </Column>
      <Divider />
      <ImgWrapper>
        <ImageTitle>On Sale</ImageTitle>
        <ImageInnerWrapper>
          <MyImage src={"/onsale2.png"} />
          <MyImage src={"/onsale1.png"} />
        </ImageInnerWrapper>
      </ImgWrapper>
    </NewDigWrap>
  );
};
export const menusData: menuDataItem[] = [
  {
    name: "HOT DIGS",
    key: "hotdigs",
    icon: () => <AccessAlarmIcon style={{ color: "#fff" }} />,
    pcIcon: () => (
      <AccessAlarmIcon style={{ color: "#fff", marginRight: "5px" }} />
    )
  },
  {
    name: "NEW DIGS",
    key: "newdigs",
    icon: () => <AssignmentIcon style={{ color: "#fff" }} />,
    pcMenuItem: <NewDigs />
  },
  {
    name: "CLOTHING",
    key: "clothing",
    children: [
      {
        name: "TOPS",
        key: "tops",
        icon: () => <LaptopMacIcon style={{ color: "#fff" }} />,
        pcIcon: () => (
          <AccessAlarmIcon style={{ color: "#000", marginRight: "5px" }} />
        )
      },
      {
        name: "BOTTOMS",
        key: "bottoms"
      },
      {
        name: "DRESSES",
        key: "dresses"
      },
      {
        name: "JACKETS",
        key: "jackets"
      },
      {
        name: "INTIMATES",
        key: "intimates"
      }
    ]
  },
  {
    name: "FRILLS",
    key: "frills",
    children: [
      {
        name: "BAGS",
        key: "bags"
      },
      {
        name: "SHADES",
        key: "shades"
      },
      {
        name: "HATS",
        key: "hats"
      },
      {
        name: "BELTS",
        key: "belts"
      },
      {
        name: "JEWELRY",
        key: "jewelry"
      }
    ]
  },
  {
    name: "PLUS",
    key: "plus"
  },
  {
    name: "BY POL",
    key: "bypol",
    children: [
      {
        name: "S/S 21",
        key: "ss21"
      },
      {
        name: "DENIM",
        key: "denim"
      },
      {
        name: "HOME",
        key: "home"
      }
    ]
  },
  {
    name: "SALE",
    key: "sale"
  },
  {
    name: "POL TV",
    key: "poltv"
  },
  {
    name: "EVENTS",
    key: "events"
  }
];
