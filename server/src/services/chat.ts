import { ChatTokenBuilder } from "agora-token";

const APP_ID = process.env.AGORA_APP_ID!;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;

const generateChatToken = (uid: string, expire: number) =>
  ChatTokenBuilder.buildUserToken(APP_ID, APP_CERTIFICATE, uid, expire);

export { generateChatToken };
