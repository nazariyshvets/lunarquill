import { useState } from "react";

import BaseModal from "./BaseModal";
import PdfViewer from "./PdfViewer";
import TextFileViewer from "./TextFileViewer";
import useClickOutside from "../hooks/useClickOutside";
import type SupportedFileType from "../types/SupportedFileType";

interface MediaModalProps {
  type: SupportedFileType;
  url: string;
  onClose: () => void;
}

const MediaModal = ({ type, url, onClose }: MediaModalProps) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useClickOutside({
    element: container || undefined,
    onClickOutside: onClose,
  });

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
            controls
            className="max-h-full max-w-full rounded object-cover"
            draggable={false}
          />
        );
      case "pdf":
        return url && <PdfViewer url={url} />;
      case "txt":
        return url && <TextFileViewer url={url} />;
    }
  };

  return (
    <BaseModal>
      <div
        ref={setContainer}
        className="max-h-full max-w-[256px] overflow-auto sm:max-w-[512px] xl:max-w-[1024px]"
      >
        {getMediaWidget()}
      </div>
    </BaseModal>
  );
};

export default MediaModal;
