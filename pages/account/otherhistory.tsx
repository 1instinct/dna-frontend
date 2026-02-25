import React, { Fragment } from "react";
import { Button } from "@components/ui";
import AccountPageLayout from "./AccountPageLayout";
import data from "./otherhistory.json";

const OtherHistory = () => {
  return (
    <AccountPageLayout>
      <div className="overflow-hidden rounded-xl border border-border/30 bg-card shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 border-b-2 border-border/30 bg-muted/50 px-5 py-3 font-title text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <div>Order Date</div>
          <div>Order Number</div>
          <div>Status</div>
          <div>Tracking Number</div>
          <div className="w-32"></div>
        </div>

        {/* Table Rows */}
        {data.tableData.map((item: any, index: number) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-border/20 px-5 py-3.5 font-body text-sm text-foreground transition-colors last:border-b-0 hover:bg-muted/30"
          >
            <div>{item.orderDate}</div>
            <div className="font-mono font-semibold">{item.orderNumber}</div>
            <div>{item.status}</div>
            <div className="font-mono">{item.trackingNumber}</div>
            <div className="w-32">
              <Button variant="outline" size="sm" className="w-full uppercase">
                View Order
              </Button>
            </div>
          </div>
        ))}
      </div>
    </AccountPageLayout>
  );
};
export default OtherHistory;
