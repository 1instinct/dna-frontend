import React from "react";
import { PortalLayout } from "@components/CreatorPortal/PortalLayout";
import { Overview } from "@components/CreatorPortal/Overview";

const CreatorHome = () => (
  <PortalLayout title="Overview">
    <Overview />
  </PortalLayout>
);

export default CreatorHome;
