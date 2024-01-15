import { useEffect } from "react";
import { IAgoraRTCClient } from "agora-rtc-react";

const useAudioVolumeIndicator = (RTCClient: IAgoraRTCClient) => {
  useEffect(() => {
    RTCClient.enableAudioVolumeIndicator();
  }, [RTCClient]);
};

export default useAudioVolumeIndicator;
