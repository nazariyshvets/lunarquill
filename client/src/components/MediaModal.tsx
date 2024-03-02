import { useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

interface MediaModalProps {
  type: "img" | "video";
  url: string;
  onClose: () => void;
}

const MediaModal = ({ type, url, onClose }: MediaModalProps) => {
  const mediaWrapperRef = useRef<HTMLDivElement>(null);

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

  const mediaWidgetAttrs = useMemo(
    () => ({
      src: url,
      className: "max-h-full max-w-full rounded object-cover",
      draggable: false,
    }),
    [url],
  );

  return createPortal(
    <div className="fixed bottom-0 left-0 right-0 top-0 z-[99] flex items-center justify-center bg-deep-black bg-opacity-70 p-4">
      <div ref={mediaWrapperRef} className="max-h-full overflow-auto">
        <div className="max-h-[256px] max-w-[256px] sm:max-h-[512px] sm:max-w-[512px] xl:max-h-[1024px] xl:max-w-[1024px]">
          {type === "img" ? (
            <img alt={url} {...mediaWidgetAttrs} />
          ) : (
            <video controls {...mediaWidgetAttrs} />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default MediaModal;
