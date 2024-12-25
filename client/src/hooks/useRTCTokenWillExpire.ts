import { useClientEvent, IAgoraRTCClient, UID } from "agora-rtc-react";

import { useFetchRTCTokenMutation } from "../services/tokenApi";
import showToast from "../utils/showToast";

const useRTCTokenWillExpire = (
  client: IAgoraRTCClient,
  channelName: string,
  uid: UID,
) => {
  const [fetchRTCToken] = useFetchRTCTokenMutation();

  useClientEvent(client, "token-privilege-will-expire", async () => {
    try {
      const token = await fetchRTCToken({ channelName, uid }).unwrap();

      if (token) {
        await client.renewToken(token);
      }
    } catch (err) {
      showToast("error", "Could not renew RTC token");
      console.error("Error renewing RTC token:", err);
    }
  });
};

export default useRTCTokenWillExpire;
