import AgoraRTC, { IAgoraRTCClient } from "agora-rtc-react";

const createRTCClient = () => {
  let client: IAgoraRTCClient | null = null;

  return () => {
    if (!client) client = AgoraRTC.createClient({ codec: "vp8", mode: "rtc" });

    return client;
  };
};

const useRTCClient = createRTCClient();
const useRTCScreenSharingClient = createRTCClient();

export { useRTCClient, useRTCScreenSharingClient };
