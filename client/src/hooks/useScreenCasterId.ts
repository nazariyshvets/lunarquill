import { useState, useEffect } from "react";

import { UID } from "agora-rtc-react";
import { RtmClient, RtmChannel } from "agora-rtm-react";

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
        console.log(err);
      }
    };

    getScreenCasterId();
    RTMChannel.on("AttributesUpdated", getScreenCasterId);

    return () => {
      RTMChannel.off("AttributesUpdated", getScreenCasterId);
    };
  }, [RTMClient, RTMChannel, channelId]);

  return id;
};

export default useScreenCasterId;
