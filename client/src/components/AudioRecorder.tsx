import { useState, useRef, useEffect } from "react";
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
  const playbackAudioUrlRef = useRef("");
  const alert = useAlert();

  const togglePlayPause = () => {
    if (recordingBlob) {
      togglePlayback(recordingBlob);
    } else {
      toggleRecording();
    }
  };

  const togglePlayback = async (blob: Blob) => {
    if (isPlayingBack) {
      playbackAudioRef.current.pause();
      setIsPlayingBack(false);
    } else {
      if (!playbackAudioUrlRef.current) {
        const url = URL.createObjectURL(blob);
        playbackAudioRef.current.src = url;
        playbackAudioUrlRef.current = url;
      }

      try {
        await playbackAudioRef.current.play();
        setIsPlayingBack(true);
      } catch(err) {
        setIsPlayingBack(false);
        setPlaybackTime(0);
        console.log(err)
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleRecordingComplete = () => {
    if (recordingBlob) {
      onSubmit(recordingBlob);
    } else {
      alert.info("Please record an audio message first");
    }
  };

  useEffect(() => {
    startRecording();

    return () => {
      stopRecording();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const handleTimeUpdate = () => {
      setPlaybackTime(playbackAudioRef.current.currentTime);
    };

    const handleEnd = () => {
      setIsPlayingBack(false);
      setPlaybackTime(0);
    };

    const playbackAudio = playbackAudioRef.current;
    playbackAudio.addEventListener("timeupdate", handleTimeUpdate);
    playbackAudio.addEventListener("ended", handleEnd);

    return () => {
      playbackAudio.removeEventListener("timeupdate", handleTimeUpdate);
      playbackAudio.removeEventListener("ended", handleEnd);
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
      <SimpleButton onClick={handleRecordingComplete}>
        <BiCheckCircle className="text-lg sm:text-xl" />
      </SimpleButton>
      <SimpleButton onClick={onCancel}>
        <BiXCircle className="text-lg sm:text-xl" />
      </SimpleButton>
    </div>
  );
};

export default AudioRecorder;
