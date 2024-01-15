import { createClient } from "agora-rtm-react";
import RTMConfig from "../config/RTMConfig";

const useRTMClient = createClient(RTMConfig.appId);

export default useRTMClient;
