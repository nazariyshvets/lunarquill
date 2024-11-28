import { useEffect, useCallback } from "react";

import { useNavigate } from "react-router-dom";
import { RtmMessage } from "agora-rtm-react";
import { useAlert } from "react-alert";

import useRTMClient from "./useRTMClient";
import useAppDispatch from "./useAppDispatch";
import useAppSelector from "./useAppSelector";
import useAuth from "./useAuth";
import useChatConnection from "./useChatConnection";
import { setCallModalState, setCallTimeout } from "../redux/rtmSlice";
import { useFetchUserByIdMutation } from "../services/userApi";
import { useFetchContactRelationMutation } from "../services/contactApi";
import { useInvalidateTags } from "../services/mutationHelpers";
import { QUERY_TAG_TYPES } from "../constants/constants";
import PeerMessage from "../types/PeerMessage";
import CallDirection from "../types/CallDirection";
import { ChatTypeEnum } from "../types/ChatType";

const usePeerMessageManager = () => {
  const { userId } = useAuth();
  const localUserId = userId ?? undefined;

  const [fetchUser] = useFetchUserByIdMutation();
  const [fetchContactRelation] = useFetchContactRelationMutation();

  const RTMClient = useRTMClient();
  const chatConnection = useChatConnection();
  const dispatch = useAppDispatch();
  const callTimeout = useAppSelector((state) => state.rtm.callTimeout);
  const navigate = useNavigate();
  const alert = useAlert();
  const invalidateTags = useInvalidateTags();

  const clearCallTimeout = useCallback(() => {
    if (callTimeout) {
      clearTimeout(callTimeout);
      dispatch(setCallTimeout(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callTimeout]);

  useEffect(() => {
    const messageHandler = async (message: RtmMessage, peerId: string) => {
      if (message.messageType === "TEXT") {
        switch (message.text) {
          case PeerMessage.Call: {
            try {
              const peerUser = await fetchUser(peerId).unwrap();

              dispatch(
                setCallModalState({
                  callDirection: CallDirection.Incoming,
                  contact: peerUser,
                }),
              );
            } catch (err) {
              console.error("Error fetching peer user data:", err);
            }
            break;
          }
          case PeerMessage.CallDeclined:
            dispatch(setCallModalState(null));
            clearCallTimeout();
            alert.info("The call was declined");
            break;
          case PeerMessage.CallAccepted:
            if (localUserId) {
              try {
                const contact = await fetchContactRelation({
                  userId1: localUserId,
                  userId2: peerId,
                }).unwrap();

                dispatch(setCallModalState(null));
                clearCallTimeout();
                navigate(`/contacts/${contact._id}/call`);
              } catch (err) {
                console.error("Error fetching contact relation data:", err);
              }
            }
            break;
          case PeerMessage.CallRecalled:
          case PeerMessage.CallTimedOut:
            dispatch(setCallModalState(null));
            break;
          case PeerMessage.CallEnded:
            navigate(`/contacts/${peerId}/chat`);
            break;
          case PeerMessage.RequestCreated:
          case PeerMessage.RequestDeclined:
          case PeerMessage.RequestRecalled:
          case PeerMessage.InviteRequestAccepted:
            invalidateTags([
              {
                type: QUERY_TAG_TYPES.USER_REQUESTS,
                id: localUserId,
              },
            ]);
            break;
          case PeerMessage.ContactRequestAccepted:
            invalidateTags(
              [
                QUERY_TAG_TYPES.USER_CONTACTS,
                QUERY_TAG_TYPES.USER_REQUESTS,
              ].map((type) => ({
                type,
                id: localUserId,
              })),
            );
            break;
          case PeerMessage.JoinRequestAccepted:
            invalidateTags(
              [
                QUERY_TAG_TYPES.USER_CHANNELS,
                QUERY_TAG_TYPES.USER_REQUESTS,
              ].map((type) => ({
                type,
                id: localUserId,
              })),
            );
            break;
          case PeerMessage.UserWentOnline:
          case PeerMessage.UserWentOffline:
            invalidateTags([
              {
                type: QUERY_TAG_TYPES.USER_CONTACTS,
                id: localUserId,
              },
            ]);
            break;
          case PeerMessage.ContactRemoved:
            chatConnection.deleteConversation({
              channel: peerId,
              chatType: ChatTypeEnum.SingleChat,
              deleteRoam: true,
            });
            navigate("/profile");
            invalidateTags([
              {
                type: QUERY_TAG_TYPES.USER_CONTACTS,
                id: localUserId,
              },
            ]);
        }
      }
    };

    RTMClient.on("MessageFromPeer", messageHandler);

    return () => {
      RTMClient.off("MessageFromPeer", messageHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [RTMClient, localUserId, clearCallTimeout]);
};

export default usePeerMessageManager;
