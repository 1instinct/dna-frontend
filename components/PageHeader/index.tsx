import React, { Fragment } from "react";
import {
  Header,
  LogoDiv,
  LogoDivMo,
  UserIconMo,
  CartMo,
  SearchMo,
  HeaderAccount,
  ArrowDown,
  ShoppingCart,
  FavoriteIcon,
  MySearchIcon
} from "./PageHeader.styles";
export interface PageHeaderProps {}
const PageHeader: React.FC<PageHeaderProps> = (props) => {
  return (
    <Fragment>
      <Header>
        <LogoDivMo>POL</LogoDivMo>
        <MySearchIcon />
        <SearchMo src={'/searchMo.png'} />
        <CartMo src={'/CARTMo.png'} />
        <UserIconMo src={'/user.png'} />
        <HeaderAccount>MyAccount</HeaderAccount>
        <ArrowDown />
        <ShoppingCart />
        <FavoriteIcon />
      </Header>
      <LogoDiv>POL</LogoDiv>
    </Fragment>
  );
};
export default PageHeader;
