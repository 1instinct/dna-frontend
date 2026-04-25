import React from "react";
import { Rating } from "@components/ui";
import AccountPageLayout from "./AccountPageLayout";
import data from "./mystyle.json";

const { list } = data;

const MyStyle = () => {
  return (
    <AccountPageLayout>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((item: any, index: number) => (
          <div
            key={index}
            className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border/30 bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="overflow-hidden">
              <img
                src={item.img}
                alt={item.title}
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <h3 className="font-title text-base font-semibold uppercase text-foreground">
                  {item.title}
                </h3>
                <p className="mt-0.5 font-body text-sm text-muted-foreground">
                  {item.desc}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className="h-3 w-3 rounded-full border border-border"
                    style={{ background: "#cbc8bf" }}
                  />
                  <span
                    className="h-3 w-3 rounded-full border border-border"
                    style={{ background: "#979d93" }}
                  />
                  <span
                    className="h-3 w-3 rounded-full border border-border"
                    style={{ background: "#979d93" }}
                  />
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end">
                <Rating value={item.rate} size="sm" />
                <span className="mt-1 font-title text-base font-bold text-foreground">
                  {item.price}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AccountPageLayout>
  );
};
export default MyStyle;
