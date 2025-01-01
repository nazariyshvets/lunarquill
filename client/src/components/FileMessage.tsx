import { useState } from "react";

import { BiFile, BiCloudDownload } from "react-icons/bi";

import MediaModal from "./MediaModal";
import formatBytes from "../utils/formatBytes";
import isSupportedFileType from "../utils/isSupportedFileType";
import truncateFileName from "../utils/truncateFileName";
import downloadFile from "../utils/downloadFile";
import stopEventPropagation from "../utils/stopEventPropagation";

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

  const handleFileDownload = () =>
    downloadFile(url, fileType, fileName || `file__${Date.now()}`);

  const isSupportedType = isSupportedFileType(fileType);

  return (
    <>
      <div
        className={`flex max-w-full items-center gap-2 overflow-hidden rounded border border-white p-2 text-white transition-colors ${
          isSupportedType ? "cursor-pointer" : ""
        }`}
        onClick={() => isSupportedType && setIsOpen(true)}
      >
        <BiFile className="flex-shrink-0 text-xl sm:text-2xl" />
        <div className="flex flex-col gap-0.5 overflow-hidden">
          <span className="max-w-full truncate text-xs sm:text-sm">
            {fileName ? truncateFileName(fileName, 12) : "unknown"}
          </span>
          <span className="text-lightgrey text-2xs sm:text-xs">
            {fileSize ? formatBytes(fileSize) : "unknown"}
          </span>
        </div>
        <BiCloudDownload
          className="flex-shrink-0 text-xl hover:text-primary-light sm:text-2xl"
          onClick={stopEventPropagation(handleFileDownload)}
        />
      </div>
      {isOpen && isSupportedType && (
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
