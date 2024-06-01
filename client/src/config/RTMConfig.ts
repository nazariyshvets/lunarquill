import RTCConfig from "./RTCConfig";

const RTMConfig: RTMConfigType = {
  appId: RTCConfig.appId,
  rtmToken: "",
  proxyUrl: RTCConfig.proxyUrl,
  serverUrl: RTCConfig.serverUrl,
  tokenExpiryTime: RTCConfig.tokenExpiryTime,
  token: "",
  encryptionMode: 7,
  salt: RTCConfig.salt,
  cipherKey: "",
  presenceTimeout: 300,
  logUpload: false,
  logLevel: "debug",
  cloudProxy: false,
  useStringUserId: true,
  isInitialized: false,
};

export type RTMConfigType = {
  appId: string;
  rtmToken: string | null;
  proxyUrl: string;
  serverUrl: string;
  tokenExpiryTime: number;
  token: string;
  encryptionMode: EncryptionMode;
  salt: string;
  cipherKey: string;
  presenceTimeout: number;
  logUpload: boolean;
  logLevel: LogLevel;
  cloudProxy: boolean;
  useStringUserId: boolean;
  isInitialized: boolean;
  username?: string;
};

type EncryptionMode = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type LogLevel = "error" | "warn" | "info" | "track" | "debug";

export default RTMConfig;
