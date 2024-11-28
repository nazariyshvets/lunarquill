import { useClientEvent, IAgoraRTCClient, UID } from "agora-rtc-react";
import { useAlert } from "react-alert";

import { useFetchRTCTokenMutation } from "../services/tokenApi";

const useRTCTokenWillExpire = (
  client: IAgoraRTCClient,
  channelName: string,
  uid: UID,
) => {
  const [fetchRTCToken] = useFetchRTCTokenMutation();
  const alert = useAlert();

  useClientEvent(client, "token-privilege-will-expire", async () => {
    try {
      const token = await fetchRTCToken({ channelName, uid }).unwrap();

      if (token) await client.renewToken(token);
    } catch (err) {
      alert.error("Could not renew RTC token");
      console.error("Error renewing RTC token:", err);
    }
  });
};

export default useRTCTokenWillExpire;
