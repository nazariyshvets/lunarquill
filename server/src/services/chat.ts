import { ChatTokenBuilder } from "agora-token";
import { Gaxios, GaxiosError } from "gaxios";

const APP_ID = process.env.AGORA_APP_ID!;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;
const CHAT_HOST = process.env.AGORA_CHAT_HOST;
const CHAT_ORG_NAME = process.env.AGORA_CHAT_ORG_NAME!;
const CHAT_APP_NAME = process.env.AGORA_CHAT_APP_NAME!;

const registerChatUser = async (uid: string, password: string) => {
  const appToken = generateAppChatToken(3600);

  const url = `https://${CHAT_HOST}/${CHAT_ORG_NAME}/${CHAT_APP_NAME}/users`;

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${appToken}`,
  };

  try {
    const response = await new Gaxios().request({
      method: "POST",
      url: url,
      data: { username: uid, password },
      headers: headers,
    });

    console.log("User registered successfully:", response.data);
  } catch (error) {
    console.error(
      "Error registering user:",
      error instanceof GaxiosError && error.response
        ? error.response.data
        : error instanceof Error
          ? error.message
          : String(error),
    );
  }
};

const generateAppChatToken = (expire: number) =>
  ChatTokenBuilder.buildAppToken(APP_ID, APP_CERTIFICATE, expire);

const generateChatToken = (uid: string, expire: number) =>
  ChatTokenBuilder.buildUserToken(APP_ID, APP_CERTIFICATE, uid, expire);

export { registerChatUser, generateChatToken };
