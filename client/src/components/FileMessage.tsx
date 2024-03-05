import { useState } from "react";
import { BiFile } from "react-icons/bi";
import MediaModal from "./MediaModal.tsx";
import formatBytes from "../utils/formatBytes.ts";

interface FileMessageProps {
  url: string;
  fileType: string;
  fileName?: string;
  fileSize?: number;
}

const FileMessage = ({
  url,
  fileType,
  fileName,
  fileSize,
}: FileMessageProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="flex max-w-full cursor-pointer items-center gap-2 overflow-hidden rounded border border-white p-2 text-white transition-colors hover:border-primary-light hover:text-primary-light"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex flex-col gap-0.5 overflow-hidden">
          <span className="max-w-full truncate text-xs sm:text-sm">
            {fileName || "unknown"}
          </span>
          <span className="text-lightgrey text-2xs sm:text-xs">
            {fileSize ? formatBytes(fileSize) : "unknown"}
          </span>
        </div>
        <BiFile className="flex-shrink-0 text-xl sm:text-2xl" />
      </div>
      {isOpen && fileType === "pdf" && (
        <MediaModal
          type={fileType}
          url={url}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default FileMessage;
