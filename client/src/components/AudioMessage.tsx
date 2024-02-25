import { useState, useRef, useEffect, useMemo } from "react";
import { AgoraChat } from "agora-chat";
import { BiPlayCircle, BiPauseCircle } from "react-icons/bi";
import AudioVisualizer from "./AudioVisualizer";
import SimpleButton from "./SimpleButton";
import getBlobFromFile from "../utils/getBlobFromFile";

interface AudioMessageProps {
  audio: AgoraChat.FileObj;
}

const AudioMessage = ({ audio }: AudioMessageProps) => {
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const audioRef = useRef(new Audio(audio.url));

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
        console.log(err)
      }
    }
  };

  useEffect(() => {
    const handleTimeUpdate = () => {
      setPlaybackTime(audioRef.current.currentTime);
    };

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

  const blob = useMemo(() => getBlobFromFile(audio.data), [audio.data])
  const displayTimeStr = `${Math.floor(playbackTime / 60)}:${String(
    Math.floor(playbackTime) % 60,
  ).padStart(2, "0")}`;

  return (
    <div className="flex h-10 w-[9999px] max-w-full items-center">
      <div className="relative h-full w-full">
        <AudioVisualizer
          blob={blob}
          currentTime={playbackTime}
        />
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
