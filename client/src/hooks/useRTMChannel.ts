import { useState, useEffect } from "react";

import {
  createChannel as createAgoraChannel,
  RtmClient,
  RtmChannel,
} from "agora-rtm-react";

const useRTMChannel = (client: RtmClient, channelId: string) => {
  const [channel, setChannel] = useState<RtmChannel>();

  useEffect(() => {
    if (channelId) setChannel(createAgoraChannel(channelId)(client));
  }, [channelId, client]);

  return channel;
};

export default useRTMChannel;
