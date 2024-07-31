import { useEffect, useCallback } from "react";

import { Outlet, useNavigate } from "react-router-dom";
import { RtmMessage } from "agora-rtm-react";
import { useAlert } from "react-alert";

import useRTMClient from "../hooks/useRTMClient";
import useAppDispatch from "../hooks/useAppDispatch";
import useAppSelector from "../hooks/useAppSelector";
import useAuth from "../hooks/useAuth";
import { setCallModalState, setCallTimeout } from "../redux/rtmSlice";
import {
  mainApi,
  useFetchUserByIdMutation,
  useFetchContactRelationMutation,
} from "../services/mainService";
import { QUERY_TAG_TYPES } from "../constants/constants";
import PeerMessage from "../types/PeerMessage";
import CallDirection from "../types/CallDirection";

const PeerMessageManager = () => {
  const { userId } = useAuth();

  const [fetchUser] = useFetchUserByIdMutation();
  const [fetchContactRelation] = useFetchContactRelationMutation();

  const RTMClient = useRTMClient();
  const dispatch = useAppDispatch();
  const callTimeout = useAppSelector((state) => state.rtm.callTimeout);
  const navigate = useNavigate();
  const alert = useAlert();

  const clearCallTimeout = useCallback(() => {
    if (callTimeout) {
      clearTimeout(callTimeout);
      dispatch(setCallTimeout(null));
    }
  }, [callTimeout, dispatch]);

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
              console.log(err);
            }
            break;
          }
          case PeerMessage.CallDeclined:
            dispatch(setCallModalState(null));
            clearCallTimeout();
            alert.info("The call was declined");
            break;
          case PeerMessage.CallAccepted:
            try {
              const contact = await fetchContactRelation({
                userId1: userId ?? "",
                userId2: peerId,
              }).unwrap();

              dispatch(setCallModalState(null));
              clearCallTimeout();
              navigate(`/contacts/${contact._id}/call`);
            } catch (err) {
              console.log(err);
            }
            break;
          case PeerMessage.CallRecalled:
            dispatch(setCallModalState(null));
            break;
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
            dispatch(
              mainApi.util?.invalidateTags([QUERY_TAG_TYPES.USER_REQUESTS]),
            );
            break;
          case PeerMessage.ContactRequestAccepted:
            dispatch(
              mainApi.util?.invalidateTags([
                QUERY_TAG_TYPES.USER_REQUESTS,
                QUERY_TAG_TYPES.USER_CONTACTS,
              ]),
            );
            break;
          case PeerMessage.JoinRequestAccepted:
            dispatch(
              mainApi.util?.invalidateTags([
                QUERY_TAG_TYPES.USER_REQUESTS,
                QUERY_TAG_TYPES.USER_CHANNELS,
              ]),
            );
            break;
          case PeerMessage.UserWentOnline:
          case PeerMessage.UserWentOffline:
            dispatch(
              mainApi.util?.invalidateTags([QUERY_TAG_TYPES.USER_CONTACTS]),
            );
            break;
          case PeerMessage.ContactRemoved:
            navigate("/profile");
            dispatch(
              mainApi.util?.invalidateTags([QUERY_TAG_TYPES.USER_CONTACTS]),
            );
        }
      }
    };

    RTMClient.on("MessageFromPeer", messageHandler);

    return () => {
      RTMClient.off("MessageFromPeer", messageHandler);
    };
  }, [
    RTMClient,
    dispatch,
    fetchContactRelation,
    fetchUser,
    navigate,
    userId,
    alert,
    clearCallTimeout,
  ]);

  return <Outlet />;
};

export default PeerMessageManager;
