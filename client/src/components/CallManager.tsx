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

  const handleDeclineBtnClick = async () => {
    if (!callModalState) return;

    try {
      await RTMClient.sendMessageToPeer(
        { text: PeerMessage.CallDeclined },
        callModalState.contact._id,
      );
      dispatch(setCallModalState(null));
    } catch (err) {
      alert.error(
        getErrorMessage({
          error: err,
          defaultErrorMessage: "Could not decline the call. Please try again",
        }),
      );
      console.error("Error declining the call:", err);
    }
  };

  const handleAcceptBtnClick = async () => {
    if (!callModalState || !userId) return;

    try {
      const peerId = callModalState.contact._id;
      const contact = await fetchContactRelation({
        userId1: userId,
        userId2: peerId,
      }).unwrap();

      await RTMClient.sendMessageToPeer(
        { text: PeerMessage.CallAccepted },
        peerId,
      );
      dispatch(setCallModalState(null));
      navigate(`/contacts/${contact._id}/call`);
    } catch (err) {
      alert.error(
        getErrorMessage({
          error: err,
          defaultErrorMessage: "Could not accept the call. Please try again",
        }),
      );
      console.error("Error accepting the call:", err);
    }
  };

  const handleRecallBtnClick = async () => {
    if (!callModalState) return;

    try {
      await RTMClient.sendMessageToPeer(
        { text: PeerMessage.CallRecalled },
        callModalState.contact._id,
      );
      dispatch(setCallModalState(null));
      clearCallTimeout();
    } catch (err) {
      alert.error(
        getErrorMessage({
          error: err,
          defaultErrorMessage: "Could not recall the call. Please try again",
        }),
      );
      console.error("Error recalling the call:", err);
    }
  };

  const clearCallTimeout = () => {
    if (callTimeout) {
      clearTimeout(callTimeout);
      dispatch(setCallTimeout(null));
    }
  };

  const resetAudio = (audio: HTMLAudioElement) => {
    audio.pause();
    audio.currentTime = 0;
  };

  useEffect(() => {
    const audio = audioRef.current;

    if (callModalState) {
      audio.loop = true;
      audio.play();
    } else resetAudio(audio);

    return () => resetAudio(audio);
  }, [callModalState]);

  return (
    <>
      <Outlet />

      {callModalState &&
        (callModalState.callDirection === CallDirection.Incoming ? (
          <CallModal
            callDirection={CallDirection.Incoming}
            contact={callModalState.contact}
            onDeclineBtnClick={handleDeclineBtnClick}
            onAcceptBtnClick={handleAcceptBtnClick}
          />
        ) : (
          <CallModal
            callDirection={CallDirection.Outgoing}
            contact={callModalState.contact}
            onRecallBtnClick={handleRecallBtnClick}
          />
        ))}
    </>
  );
};

export default CallManager;
