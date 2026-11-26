import React from "react";
import { AppPresenceContext, useAppPresenceQuery } from "@hooks/useAppPresence";

export const AppPresenceProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const presence = useAppPresenceQuery();
  return (
    <AppPresenceContext.Provider value={presence}>
      {children}
    </AppPresenceContext.Provider>
  );
};

export default AppPresenceProvider;
