import { useRef, useEffect } from "react";

import AgoraRTC from "agora-rtc-react";

import useAppDispatch from "./useAppDispatch";
import useRTC from "./useRTC";
import {
  setLocalMicrophoneTrack,
  setLocalCameraTrack,
} from "../redux/rtcSlice";

const useInitMediaDevices = (isReady: boolean) => {
  const pitchShiftNodeRef = useRef<AudioWorkletNode | null>(null);
  const {
    localMicrophoneTrack,
    localCameraTrack,
    isPitchShiftEnabled,
    pitchFactor,
  } = useRTC();
  const dispatch = useAppDispatch();

  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let destination: MediaStreamAudioDestinationNode | null = null;
    let audioStream: MediaStream | null = null;

    (async () => {
      if (isReady) {
        try {
          audioContext = new AudioContext();
          audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          const microphone = audioContext.createMediaStreamSource(audioStream);

          await audioContext.audioWorklet.addModule(
            "/src/audio/phaseVocoder.ts",
          );

          pitchShiftNodeRef.current = new AudioWorkletNode(
            audioContext,
            "phase-vocoder-processor",
          );
          destination = audioContext.createMediaStreamDestination();

          // Connect the processing chain: microphone -> pitchShiftNode -> destination
          microphone.connect(pitchShiftNodeRef.current);
          pitchShiftNodeRef.current.connect(destination);

          // Publish the transformed audio and video streams to the RTC channel
          const audioTrack = AgoraRTC.createCustomAudioTrack({
            mediaStreamTrack: destination.stream.getAudioTracks()[0],
          });
          const videoTrack = await AgoraRTC.createCameraVideoTrack();
          dispatch(setLocalMicrophoneTrack(audioTrack));
          dispatch(setLocalCameraTrack(videoTrack));
        } catch (error) {
          dispatch(setLocalMicrophoneTrack(null));
          dispatch(setLocalCameraTrack(null));
          console.error("Error in audio processing or Agora setup:", error);
        }
      }
    })();

    return () => {
      audioStream?.getTracks()?.forEach((track) => track.stop());
      pitchShiftNodeRef.current?.disconnect();
      destination?.disconnect();
      audioContext?.close();
    };
  }, [isReady, dispatch]);

  useEffect(() => {
    const pitchShiftNode = pitchShiftNodeRef.current;
    const pitchFactorParam = pitchShiftNode?.parameters.get("pitchFactor");
    const pitchEnabledParam = pitchShiftNode?.parameters.get("enabled");

    if (pitchFactorParam && pitchEnabledParam) {
      if (isPitchShiftEnabled) {
        pitchFactorParam.value = pitchFactor;
        pitchEnabledParam.value = 1.0;
      } else {
        pitchFactorParam.value = 1.0;
        pitchEnabledParam.value = 0.0;
      }
    }
  }, [isPitchShiftEnabled, pitchFactor, localMicrophoneTrack]);

  useEffect(
    () => () => {
      if (localMicrophoneTrack) {
        localMicrophoneTrack.close();
        dispatch(setLocalMicrophoneTrack(null));
      }
    },
    [localMicrophoneTrack, dispatch],
  );
  useEffect(
    () => () => {
      if (localCameraTrack) {
        localCameraTrack.close();
        dispatch(setLocalCameraTrack(null));
      }
    },
    [localCameraTrack, dispatch],
  );
};

export default useInitMediaDevices;
