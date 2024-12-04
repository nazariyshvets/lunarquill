import { useState, useRef, useEffect } from "react";

import { useAlert } from "react-alert";
import { BiPlayCircle, BiPauseCircle } from "react-icons/bi";

import AudioVisualizer from "./AudioVisualizer";
import SimpleButton from "./SimpleButton";
import fetchFile from "../utils/fetchFile";

interface AudioMessageProps {
  url: string;
  fileName: string;
}

const AudioMessage = ({ url, fileName }: AudioMessageProps) => {
  const [audioBlob, setAudioBlob] = useState<Blob>();
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alert = useAlert();

  useEffect(() => {
    let audioInstance: HTMLAudioElement | null = null;

    const setupAudio = async () => {
      try {
        const audioFile = await fetchFile(url, "audio/mp3", fileName);
        const blobUrl = URL.createObjectURL(audioFile);

        setAudioBlob(audioFile);
        audioInstance = new Audio(blobUrl);
        audioRef.current = audioInstance;

        audioInstance.addEventListener("timeupdate", handleTimeUpdate);
        audioInstance.addEventListener("ended", handleEnd);

        return blobUrl;
      } catch (err) {
        alert.error("Failed to fetch the audio file.");
        console.error("Error fetching audio file:", err);

        return undefined;
      }
    };

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setPlaybackTime(audioRef.current.currentTime);
      }
    };

    const handleEnd = () => {
      setIsPlayingBack(false);
      setPlaybackTime(0);
    };

    // Initialize audio
    const blobUrlPromise = setupAudio();

    return () => {
      audioInstance?.pause();
      audioInstance?.removeEventListener("timeupdate", handleTimeUpdate);
      audioInstance?.removeEventListener("ended", handleEnd);
      blobUrlPromise.then((blobUrl) => blobUrl && URL.revokeObjectURL(blobUrl));
    };
  }, [url, fileName, alert]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlayingBack) {
      audio.pause();
      setIsPlayingBack(false);
    } else {
      try {
        await audio.play();
        setIsPlayingBack(true);
      } catch (err) {
        alert.error("Unable to play audio. Please try again.");
        console.error("Error playing audio:", err);
      }
    }
  };

  const handleVisualizerContainerClick = (posCoefficient: number) => {
    const audio = audioRef.current;

    if (audio && !!audio.duration && audio.duration !== Infinity) {
      audio.currentTime = audio.duration * posCoefficient;
    }
  };

  const displayTimeStr = `${Math.floor(playbackTime / 60)}:${String(
    Math.floor(playbackTime) % 60,
  ).padStart(2, "0")}`;

  return (
    <div className="flex h-10 w-[150px] max-w-[150px] items-center">
      <div className="relative h-full w-[calc(100%-36px)]">
        {audioBlob && (
          <AudioVisualizer
            blob={audioBlob}
            currentTime={playbackTime}
            onContainerClick={handleVisualizerContainerClick}
          />
        )}
        <span className="absolute bottom-0 right-0 text-white text-2xs sm:text-xs">
          {displayTimeStr}
        </span>
      </div>
      <SimpleButton onClick={togglePlayback}>
        {isPlayingBack ? (
          <BiPauseCircle className="text-lg sm:text-xl" />
        ) : (
          <BiPlayCircle className="text-lg sm:text-xl" />
        )}
      </SimpleButton>
    </div>
  );
};

export default AudioMessage;
