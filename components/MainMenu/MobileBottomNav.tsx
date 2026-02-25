import React from "react";
import { useRouter } from "next/router";
import { Home, Search, ShoppingCart, User, Grid } from "lucide-react";
import { cn } from "@lib/utils";
import { Dock, DockIcon } from "@components/ui";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Grid, label: "Browse", href: "/browse" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: ShoppingCart, label: "Cart", href: "/cart" },
  { icon: User, label: "Account", href: "/account" }
];

export const MobileBottomNav = () => {
  const router = useRouter();
  const { pathname } = router;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
      <Dock
        direction="bottom"
        iconSize={28}
        iconMagnification={40}
        disableMagnification
        className="mx-auto mb-2 h-14 w-[calc(100%-2rem)] gap-1 rounded-2xl border border-border/50 bg-background/90 backdrop-blur-md"
      >
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href;
          return (
            <DockIcon
              key={href}
              className={cn(
                "transition-colors",
                isActive ? "text-brand" : "text-muted-foreground"
              )}
              onClick={() => router.push(href)}
            >
              <div className="flex flex-col items-center gap-0.5">
                <Icon className="h-5 w-5" />
                <span className="text-[9px] font-medium leading-none">
                  {label}
                </span>
              </div>
            </DockIcon>
          );
        })}
      </Dock>
    </div>
  );
};
