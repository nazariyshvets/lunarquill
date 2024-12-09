import { RtmTokenBuilder, RtmRole } from "agora-access-token";

const APP_ID = process.env.AGORA_APP_ID!;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;

const generateRTMToken = (uid: string, expiry?: string) => {
  // get role
  const role = RtmRole.Rtm_User;
  // get the expire time
  let expireTime;

  if (!expiry || expiry === "") {
    expireTime = 3600;
  } else {
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
  return RtmTokenBuilder.buildToken(
    APP_ID,
    APP_CERTIFICATE,
    uid,
    role,
    privilegeExpireTime,
  );
};

export { generateRTMToken };
