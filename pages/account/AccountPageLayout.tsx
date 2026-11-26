import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Search, Package, Palette, CreditCard, User } from "lucide-react";
import { Library } from "lucide-react";
import { Sparkles } from "lucide-react";
import { marketplaceEnabled } from "../../lib/marketplace";
import { cn } from "@lib/utils";
import { Layout } from "../../components/Layout";
import { BadgePercent } from "lucide-react";

const navItems = [
  { label: "Order History", href: "/account/orders", icon: Package },
  { label: "Library", href: "/account/library", icon: Library },
  ...(marketplaceEnabled()
    ? [{ label: "Creator", href: "/account/creator", icon: Sparkles }]
    : []),
  { label: "My Style", href: "/account/mystyle", icon: Palette },
  { label: "Payment Methods", href: "/account/payment", icon: CreditCard },
  { label: "Affiliate", href: "/account/affiliate", icon: BadgePercent },
  { label: "Account Details", href: "/account", icon: User }
];

const AccountPageLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  return (
    <Layout>
      <div className="section-container min-h-[calc(100vh-400px)] py-10">
        <h1 className="mb-8 font-title text-3xl font-bold uppercase tracking-wider text-foreground">
          Account
        </h1>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* Sidebar */}
          <aside className="w-full shrink-0 md:w-56">
            <nav
              aria-label="Account"
              className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-x-visible"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 whitespace-nowrap rounded-lg border-none px-4 py-2.5 text-left font-body text-sm transition-colors",
                      "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isActive
                        ? "bg-brand/10 font-semibold text-brand"
                        : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Content (Layout already provides the page's <main>) */}
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </Layout>
  );
};
export default AccountPageLayout;
