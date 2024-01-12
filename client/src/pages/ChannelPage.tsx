import { useRef } from "react";
import AgoraRTC, {
  AgoraRTCProvider,
  AgoraRTCScreenShareProvider,
  useRTCClient,
} from "agora-rtc-react";
import RTCManager from "../components/RTCManager";

const ChannelPage = () => {
  const RTCEngine = useRTCClient(
    AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }),
  );
  const RTCScreenSharingClient = useRef(
    AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }),
  );
  RTCEngine.enableAudioVolumeIndicator();

  return (
    <AgoraRTCProvider client={RTCEngine}>
      <AgoraRTCScreenShareProvider client={RTCScreenSharingClient.current}>
        <RTCManager />
      </AgoraRTCScreenShareProvider>
    </AgoraRTCProvider>
  );
};

export default ChannelPage;
