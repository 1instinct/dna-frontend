import React, { useEffect, useState, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import { useRouter } from "next/router";
import Image from "next/image";
import { Badge } from "@material-ui/core";
import Sticky from "react-sticky-el";
import { HeaderProps } from "./types";
import { useAuth } from "../../config/auth";
import { useCart } from "../../hooks/useCart";
import { useFavorites } from "../../hooks/useFavorites";
import SearchBar from "../SearchBar";
import { CartSidebar } from "../CartSidebar/CartSidebar";
import { SocialLinks } from "..";

import {
  TopHeader,
  LeftSide,
  RightSide,
  LogoDiv,
  HeaderDiv,
  LinkDiv,
  // BottomHeader,
  // Category,
  // UserIconMo,
  // CartMo,
  CartToggle,
  HeaderAccount,
  HeaderOptions,
  ArrowDown,
  ShoppingCart,
  FavoriteIcon,
  AccountEmail,
  AccountMenu,
  AccountOption
} from "./Header.styles";
import { Logo } from "@components/shared/Logo";

export const Header: React.FC<HeaderProps> = ({ darkMode }) => {
  const router = useRouter();
  const { pathname } = useRouter();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [cartVisible, setCartVisible] = useState(false);
  const [accountVisible, setAccountVisible] = useState(false);
  const [accountElem, setAccountElem] = useState(null);
  const accountRef = useRef(null);
  const accountOpen = Boolean(accountElem);
  const accountId = accountVisible ? "simple-popover" : undefined;
  const toggleCart = () => setCartVisible((isVisible) => !isVisible);
  const toggleAccount = () => setAccountVisible((isVisible) => !isVisible);
  const isMaint = process.env.NEXT_PUBLIC_IS_MAINT_MODE || "false";
  const siteTitle = process.env.NEXT_PUBLIC_SHORT_TITLE || "DNA";

  const logoPath =
    process.env.NEXT_PUBLIC_LOGO_PATH || "images/open-graph-instinct-dna.jpg";

  const {
    data: cartData,
    isLoading: cartIsLoading,
    isError: cartHasError
  } = useCart();

  const { data: favoritesData } = useFavorites(1);

  const handleAccount = (event: any) => {
    setAccountElem(event.currentTarget);
  };

  const handleCloseAccount = () => {
    setAccountElem(null);
  };

  if (isMaint && isMaint === "true") {
    return null;
  }

  useEffect(() => {
    console.log(user && user.data.attributes);
  }, []);

  return (
    <HeaderDiv>
      <TopHeader>
        {!isMobile && (
          <LeftSide>
            <SocialLinks darkMode={darkMode} />
          </LeftSide>
        )}
        <LogoDiv>
          <LinkDiv isActive href="/">
            {logoPath ? (
              <Image
                src={
                  logoPath.startsWith("/") || logoPath.startsWith("http")
                    ? logoPath
                    : `/${logoPath}`
                }
                alt={siteTitle}
                width={0}
                height={0}
                sizes="(max-width: 768px) 100px, 141px"
                style={{ width: "auto", height: "65px" }}
                priority
              />
            ) : (
              <Logo />
            )}
          </LinkDiv>
        </LogoDiv>
        <RightSide>
          {isMobile ? null : <SearchBar darkMode={darkMode} />}
          {user ? (
            <HeaderAccount>
              <AccountEmail
                aria-describedby={accountId}
                onClick={handleAccount}
              >
                {user.data.attributes.email}
                <ArrowDown />
              </AccountEmail>
              <AccountMenu
                open={accountOpen}
                anchorEl={accountElem}
                onClose={handleCloseAccount}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center"
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center"
                }}
              >
                <LinkDiv href="/account" isActive={pathname !== "/account"}>
                  <AccountOption>
                    <div>My Account</div>
                  </AccountOption>
                </LinkDiv>

                <LinkDiv
                  href="/account/favorites"
                  isActive={pathname !== "/account/favorites"}
                >
                  <AccountOption>
                    <div>My Favorites</div>
                  </AccountOption>
                </LinkDiv>

                <LinkDiv
                  href="/account/orders"
                  isActive={pathname !== "/account/orders"}
                >
                  <AccountOption>
                    <div>My Orders</div>
                  </AccountOption>
                </LinkDiv>
                <LinkDiv
                  href="/account/settings"
                  isActive={pathname !== "/account/settings"}
                >
                  <AccountOption>
                    <div>Account Settings</div>
                  </AccountOption>
                </LinkDiv>
                <AccountOption>
                  <div>Need Help?</div>
                </AccountOption>
                <hr />
                <AccountOption>
                  <div onClick={logout}>Logout</div>
                </AccountOption>
              </AccountMenu>
              <LinkDiv
                href="/account/favorites"
                isActive={pathname !== "/account/favorites"}
              >
                <Badge
                  badgeContent={favoritesData?.meta?.total_count || 0}
                  color="secondary"
                  overlap="rectangular"
                >
                  <FavoriteIcon />
                </Badge>
              </LinkDiv>
            </HeaderAccount>
          ) : (
            <HeaderOptions>
              <LinkDiv href="/login" isActive={pathname !== "/login"}>
                LOGIN
              </LinkDiv>
              <LinkDiv href="/signup" isActive={pathname !== "/signup"}>
                SIGN UP
              </LinkDiv>
            </HeaderOptions>
          )}
          <CartToggle>
            <Badge
              badgeContent={
                cartData ? cartData?.data?.attributes?.item_count : 0
              }
              color="primary"
              overlap="rectangular"
            >
              <CartSidebar isVisible={cartVisible} toggle={toggleCart} />
            </Badge>
          </CartToggle>
        </RightSide>
      </TopHeader>
    </HeaderDiv>
  );
};
