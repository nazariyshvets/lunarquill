import { useState, useRef, useEffect, memo } from "react";

import { useAudioRecorder } from "react-audio-voice-recorder";
import { useAlert } from "react-alert";
import {
  BiPlayCircle,
  BiPauseCircle,
  BiCheckCircle,
  BiXCircle,
} from "react-icons/bi";

import AudioVisualizer from "./AudioVisualizer";
import SimpleButton from "./SimpleButton";

interface AudioRecorderProps {
  onSubmit: (blob: Blob) => void;
  onCancel: () => void;
}

const AudioRecorder = ({ onSubmit, onCancel }: AudioRecorderProps) => {
  const {
    recordingBlob,
    isRecording,
    recordingTime,
    mediaRecorder,
    startRecording,
    stopRecording,
  } = useAudioRecorder();
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const playbackAudioRef = useRef(new Audio());
  const alert = useAlert();

  const togglePlayPause = () =>
    recordingBlob ? togglePlayback(recordingBlob) : toggleRecording();

  const togglePlayback = async (blob: Blob) => {
    if (isPlayingBack) {
      playbackAudioRef.current.pause();
      setIsPlayingBack(false);
    } else {
      if (!playbackAudioRef.current.src)
        playbackAudioRef.current.src = URL.createObjectURL(blob);

      try {
        await playbackAudioRef.current.play();
        setIsPlayingBack(true);
      } catch (err) {
        resetPlayback();
        alert.error("Could not playback the audio. Please try again");
        console.error("Error playing back the audio:", err);
      }
    }
  };

  const toggleRecording = () =>
    isRecording ? stopRecording() : startRecording();

  const resetPlayback = () => {
    setIsPlayingBack(false);
    setPlaybackTime(0);
  };

  const handleCompleteBtnClick = () =>
    recordingBlob
      ? onSubmit(recordingBlob)
      : alert.info("Please record an audio message at first");

  const handleCloseBtnClick = () => {
    stopRecording();
    onCancel();
  };

  useEffect(() => {
    startRecording();

    return () => stopRecording();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const playbackAudio = playbackAudioRef.current;

    return () => {
      if (playbackAudio.src) URL.revokeObjectURL(playbackAudio.src);
    };
  }, []);

  useEffect(() => {
    const handleTimeUpdate = () =>
      setPlaybackTime(playbackAudioRef.current.currentTime);

    const playbackAudio = playbackAudioRef.current;
    playbackAudio.addEventListener("timeupdate", handleTimeUpdate);
    playbackAudio.addEventListener("ended", resetPlayback);

    return () => {
      playbackAudio.removeEventListener("timeupdate", handleTimeUpdate);
      playbackAudio.removeEventListener("ended", resetPlayback);
    };
  }, []);

  const displayTime = recordingBlob ? playbackTime : recordingTime;
  const displayTimeStr = `${Math.floor(displayTime / 60)}:${String(
    Math.floor(displayTime) % 60,
  ).padStart(2, "0")}`;

  return (
    <div className="flex h-10 w-full items-center">
      <div className="relative mx-2 h-full w-full">
        {recordingBlob ? (
          <AudioVisualizer blob={recordingBlob} currentTime={playbackTime} />
        ) : (
          mediaRecorder && (
            <AudioVisualizer isLive mediaRecorder={mediaRecorder} />
          )
        )}
        <span className="absolute bottom-0 right-0 text-white text-2xs sm:text-xs">
          {displayTimeStr}
        </span>
      </div>
      <SimpleButton onClick={togglePlayPause}>
        {(recordingBlob ? isPlayingBack : isRecording) ? (
          <BiPauseCircle className="text-lg sm:text-xl" />
        ) : (
          <BiPlayCircle className="text-lg sm:text-xl" />
        )}
      </SimpleButton>
      <SimpleButton onClick={handleCompleteBtnClick}>
        <BiCheckCircle className="text-lg sm:text-xl" />
      </SimpleButton>
      <SimpleButton onClick={handleCloseBtnClick}>
        <BiXCircle className="text-lg sm:text-xl" />
      </SimpleButton>
    </div>
  );
};

const MemoizedAudioRecorder = memo(AudioRecorder);

export default MemoizedAudioRecorder;
