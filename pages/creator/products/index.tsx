import React from "react";
import { PortalLayout } from "@components/CreatorPortal/PortalLayout";
import { ProductTable } from "@components/CreatorPortal/ProductTable";

const CreatorProducts = () => (
  <PortalLayout title="Products">
    <ProductTable />
  </PortalLayout>
);

export default CreatorProducts;
