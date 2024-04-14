import { createChannel } from "agora-rtm-react";

import RTMConfig from "../config/RTMConfig";

const useRTMChannel = createChannel(RTMConfig.channelName);

export default useRTMChannel;
