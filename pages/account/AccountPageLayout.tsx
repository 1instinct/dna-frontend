import React from "react";
import { useRouter } from "next/router";
import { Search, Package, Palette, CreditCard, User } from "lucide-react";
import { cn } from "@lib/utils";
import { Layout } from "../../components/Layout";

const navItems = [
  { label: "Order History", href: "/account/orders", icon: Package },
  { label: "My Style", href: "/account/mystyle", icon: Palette },
  { label: "Payment Methods", href: "/account/payment", icon: CreditCard },
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
            <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-x-visible">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "flex items-center gap-2.5 whitespace-nowrap rounded-lg border-none px-4 py-2.5 text-left font-body text-sm transition-colors",
                      "cursor-pointer outline-none",
                      isActive
                        ? "bg-brand/10 font-semibold text-brand"
                        : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </Layout>
  );
};
export default AccountPageLayout;
