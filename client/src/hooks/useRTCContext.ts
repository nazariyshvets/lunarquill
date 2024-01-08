import { useContext } from "react";
import { RTCContext } from "../pages/RTCManager";

// Custom hook to access the RTC context
export const useRTCContext = () => {
  const context = useContext(RTCContext);

  if (!context) {
    throw new Error("useRTCContext must be used within a RTCProvider");
  }

  return context;
};
