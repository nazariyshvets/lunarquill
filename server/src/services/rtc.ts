import { RtcTokenBuilder, RtcRole } from "agora-access-token";

const APP_ID = process.env.AGORA_APP_ID!;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;

const generateRTCToken = (
  channel: string,
  role: string,
  tokentype: string,
  uid: string,
  expiry?: string,
) => {
  // get role
  let userRole;

  if (role === "publisher") userRole = RtcRole.PUBLISHER;
  else if (role === "audience") userRole = RtcRole.SUBSCRIBER;
  else throw new Error("Role is incorrect");

  // get the expire time
  let expireTime;

  if (!expiry || expiry === "") expireTime = 3600;
  else {
    try {
      expireTime = parseInt(expiry, 10);
    } catch (err) {
      throw new Error(`Expiry is incorrect ${JSON.stringify(err)}`);
    }
  }

  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  let token;

  if (tokentype === "userAccount")
    token = RtcTokenBuilder.buildTokenWithAccount(
      APP_ID,
      APP_CERTIFICATE,
      channel,
      uid,
      userRole,
      privilegeExpireTime,
    );
  else if (tokentype === "uid")
    token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channel,
      parseInt(uid, 10),
      userRole,
      privilegeExpireTime,
    );
  else throw new Error("Token type is invalid");

  return token;
};

export { generateRTCToken };
