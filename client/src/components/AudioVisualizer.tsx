import { useState, useRef, useEffect } from "react";

import {
  AudioVisualizer as ReactAudioVisualizer,
  LiveAudioVisualizer as ReactLiveAudioVisualizer,
} from "react-audio-visualize";

interface AudioVisualizerProps {
  blob?: Blob;
  currentTime?: number;
  mediaRecorder?: MediaRecorder;
  isLive?: boolean;
}

const AudioVisualizer = ({
  blob,
  currentTime,
  mediaRecorder,
  isLive = false,
}: AudioVisualizerProps) => {
  const [visualizerSize, setVisualizerSize] = useState({ width: 0, height: 0 });
  const visualizerWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (visualizerWrapperRef.current) {
        const { width, height } =
          visualizerWrapperRef.current.getBoundingClientRect();
        setVisualizerSize({ width, height });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if ((isLive && !mediaRecorder) || (!isLive && !blob)) {
    return <></>;
  }

  return (
    <div ref={visualizerWrapperRef} className="h-full w-full">
      {isLive ? (
        <ReactLiveAudioVisualizer
          mediaRecorder={mediaRecorder}
          width={visualizerSize.width}
          height={visualizerSize.height}
          barColor="#86C232"
        />
      ) : (
        <ReactAudioVisualizer
          blob={blob}
          currentTime={currentTime}
          width={visualizerSize.width}
          height={visualizerSize.height}
          barColor="#339933"
          barPlayedColor="#86C232"
        />
      )}
    </div>
  );
};

export default AudioVisualizer;
