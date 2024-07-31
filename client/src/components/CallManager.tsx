import { useEffect, useRef } from "react";

import { Outlet, useNavigate } from "react-router-dom";
import { useAlert } from "react-alert";

import CallModal from "./CallModal";
import useRTMClient from "../hooks/useRTMClient";
import useAppDispatch from "../hooks/useAppDispatch";
import useAppSelector from "../hooks/useAppSelector";
import useAuth from "../hooks/useAuth";
import { setCallModalState, setCallTimeout } from "../redux/rtmSlice";
import { useFetchContactRelationMutation } from "../services/mainService";
import PeerMessage from "../types/PeerMessage";
import CallDirection from "../types/CallDirection";
import getErrorMessage from "../utils/getErrorMessage";

const CallManager = () => {
  const audioRef = useRef(new Audio("/call_sound.mp3"));
  const { userId } = useAuth();
  const RTMClient = useRTMClient();
  const [fetchContactRelation] = useFetchContactRelationMutation();
  const { callModalState, callTimeout } = useAppSelector((state) => state.rtm);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const alert = useAlert();

  const clearCallTimeout = () => {
    if (callTimeout) {
      clearTimeout(callTimeout);
      dispatch(setCallTimeout(null));
    }
  };

  useEffect(() => {
    const audio = audioRef.current;

    if (callModalState) {
      audio.loop = true;
      audio.play();
    } else {
      audio.pause();
      audio.currentTime = 0;
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [callModalState]);

  return (
    <>
      <Outlet />

      {callModalState &&
        (callModalState.callDirection === CallDirection.Incoming ? (
          <CallModal
            callDirection={CallDirection.Incoming}
            contactName={callModalState.contact.username}
            onDeclineBtnClick={() => {
              RTMClient.sendMessageToPeer(
                { text: PeerMessage.CallDeclined },
                callModalState.contact._id,
              );
              dispatch(setCallModalState(null));
            }}
            onAcceptBtnClick={async () => {
              try {
                const contact = await fetchContactRelation({
                  userId1: userId ?? "",
                  userId2: callModalState.contact._id,
                }).unwrap();

                RTMClient.sendMessageToPeer(
                  { text: PeerMessage.CallAccepted },
                  callModalState.contact._id,
                );
                dispatch(setCallModalState(null));
                navigate(`/contacts/${contact._id}/call`);
              } catch (err) {
                alert.error(
                  getErrorMessage({
                    error: err,
                    defaultErrorMessage:
                      "Could not accept the call. Please try again",
                  }),
                );
                console.log(err);
              }
            }}
          />
        ) : (
          <CallModal
            callDirection={CallDirection.Outgoing}
            contactName={callModalState.contact.username}
            onRecallBtnClick={() => {
              RTMClient.sendMessageToPeer(
                { text: PeerMessage.CallRecalled },
                callModalState.contact._id,
              );
              dispatch(setCallModalState(null));
              clearCallTimeout();
            }}
          />
        ))}
    </>
  );
};

export default CallManager;
