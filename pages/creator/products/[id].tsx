import React from "react";
import { useRouter } from "next/router";
import { PortalLayout } from "@components/CreatorPortal/PortalLayout";
import { ProductWizard } from "@components/CreatorPortal/ProductWizard";
import { Skeleton } from "@components/ui";
import { ErrorNote } from "@components/CreatorPortal/kit";

const EditCreatorProduct = () => {
  const router = useRouter();
  const raw = router.query.id;
  const id = typeof raw === "string" && /^\d+$/.test(raw) ? Number(raw) : null;

  return (
    <PortalLayout title="Edit product">
      {!router.isReady ? (
        <Skeleton className="h-96" />
      ) : id ? (
        <ProductWizard productId={id} />
      ) : (
        <ErrorNote error="not found" fallback="That product doesn't exist." />
      )}
    </PortalLayout>
  );
};

export default EditCreatorProduct;
