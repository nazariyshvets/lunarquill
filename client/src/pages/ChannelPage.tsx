import { useState, useRef, useEffect } from "react";

import AgoraRTC, {
  AgoraRTCProvider,
  AgoraRTCScreenShareProvider,
} from "agora-rtc-react";
import { RtmChannel, RtmClient } from "agora-rtm-react";
import { AgoraChat } from "agora-chat";

import Loading from "../components/Loading";
import RTCManager from "../components/RTCManager";
import VirtualBackground from "../components/VirtualBackground";
import NoiseSuppression from "../components/NoiseSuppression";
import useRTC from "../hooks/useRTC";
import useRTMClient from "../hooks/useRTMClient";
import useRTMChannel from "../hooks/useRTMChannel";
import useChatConnection from "../hooks/useChatConnection";
import useRTCTokenWillExpire from "../hooks/useRTCTokenWillExpire";
import useRTMTokenExpired from "../hooks/useRTMTokenExpired";
import useChatTokenWillExpire from "../hooks/useChatTokenWillExpire";
import useAudioVolumeIndicator from "../hooks/useAudioVolumeIndicator";
import useAuthRequestConfig from "../hooks/useAuthRequestConfig";
import fetchRTCToken from "../utils/fetchRTCToken";
import fetchRTMToken from "../utils/fetchRTMToken";
import fetchChatToken from "../utils/fetchChatToken";
import RTCConfig from "../config/RTCConfig";
import RTMConfig from "../config/RTMConfig";
import ChatConfig from "../config/ChatConfig";

const ChannelPage = () => {
  const RTCClient = useRef(
    AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }),
  );
  const RTCScreenSharingClient = useRef(
    AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }),
  );
  const RTMClient = useRTMClient();
  const RTMChannel = useRTMChannel(RTMClient);
  const chatConnection = useChatConnection();
  const isRTCInitialized = useInitRTC();
  const isRTMInitialized = useInitRTM(RTMClient, RTMChannel);
  const isChatInitialized = useInitChat(chatConnection);
  const { isVirtualBgEnabled, isNoiseSuppressionEnabled } = useRTC();

  useRTCTokenWillExpire(RTCClient.current, RTCConfig.uid);
  useRTCTokenWillExpire(RTCScreenSharingClient.current, RTCConfig.uidScreen);
  useAudioVolumeIndicator(RTCClient.current);
  useRTMTokenExpired(RTMClient);
  useChatTokenWillExpire(chatConnection);

  return !isRTCInitialized || !isRTMInitialized || !isChatInitialized ? (
    <Loading />
  ) : (
    <AgoraRTCProvider client={RTCClient.current}>
      <AgoraRTCScreenShareProvider client={RTCScreenSharingClient.current}>
        <RTCManager />
        {isVirtualBgEnabled && <VirtualBackground />}
        {isNoiseSuppressionEnabled && <NoiseSuppression />}
      </AgoraRTCScreenShareProvider>
    </AgoraRTCProvider>
  );
};

const useInitRTC = () => {
  // Whether RTC is initialized
  const [isInitialized, setIsInitialized] = useState(RTCConfig.isInitialized);
  // Whether the process of initialization is happening
  const isLoadingRef = useRef(false);
  const requestConfig = useAuthRequestConfig();

  useEffect(() => {
    const init = async () => {
      if (RTCConfig.serverUrl !== "" && RTCConfig.channelName !== "") {
        isLoadingRef.current = true;

        try {
          const [rtcToken, rtcTokenScreen] = await Promise.all([
            fetchRTCToken(RTCConfig.channelName, RTCConfig.uid, requestConfig),
            fetchRTCToken(
              RTCConfig.channelName,
              RTCConfig.uidScreen,
              requestConfig,
            ),
          ]);

          RTCConfig.rtcToken = rtcToken;
          RTCConfig.rtcTokenScreen = rtcTokenScreen;
        } catch (err) {
          setIsInitialized(false);
          RTCConfig.isInitialized = false;
          isLoadingRef.current = false;
          console.log(err);
        } finally {
          setIsInitialized(true);
          RTCConfig.isInitialized = true;
          isLoadingRef.current = false;
        }
      } else {
        console.log(
          "Please make sure you specified the RTC token server URL and channel name in the configuration file",
        );
      }
    };

    if (!isInitialized && !isLoadingRef.current) {
      init();
    }
  }, [isInitialized, requestConfig]);

  return isInitialized;
};

const useInitRTM = (RTMClient: RtmClient, RTMChannel: RtmChannel) => {
  // Whether RTM is initialized
  const [isInitialized, setIsInitialized] = useState(RTMConfig.isInitialized);
  // Whether the process of initialization is happening
  const isLoadingRef = useRef(false);
  const requestConfig = useAuthRequestConfig();

  useEffect(() => {
    const init = async () => {
      if (RTMConfig.serverUrl !== "") {
        isLoadingRef.current = true;

        try {
          const uid = RTMConfig.uid;
          const token = await fetchRTMToken(uid, requestConfig);

          RTMConfig.rtmToken = token;
          await RTMClient.login({ uid, token });
          await RTMClient.addOrUpdateLocalUserAttributes({
            username: RTMConfig.username || "user",
            isCameraMuted: "false",
            isMicrophoneMuted: "false",
          });
          await RTMChannel.join();
        } catch (err) {
          setIsInitialized(false);
          RTMConfig.isInitialized = false;
          isLoadingRef.current = false;
          console.log(err);
        } finally {
          setIsInitialized(true);
          RTMConfig.isInitialized = true;
          isLoadingRef.current = false;
        }
      } else {
        console.log(
          "Please make sure you specified the RTM token server URL in the configuration file",
        );
      }
    };

    if (!isInitialized && !isLoadingRef.current) {
      init();
    }

    return () => {
      if (isInitialized) {
        RTMClient.addOrUpdateLocalUserAttributes({
          isCameraMuted: "false",
          isMicrophoneMuted: "false",
        }).catch((err) => console.log(err));
      }
    };
  }, [RTMClient, RTMChannel, requestConfig, isInitialized]);

  return isInitialized;
};

const useInitChat = (connection: AgoraChat.Connection) => {
  // Whether Chat is initialized
  const [isInitialized, setIsInitialized] = useState(ChatConfig.isInitialized);
  // Whether the process of initialization is happening
  const isLoadingRef = useRef(false);
  const requestConfig = useAuthRequestConfig();

  useEffect(() => {
    const init = async () => {
      if (ChatConfig.serverUrl !== "") {
        isLoadingRef.current = true;

        try {
          const uid = ChatConfig.uid;
          const token = await fetchChatToken(uid, requestConfig);

          ChatConfig.token = token;
          await connection.open({
            user: uid,
            agoraToken: token,
          });
        } catch (err) {
          setIsInitialized(false);
          ChatConfig.isInitialized = false;
          isLoadingRef.current = false;
          console.log(err);
        } finally {
          setIsInitialized(true);
          ChatConfig.isInitialized = true;
          isLoadingRef.current = false;
        }
      } else {
        console.log(
          "Please make sure you specified the Chat token server URL in the configuration file",
        );
      }
    };

    if (!isInitialized && !isLoadingRef.current) {
      init();
    }

    return () => {
      if (isInitialized) {
        connection.close();
      }
    };
  }, [connection, isInitialized, requestConfig]);

  return isInitialized;
};

export default ChannelPage;
