import { useEffect, useCallback } from "react";

import { useNavigate } from "react-router-dom";
import { RtmMessage } from "agora-rtm-react";

import useRTMClient from "./useRTMClient";
import useAppDispatch from "./useAppDispatch";
import useAppSelector from "./useAppSelector";
import useAuth from "./useAuth";
import useChatConnection from "./useChatConnection";
import { setCallModalState, setCallTimeout } from "../redux/rtmSlice";
import { useFetchUserByIdMutation } from "../services/userApi";
import { useFetchContactRelationMutation } from "../services/contactApi";
import { useInvalidateTags } from "../services/mutationHelpers";
import showToast from "../utils/showToast";
import { QUERY_TAG_TYPES } from "../constants/constants";
import PeerMessage from "../types/PeerMessage";
import CallDirection from "../types/CallDirection";
import { ChatType } from "../types/ChatType";

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
      if (message.messageType !== "TEXT") {
        return;
      }

      if (message.text === PeerMessage.Call) {
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
      } else if (message.text === PeerMessage.CallDeclined) {
        dispatch(setCallModalState(null));
        clearCallTimeout();
        showToast("info", "The call was declined");
      } else if (message.text === PeerMessage.CallAccepted) {
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
      } else if (
        message.text === PeerMessage.CallRecalled ||
        message.text === PeerMessage.CallTimedOut
      ) {
        dispatch(setCallModalState(null));
      } else if (message.text === PeerMessage.CallEnded) {
        navigate(`/contacts/${peerId}/chat`);
      } else if (
        message.text === PeerMessage.RequestCreated ||
        message.text === PeerMessage.RequestDeclined ||
        message.text === PeerMessage.RequestRecalled ||
        message.text === PeerMessage.InviteRequestAccepted
      ) {
        invalidateTags([
          {
            type: QUERY_TAG_TYPES.USER_REQUESTS,
            id: localUserId,
          },
        ]);
      } else if (message.text === PeerMessage.ContactRequestAccepted) {
        invalidateTags(
          [QUERY_TAG_TYPES.USER_CONTACTS, QUERY_TAG_TYPES.USER_REQUESTS].map(
            (type) => ({
              type,
              id: localUserId,
            }),
          ),
        );
      } else if (message.text === PeerMessage.JoinRequestAccepted) {
        invalidateTags(
          [QUERY_TAG_TYPES.USER_CHANNELS, QUERY_TAG_TYPES.USER_REQUESTS].map(
            (type) => ({
              type,
              id: localUserId,
            }),
          ),
        );
      } else if (message.text === PeerMessage.ContactRemoved) {
        chatConnection.deleteConversation({
          channel: peerId,
          chatType: ChatType.SingleChat,
          deleteRoam: true,
        });
        navigate("/profile");
        invalidateTags([
          {
            type: QUERY_TAG_TYPES.USER_CONTACTS,
            id: localUserId,
          },
        ]);
      } else if (
        message.text.startsWith(PeerMessage.ChannelMemberJoined) ||
        message.text.startsWith(PeerMessage.ChannelMemberLeft)
      ) {
        invalidateTags([
          {
            type: QUERY_TAG_TYPES.CHANNEL_MEMBERS,
            id: message.text.split("__")[1],
          },
        ]);
      } else if (message.text.startsWith(PeerMessage.ChannelUpdated)) {
        invalidateTags([
          {
            type: QUERY_TAG_TYPES.CHANNEL,
            id: message.text.split("__")[1],
          },
          {
            type: QUERY_TAG_TYPES.USER_CHANNELS,
            id: localUserId,
          },
        ]);
      } else if (message.text.startsWith(PeerMessage.ChannelKicked)) {
        invalidateTags([
          {
            type: QUERY_TAG_TYPES.USER_CHANNELS,
            id: localUserId,
          },
        ]);
        navigate("/profile");
      } else if (message.text.startsWith(PeerMessage.ChannelMemberKicked)) {
        invalidateTags([
          {
            type: QUERY_TAG_TYPES.CHANNEL_MEMBERS,
            id: message.text.split("__")[1],
          },
        ]);
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
