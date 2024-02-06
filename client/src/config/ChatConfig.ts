import RTCConfig from "./RTCConfig";

const ChatConfig: ChatConfigType = {
  uid: RTCConfig.uid.toString(),
  appId: RTCConfig.appId,
  chatId: "238791547748353",
  token: "",
  serverUrl: RTCConfig.serverUrl,
  tokenExpiryTime: RTCConfig.tokenExpiryTime,
  isInitialized: false,
};

export type ChatConfigType = {
  uid: string;
  appId: string;
  chatId: string;
  token: string;
  serverUrl: string;
  tokenExpiryTime: number;
  isInitialized: boolean;
  username?: string;
};

export default ChatConfig;
