"use client";

import { createContext, useContext } from "react";

interface InviteCountContextValue {
  count: number;
  refresh: () => void;
}

const InviteCountContext = createContext<InviteCountContextValue>({
  count: 0,
  refresh: () => {},
});

export function useInviteCount() {
  return useContext(InviteCountContext);
}

export default InviteCountContext;
