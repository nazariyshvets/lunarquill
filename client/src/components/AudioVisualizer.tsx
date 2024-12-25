import React, { useState, useRef, useEffect } from "react";

import {
  AudioVisualizer as ReactAudioVisualizer,
  LiveAudioVisualizer as ReactLiveAudioVisualizer,
} from "react-audio-visualize";
import _ from "lodash";

interface AudioVisualizerProps {
  blob?: Blob;
  currentTime?: number;
  mediaRecorder?: MediaRecorder;
  isLive?: boolean;
  onContainerClick?: (posCoefficient: number) => void;
}

const AudioVisualizer = ({
  blob,
  currentTime,
  mediaRecorder,
  isLive = false,
  onContainerClick,
}: AudioVisualizerProps) => {
  const [visualizerSize, setVisualizerSize] = useState({ width: 0, height: 0 });
  const visualizerWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = _.debounce(() => {
      if (visualizerWrapperRef.current) {
        const { width, height } =
          visualizerWrapperRef.current.getBoundingClientRect();
        setVisualizerSize({ width, height });
      }
    }, 200);

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if ((isLive && !mediaRecorder) || (!isLive && !blob)) return <></>;

  const handleContainerClick = onContainerClick
    ? (e: React.MouseEvent<HTMLDivElement>) => {
        if (visualizerWrapperRef.current) {
          const rect = visualizerWrapperRef.current.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const coefficient = clickX / rect.width;

          onContainerClick(coefficient);
        }
      }
    : undefined;

  return (
    <div
      ref={visualizerWrapperRef}
      className="h-full w-full"
      onClick={handleContainerClick}
    >
      {Boolean(visualizerSize.width) &&
        Boolean(visualizerSize.height) &&
        (isLive ? (
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
        ))}
    </div>
  );
};

export default AudioVisualizer;
