import { useState, useEffect } from "react";

import { UID } from "agora-rtc-react";

import useRTMClient from "../hooks/useRTMClient";
import useRTMChannel from "../hooks/useRTMChannel";

const useScreenCasterId = () => {
  const RTMClient = useRTMClient();
  const RTMChannel = useRTMChannel(RTMClient);
  const [id, setId] = useState<UID | null>(null);

  useEffect(() => {
    const getScreenCasterId = async () => {
      try {
        const { screenCasterId } = await RTMClient.getChannelAttributesByKeys(
          RTMChannel.channelId,
          ["screenCasterId"],
        );

        if (screenCasterId) {
          setId(screenCasterId.value);
        } else {
          setId(null);
        }
      } catch (err) {
        console.log(err);
      }
    };

    getScreenCasterId();
    RTMChannel.on("AttributesUpdated", getScreenCasterId);

    return () => {
      RTMChannel.off("AttributesUpdated", getScreenCasterId);
    };
  }, [RTMClient, RTMChannel]);

  return id;
};

export default useScreenCasterId;
