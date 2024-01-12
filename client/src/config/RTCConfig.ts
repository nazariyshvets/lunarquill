import { EncryptionMode, UID, SDK_MODE } from "agora-rtc-react";

const RTCConfig: RTCConfigType = {
  uid: Math.floor(Math.random() * 1000000000),
  appId: import.meta.env.VITE_AGORA_APP_ID,
  channelName: "test",
  rtcToken:
    "007eJxTYLiT6jLxxGaWZ11To4Pcq2skjP4/rCpoyfC6+/6ITZyqU4kCg1lSikliSqKpSVqaqQmQaWlqZJpiamRmYGlpaWhilLyEfWFqQyAjQ3IDPwMjFIL4LAwlqcUlDAwAVOMevA==",
  serverUrl: "",
  proxyUrl: "http://localhost:8000/",
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
};

export type RTCConfigType = {
  uid: UID;
  appId: string;
  channelName: string;
  rtcToken: string | null;
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
};

export default RTCConfig;
