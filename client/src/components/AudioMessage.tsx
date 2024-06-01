import { useState, useRef, useEffect, useMemo } from "react";

import { useAlert } from "react-alert";
import { BiPlayCircle, BiPauseCircle } from "react-icons/bi";

import AudioVisualizer from "./AudioVisualizer";
import SimpleButton from "./SimpleButton";
import getBlobFromFile from "../utils/getBlobFromFile";
import fetchFile from "../utils/fetchFile";

interface AudioMessageProps {
  url: string;
  fileName: string;
}

const AudioMessage = ({ url, fileName }: AudioMessageProps) => {
  const [audio, setAudio] = useState<File>();
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const audioRef = useRef(new Audio(url));
  const alert = useAlert();

  const togglePlayback = async () => {
    if (isPlayingBack) {
      audioRef.current.pause();
      setIsPlayingBack(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlayingBack(true);
      } catch (err) {
        setIsPlayingBack(false);
        setPlaybackTime(0);
        console.log(err);
      }
    }
  };

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const audioFile = await fetchFile(url, "audio/mp3", fileName);

        setAudio(audioFile);
      } catch (err) {
        alert.error("An error occurred while fetching audio message");
        console.log("Error fetching audio message:", err);
      }
    };

    fetchAudio();
  }, [url, alert, fileName]);

  useEffect(() => {
    const handleTimeUpdate = () =>
      setPlaybackTime(audioRef.current.currentTime);

    const handleEnd = () => {
      setIsPlayingBack(false);
      setPlaybackTime(0);
    };

    const playbackAudio = audioRef.current;
    playbackAudio.addEventListener("timeupdate", handleTimeUpdate);
    playbackAudio.addEventListener("ended", handleEnd);

    return () => {
      playbackAudio.removeEventListener("timeupdate", handleTimeUpdate);
      playbackAudio.removeEventListener("ended", handleEnd);
    };
  }, []);

  const blob = useMemo(() => audio && getBlobFromFile(audio), [audio]);
  const displayTimeStr = `${Math.floor(playbackTime / 60)}:${String(
    Math.floor(playbackTime) % 60,
  ).padStart(2, "0")}`;

  return (
    <div className="flex h-10 w-[150px] max-w-[150px] items-center">
      <div className="relative h-full w-[calc(100%-36px)]">
        {blob && <AudioVisualizer blob={blob} currentTime={playbackTime} />}
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
