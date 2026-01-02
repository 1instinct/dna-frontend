import React, { useEffect } from "react";
import styled from "@emotion/styled";
import { pxPC } from "@utilities/device-sizes";
import { useRouter } from "next/router";
import { Layout, Loading } from "../../components";
import { InputBase } from "@mui/material";

import {
  Content,
  PageTitle,
  InputWrapper,
  MyInput,
  MyInputLabel,
  PageBottom,
  AccountImg,
  FormWrapper,
  LeftCol,
  RightCol,
  FormItem,
  FormInput,
  FormLabel
} from "./Account.styles";

const AccountRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to orders page
    router.push("/account/orders");
  }, [router]);

  return <Loading />;
};

export const Account = () => {
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