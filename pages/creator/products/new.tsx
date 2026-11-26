import React from "react";
import { PortalLayout } from "@components/CreatorPortal/PortalLayout";
import { ProductWizard } from "@components/CreatorPortal/ProductWizard";

const NewCreatorProduct = () => (
  <PortalLayout title="New product">
    <ProductWizard productId={null} />
  </PortalLayout>
);

export default NewCreatorProduct;
