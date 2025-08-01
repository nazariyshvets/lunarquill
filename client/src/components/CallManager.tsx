import { useEffect, useRef } from "react";

import { Outlet, useNavigate } from "react-router-dom";

import CallModal from "./CallModal";
import useAppDispatch from "../hooks/useAppDispatch";
import useAppSelector from "../hooks/useAppSelector";
import useAuth from "../hooks/useAuth";
import useSendMessageToPeer from "../hooks/useSendMessageToPeer";
import { setCallModalState, setCallTimeout } from "../redux/rtmSlice";
import { useFetchContactRelationMutation } from "../services/contactApi";
import handleError from "../utils/handleError";
import PeerMessage from "../types/PeerMessage";
import CallDirection from "../types/CallDirection";

const CallManager = () => {
  const audioRef = useRef(new Audio("/call_sound.mp3"));
  const { userId } = useAuth();
  const [fetchContactRelation] = useFetchContactRelationMutation();
  const { callModalState, callTimeout } = useAppSelector((state) => state.rtm);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const sendMessageToPeer = useSendMessageToPeer();

  const handleDeclineBtnClick = async () => {
    if (!callModalState) {
      return;
    }

    try {
      await sendMessageToPeer(
        callModalState.contact._id,
        PeerMessage.CallDeclined,
      );
      dispatch(setCallModalState(null));
    } catch (err) {
      handleError(
        err,
        "Could not decline the call. Please try again",
        "Error declining the call:",
      );
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

      await sendMessageToPeer(peerId, PeerMessage.CallAccepted);
      dispatch(setCallModalState(null));
      navigate(`/contacts/${contact._id}/call`);
    } catch (err) {
      handleError(
        err,
        "Could not accept the call. Please try again",
        "Error accepting the call:",
      );
    }
  };

  const handleRecallBtnClick = async () => {
    if (!callModalState) {
      return;
    }

    try {
      await sendMessageToPeer(
        callModalState.contact._id,
        PeerMessage.CallRecalled,
      );
      dispatch(setCallModalState(null));
      clearCallTimeout();
    } catch (err) {
      handleError(
        err,
        "Could not recall the call. Please try again",
        "Error recalling the call:",
      );
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
