import { useEffect, useCallback } from "react";

import { skipToken } from "@reduxjs/toolkit/query";
import AgoraRTM, { RtmStatusCode } from "agora-rtm-react";

import { useGetUserContactsQuery } from "../services/userApi";
import useRTMClient from "./useRTMClient";
import useAppSelector from "./useAppSelector";
import useAppDispatch from "./useAppDispatch";
import { setOnlineContactIds } from "../redux/rtmSlice";

const useContactOnlineStatus = () => {
  const { userId } = useAppSelector((state) => state.auth);
  const { isRTMClientInitialized } = useAppSelector((state) => state.rtm);
  const RTMClient = useRTMClient();
  const { data: contacts = [] } = useGetUserContactsQuery(userId ?? skipToken);
  const dispatch = useAppDispatch();

  const handlePeersOnlineStatusChanged = useCallback(
    (contactOnlineStatusMap: Record<string, RtmStatusCode.PeerOnlineState>) => {
      const onlineContactIds = Object.entries(contactOnlineStatusMap)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, status]) => status === AgoraRTM.PeerOnlineState.ONLINE)
        .map(([id]) => id);

      dispatch(setOnlineContactIds(onlineContactIds));
    },
    [dispatch],
  );

  useEffect(() => {
    const contactIds = contacts.map((contact) => contact._id);

    if (isRTMClientInitialized && !!contacts.length) {
      (async () => {
        try {
          await RTMClient.subscribePeersOnlineStatus(contactIds);
        } catch (error) {
          console.error("Error subscribing to peers online status:", error);
        }
      })();
    }

    return () => {
      if (isRTMClientInitialized && !!contacts.length) {
        (async () => {
          try {
            await RTMClient.unsubscribePeersOnlineStatus(contactIds);
          } catch (error) {
            console.error(
              "Error unsubscribing from peers online status:",
              error,
            );
          }
        })();
      }
    };
  }, [RTMClient, isRTMClientInitialized, contacts]);

  useEffect(() => {
    if (isRTMClientInitialized) {
      RTMClient.on("PeersOnlineStatusChanged", handlePeersOnlineStatusChanged);
    }

    return () => {
      if (isRTMClientInitialized) {
        RTMClient.off(
          "PeersOnlineStatusChanged",
          handlePeersOnlineStatusChanged,
        );
      }
    };
  }, [
    RTMClient,
    isRTMClientInitialized,
    dispatch,
    handlePeersOnlineStatusChanged,
  ]);
};

export default useContactOnlineStatus;
