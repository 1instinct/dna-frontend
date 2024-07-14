import React, { Fragment } from "react";
import styled from "@emotion/styled";
import { ButtonBase } from "@material-ui/core";
import { pxPC } from "../../utilities/device-sizes";
import AccountPageLayout from "./AccountPageLayout";
import data from "./otherhistory.json";
const MyTable = styled.div`
  width: ${pxPC(1086)};
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr ${pxPC(214)};
  grid-template-rows: ${pxPC(21)};
  align-items: stretch;
  grid-auto-rows: ${pxPC(60)};
`;
const MyTableTitle = styled.div`
  font-size: 14px;
  line-height: 150%;
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-family: "Bebas Neue";
  text-transform: uppercase;
  border-bottom: 2px solid #000;
  align-self: start;
  height: ${pxPC(21)};
`;
const MyTableItem = styled.div`
  font-family: Roboto Condensed;
  font-size: 14px;
  line-height: 125%;
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  border-bottom: 2px solid #000;
  text-align: left;
  display: flex;
  align-items: center;
`;
const MyButton = styled(ButtonBase)`
  width: ${pxPC(214)};
  height: ${pxPC(33)};
  border: 1px solid #000 !important;
  line-height: ${pxPC(33)};
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-size: 20px;
  font-family: "Bebas Neue";
  text-transform: uppercase;
`;
const OtherHistory = () => {
  return (
    <AccountPageLayout>
      <MyTable>
        <MyTableTitle>order date</MyTableTitle>
        <MyTableTitle>order number</MyTableTitle>
        <MyTableTitle>status</MyTableTitle>
        <MyTableTitle>tracking number</MyTableTitle>
        <MyTableTitle></MyTableTitle>
        {data.tableData.map((item, index) => (
          <Fragment key={index}>
            <MyTableItem>{item.orderDate}</MyTableItem>
            <MyTableItem>{item.orderNumber}</MyTableItem>
            <MyTableItem>{item.status}</MyTableItem>
            <MyTableItem>{item.trackingNumber}</MyTableItem>
            <MyTableItem>
              <MyButton>view order</MyButton>
            </MyTableItem>
          </Fragment>
        ))}
      </MyTable>
    </AccountPageLayout>
  );
};
export default OtherHistory;
