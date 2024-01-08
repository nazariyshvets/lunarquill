import AgoraRTC, { AgoraRTCProvider, useRTCClient } from "agora-rtc-react";
import RTCManager from "./RTCManager";
import RTCConfig from "../config/RTCConfig";

const ChannelPage = () => {
  const RTCEngine = useRTCClient(
    AgoraRTC.createClient({ codec: "vp8", mode: RTCConfig.selectedProduct }),
  );

  return (
    <AgoraRTCProvider client={RTCEngine}>
      <RTCManager config={RTCConfig} />
    </AgoraRTCProvider>
  );
};

export default ChannelPage;
