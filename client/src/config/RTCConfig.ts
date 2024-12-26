import { EncryptionMode, UID, SDK_MODE } from "agora-rtc-react";
import { nanoid } from "@reduxjs/toolkit";

const RTCConfig: RTCConfigType = {
  uidScreen: nanoid(),
  appId: import.meta.env.VITE_AGORA_APP_ID,
  rtcToken: "",
  rtcTokenScreen: "",
  serverUrl: import.meta.env.VITE_BASE_SERVER_URL,
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
  uidScreen: UID;
  appId: string;
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
