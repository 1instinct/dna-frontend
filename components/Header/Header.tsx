import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Heart } from "lucide-react";
import { cn } from "@lib/utils";
import {
  Badge,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@components/ui";
import { HeaderProps } from "./types";
import { useAuth } from "../../config/auth";
import { useCart } from "../../hooks/useCart";
import { useFavorites } from "../../hooks/useFavorites";
import { useStore } from "../../hooks/useStore";
import SearchBar from "../SearchBar";
import { CartSidebar } from "../CartSidebar/CartSidebar";
import { SocialLinks } from "../SocialLinks";
import { Logo } from "@components/shared/Logo";

export const Header: React.FC<HeaderProps> = ({ darkMode }) => {
  const router = useRouter();
  const { pathname } = useRouter();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [cartVisible, setCartVisible] = useState(false);
  const toggleCart = () => setCartVisible((isVisible) => !isVisible);
  const isMaint = process.env.NEXT_PUBLIC_IS_MAINT_MODE || "false";
  const siteTitle = process.env.NEXT_PUBLIC_SHORT_TITLE || "DNA";

  const logoPath =
    process.env.NEXT_PUBLIC_LOGO_PATH || "images/open-graph-instinct-dna.jpg";

  // Get store logo from API if available
  const { data: storeData } = useStore();
  // Assume logo URL is in storeData.attributes.logo_url (customize if needed)
  const storeLogoUrl = storeData?.attributes?.logo_url;
  const displayLogo = storeLogoUrl || logoPath;

  const {
    data: cartData,
    isLoading: cartIsLoading,
    isError: cartHasError
  } = useCart();

  const { data: favoritesData } = useFavorites(1);

  const cartItemCount = cartData ? cartData?.data?.attributes?.item_count : 0;
  const favoritesCount = favoritesData?.meta?.total_count || 0;

  if (isMaint && isMaint === "true") {
    return null;
  }

  useEffect(() => {
    console.log(user && user.data.attributes);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      {/* Top Header */}
      <div className="relative flex flex-row items-center justify-center py-2.5 pb-3 sm:py-3">
        {/* Left Side - Social Links */}
        {!isMobile && (
          <div className="absolute left-2.5 z-[2] flex items-center justify-between sm:left-2.5">
            <SocialLinks darkMode={darkMode} />
          </div>
        )}

        {/* Center - Logo */}
        <div className="flex w-[355px] cursor-pointer items-center justify-center px-7 py-4">
          <Link
            href="/"
            className="text-sm no-underline text-foreground hover:text-brand transition-colors"
          >
            {displayLogo ? (
              <Image
                src={
                  displayLogo.startsWith("/") || displayLogo.startsWith("http")
                    ? displayLogo
                    : `/${displayLogo}`
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
          </Link>
        </div>

        {/* Right Side */}
        <div className="absolute right-2.5 z-[2] flex w-auto flex-row items-center justify-between sm:justify-end">
          {isMobile ? null : <SearchBar darkMode={darkMode} />}

          {user ? (
            <div className="mx-5 hidden flex-row items-center justify-around sm:flex">
              {/* Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="mx-2.5 flex cursor-pointer items-center justify-center font-title text-title-sm text-foreground hover:text-brand transition-colors border-none bg-transparent outline-none">
                    {user.data.attributes.email}
                    <ChevronDown className="ml-1 h-5 w-5 text-foreground hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[160px] p-5 font-title text-right"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account"
                      className={cn(
                        "cursor-pointer no-underline",
                        pathname === "/account"
                          ? "pointer-events-none text-muted-foreground"
                          : "text-foreground hover:text-brand"
                      )}
                    >
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account/favorites"
                      className={cn(
                        "cursor-pointer no-underline",
                        pathname === "/account/favorites"
                          ? "pointer-events-none text-muted-foreground"
                          : "text-foreground hover:text-brand"
                      )}
                    >
                      My Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account/orders"
                      className={cn(
                        "cursor-pointer no-underline",
                        pathname === "/account/orders"
                          ? "pointer-events-none text-muted-foreground"
                          : "text-foreground hover:text-brand"
                      )}
                    >
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account/settings"
                      className={cn(
                        "cursor-pointer no-underline",
                        pathname === "/account/settings"
                          ? "pointer-events-none text-muted-foreground"
                          : "text-foreground hover:text-brand"
                      )}
                    >
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Need Help?
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={logout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Favorites */}
              <Link
                href="/account/favorites"
                className={cn(
                  "relative no-underline transition-colors",
                  pathname === "/account/favorites"
                    ? "pointer-events-none text-muted-foreground"
                    : "text-foreground hover:text-brand"
                )}
              >
                <Heart className="mr-3 hidden h-5 w-5 sm:block" />
                {favoritesCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -right-1 -top-2 hidden h-5 min-w-[20px] items-center justify-center px-1 text-[10px] sm:flex"
                  >
                    {favoritesCount}
                  </Badge>
                )}
              </Link>
            </div>
          ) : (
            <div className="mx-5 hidden flex-row justify-around sm:flex">
              <Link
                href="/login"
                className={cn(
                  "mx-2.5 font-title text-title-md no-underline transition-colors",
                  pathname === "/login"
                    ? "pointer-events-none cursor-default text-muted-foreground"
                    : "text-foreground hover:text-brand"
                )}
              >
                LOGIN
              </Link>
              <Link
                href="/signup"
                className={cn(
                  "mx-2.5 font-title text-title-md no-underline transition-colors",
                  pathname === "/signup"
                    ? "pointer-events-none cursor-default text-muted-foreground"
                    : "text-foreground hover:text-brand"
                )}
              >
                SIGN UP
              </Link>
            </div>
          )}

          {/* Cart */}
          <div className="-mt-2.5 mr-0.5 relative text-foreground sm:-mt-2.5">
            <CartSidebar isVisible={cartVisible} toggle={toggleCart} />
            {cartItemCount > 0 && (
              <Badge className="absolute -right-2 -top-1 flex h-5 min-w-[20px] items-center justify-center px-1 text-[10px]">
                {cartItemCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
