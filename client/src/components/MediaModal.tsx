import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import PdfViewer from "./PdfViewer";
import TextFileViewer from "./TextFileViewer";

interface MediaModalProps {
  type: "img" | "video" | "pdf" | "txt";
  url: string;
  onClose: () => void;
}

const MediaModal = ({ type, url, onClose }: MediaModalProps) => {
  const mediaWrapperRef = useRef<HTMLDivElement>(null);

  const getMediaWidget = () => {
    switch (type) {
      case "img":
        return (
          <img
            alt={url}
            src={url}
            className="max-h-full max-w-full rounded object-cover"
            draggable={false}
          />
        );
      case "video":
        return (
          <video
            src={url}
            className="max-h-full max-w-full rounded object-cover"
            draggable={false}
          />
        );
      case "pdf":
        return url && <PdfViewer url={url} />;
      case "txt":
        return url && <TextFileViewer url={url} />;
      default:
        return;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mediaWrapperRef.current &&
        !mediaWrapperRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed bottom-0 left-0 right-0 top-0 z-[99] flex items-center justify-center bg-deep-black bg-opacity-70 p-4">
      <div
        ref={mediaWrapperRef}
        className="max-h-full max-w-[256px] overflow-auto sm:max-w-[512px] xl:max-w-[1024px]"
      >
        {getMediaWidget()}
      </div>
    </div>,
    document.body,
  );
};

export default MediaModal;
