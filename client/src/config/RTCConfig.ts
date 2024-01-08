import { EncryptionMode, UID, SDK_MODE } from "agora-rtc-react";

const RTCConfig: RTCConfigType = {
  uid: 0,
  appId: import.meta.env.VITE_AGORA_APP_ID,
  channelName: "test",
  rtcToken:
    "007eJxTYLjNVrepVLs31O/z0ezlud2n3sRvc/uaoHToElv7t9Tljf8UGMySUkwSUxJNTdLSTE2ATEtTI9MUUyMzA0tLS0MTo+SLO2enNgQyMnhU9zAxMkAgiM/CUJJaXMLAAAADriHt",
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
