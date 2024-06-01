import RTCConfig from "./RTCConfig";

const ChatConfig: ChatConfigType = {
  appId: RTCConfig.appId,
  token: "",
  serverUrl: RTCConfig.serverUrl,
  tokenExpiryTime: RTCConfig.tokenExpiryTime,
  isInitialized: false,
};

export type ChatConfigType = {
  appId: string;
  token: string;
  serverUrl: string;
  tokenExpiryTime: number;
  isInitialized: boolean;
  username?: string;
};

export default ChatConfig;
