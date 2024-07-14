import React from "react";
import styled from "@emotion/styled";
import { InputBase } from "@material-ui/core";
import { pxPC } from "../../utilities/device-sizes";
import { Layout } from "../../components";

const Content = styled.div`
  min-height: calc(100vh - 543px);
  position: relative;
`;
const PageTitle = styled.div`
  position: absolute;
  left: ${pxPC(54)};
  top: ${pxPC(491)};
  font-size: 33px;
  line-height: 41px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  text-transform: uppercase;
  transform: rotate(-90deg);
  font-family: "Bebas Neue";
  &:after {
    position: absolute;
    content: "";
    left: 100%;
    width: ${pxPC(86)};
    height: 3px;
    background-color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
    top: 40%;
  }
`;
const InputWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${pxPC(123)};
  margin-right: ${pxPC(58)};
`;
const MyInput = styled(InputBase)`
  width: ${pxPC(312)};
  height: 24px;
  border-bottom: 2px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
`;
const MyInputLabel = styled.div`
  margin-left: ${pxPC(19)};
  font-size: 20px;
  line-height: 24px;
  height: 24px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-family: "Bebas Neue";
  text-transform: uppercase;
`;
const PageBottom = styled.div`
  display: flex;
  margin-top: ${pxPC(121)};
  margin-bottom: ${pxPC(212)};
`;
const AccountImg = styled.img`
  width: ${pxPC(262)};
  height: auto;
  margin-right: ${pxPC(114)};
  margin-left: ${pxPC(278)};
`;
const FormWrapper = styled.div`
  display: flex;
  flex: 1;
`;
const LeftCol = styled.div`
  width: ${pxPC(266)};
  display: flex;
  flex-direction: column;
  margin-right: ${pxPC(106)};
`;
const RightCol = styled.div`
  width: ${pxPC(266)};
  flex-direction: column;
`;
const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${pxPC(59)};
  height: ${pxPC(106)};
  &:last-child {
    margin-bottom: 0;
  }
`;
const FormInput = styled(InputBase)`
  font-size: 14px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  border-bottom: 1px solid #707070;
  width: 100%;
`;
const FormLabel = styled.div`
  font-size: 14px;
  line-height: 125%;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  margin-top: ${pxPC(13)};
  width: 100%;
`;
const Account = () => {
  return (
    <Layout>
      <Content>
        <PageTitle>account</PageTitle>
        <InputWrapper>
          <MyInput />
          <MyInputLabel>SEARCH orders</MyInputLabel>
        </InputWrapper>
        <PageBottom>
          <AccountImg src={"/account.png"} />
          <FormWrapper>
            <LeftCol>
              <FormItem>
                <FormInput />
                <FormLabel>
                  Look at your order history, manage your current orders, track
                  deliveries, or request a return.
                </FormLabel>
              </FormItem>
              <FormItem>
                <FormInput />
                <FormLabel>
                  Where you at? Add or edit billing and shipping addresses here.
                </FormLabel>
              </FormItem>
              <FormItem>
                <FormInput />
                <FormLabel>
                  Add or edit your e-mail address, password, and payment
                  details.
                </FormLabel>
              </FormItem>
            </LeftCol>
            <RightCol>
              <FormItem>
                <FormInput />
                <FormLabel>
                  Want it? Manifest it. This is a place for you to explore your
                  personal fashion palette. And who knows? Maybe pieces of this
                  style board will even end up in your closet.
                </FormLabel>
              </FormItem>
              <FormItem>
                <FormInput />
                <FormLabel>Get it. Add or edit payment methods here.</FormLabel>
              </FormItem>
            </RightCol>
          </FormWrapper>
        </PageBottom>
      </Content>
    </Layout>
  );
};
export default Account;
