import { EncryptionMode, UID, SDK_MODE } from "agora-rtc-react";

const RTCConfig: RTCConfigType = {
  uid: Math.floor(Math.random() * 1000000000).toString(),
  uidScreen: Math.floor(Math.random() * 1000000000).toString(),
  appId: import.meta.env.VITE_AGORA_APP_ID,
  channelName: "test",
  rtcToken: "",
  rtcTokenScreen: "",
  serverUrl: "http://localhost:8000",
  proxyUrl: "",
  tokenExpiryTime: 3600,
  token: "",
  encryptionMode: "aes-128-gcm2",
  salt: "",
  encryptionKey: "",
  destChannelName: "",
  destChannelToken: "",
  destUID: 2,
  secondChannel: "",
  secondChannelToken: "",
  secondChannelUID: 2,
  selectedProduct: "rtc",
  isInitialized: false,
};

export type RTCConfigType = {
  uid: UID;
  uidScreen: UID;
  appId: string;
  channelName: string;
  rtcToken: string | null;
  rtcTokenScreen: string | null;
  serverUrl: string;
  proxyUrl: string;
  tokenExpiryTime: number;
  token: string;
  encryptionMode: EncryptionMode;
  salt: string;
  encryptionKey: string;
  destUID: number;
  destChannelName: string;
  destChannelToken: string;
  secondChannel: string;
  secondChannelToken: string;
  secondChannelUID: number;
  selectedProduct: SDK_MODE;
  isInitialized: boolean;
};

export default RTCConfig;
