import { useCallback } from "react";

import useRTMClient from "./useRTMClient";

const useSendMessageToPeer = () => {
  const RTMClient = useRTMClient();

  return useCallback(
    (peerId: string, text: string) =>
      RTMClient.sendMessageToPeer({ text }, peerId),
    [RTMClient],
  );
};

export default useSendMessageToPeer;
