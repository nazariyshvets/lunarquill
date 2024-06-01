import { useEffect } from "react";

import { Outlet, useNavigate } from "react-router-dom";
import { RtmMessage } from "agora-rtm-react";
import { useAlert } from "react-alert";

import useRTMClient from "../hooks/useRTMClient";
import useAppDispatch from "../hooks/useAppDispatch";
import useAuth from "../hooks/useAuth";
import { setCallModalState } from "../redux/rtmSlice";
import {
  useFetchUserByIdMutation,
  useFetchContactRelationMutation,
  useGetUserRequestsQuery,
  useGetUserContactsQuery,
  useGetUserChannelsQuery,
} from "../services/mainService";
import PeerMessage from "../types/PeerMessage";
import CallDirection from "../types/CallDirection";

const PeerMessageManager = () => {
  const { userId } = useAuth();

  const [fetchUser] = useFetchUserByIdMutation();
  const [fetchContactRelation] = useFetchContactRelationMutation();
  const { refetch: refetchUserRequests } = useGetUserRequestsQuery(
    userId ?? "",
  );
  const { refetch: refetchUserContacts } = useGetUserContactsQuery(
    userId ?? "",
  );
  const { refetch: refetchUserChannels } = useGetUserChannelsQuery(
    userId ?? "",
  );

  const RTMClient = useRTMClient();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const alert = useAlert();

  useEffect(() => {
    const messageHandler = async (message: RtmMessage, peerId: string) => {
      if (message.messageType === "TEXT") {
        switch (message.text) {
          case PeerMessage.AudioCall: {
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
          case PeerMessage.AudioCallCancelled:
            dispatch(setCallModalState(null));
            alert.info("The call was cancelled");
            break;
          case PeerMessage.AudioCallAccepted:
            try {
              const contact = await fetchContactRelation({
                userId1: userId ?? "",
                userId2: peerId,
              }).unwrap();

              dispatch(setCallModalState(null));
              navigate(`/contacts/${contact._id}/call`);
            } catch (err) {
              console.log(err);
            }
            break;
          case PeerMessage.AudioCallTimedOut:
            dispatch(setCallModalState(null));
            break;
          case PeerMessage.RequestCreated:
          case PeerMessage.RequestDeclined:
          case PeerMessage.RequestRecalled:
          case PeerMessage.InviteRequestAccepted:
            refetchUserRequests();
            break;
          case PeerMessage.ContactRequestAccepted:
            refetchUserRequests();
            refetchUserContacts();
            break;
          case PeerMessage.JoinRequestAccepted:
            refetchUserRequests();
            refetchUserChannels();
            break;
          case PeerMessage.UserWentOnline:
          case PeerMessage.UserWentOffline:
            refetchUserContacts();
            break;
          case PeerMessage.ContactRemoved:
            navigate("/profile");
            refetchUserContacts();
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
    refetchUserRequests,
    refetchUserContacts,
    refetchUserChannels,
    userId,
    alert,
  ]);

  return <Outlet />;
};

export default PeerMessageManager;
