import { useState, useEffect } from "react";

import { UID } from "agora-rtc-react";
import { RtmClient, RtmChannel } from "agora-rtm-react";

import showToast from "../utils/showToast";

const useScreenCasterId = (
  RTMClient: RtmClient,
  RTMChannel: RtmChannel,
  channelId: string,
) => {
  const [id, setId] = useState<UID | null>(null);

  useEffect(() => {
    const getScreenCasterId = async () => {
      try {
        const { screenCasterId } = await RTMClient.getChannelAttributesByKeys(
          channelId,
          ["screenCasterId"],
        );

        if (screenCasterId) setId(screenCasterId.value);
        else setId(null);
      } catch (err) {
        showToast("error", "Could not get screen caster id");
        console.error("Error getting screen caster id:", err);
      }
    };

    getScreenCasterId();
    RTMChannel.on("AttributesUpdated", getScreenCasterId);

    return () => {
      RTMChannel.off("AttributesUpdated", getScreenCasterId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [RTMClient, RTMChannel, channelId]);

  return id;
};

export default useScreenCasterId;
