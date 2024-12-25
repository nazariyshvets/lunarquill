import {
  useDropzone,
  DropzoneOptions,
  FileRejection,
  ErrorCode,
} from "react-dropzone";
import { BiCloudUpload } from "react-icons/bi";

import formatBytes from "../utils/formatBytes";
import showToast from "../utils/showToast";
import { MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from "../constants/constants";

interface FileUploaderProps
  extends Omit<DropzoneOptions, "accept" | "maxSize" | "onDropRejected"> {
  type: "image" | "video";
}

const FileUploader = ({ type, ...dropzoneOptions }: FileUploaderProps) => {
  const handleDropRejected = (rejections: FileRejection[]) => {
    rejections.forEach((rejection) =>
      rejection.errors.forEach((error) =>
        showToast(
          "info",
          error.code === ErrorCode.FileTooSmall ||
            error.code === ErrorCode.FileTooLarge
            ? error.message.replace(/(\d+)\s*bytes/, (match) =>
                formatBytes(parseInt(match, 10)),
              )
            : error.message,
        ),
      ),
    );
    console.error(rejections);
  };

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    ...dropzoneOptions,
    accept: { [`${type}/*`]: [] },
    maxSize: type === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE,
    onDropRejected: handleDropRejected,
  });

  return (
    <div
      {...getRootProps()}
      className="relative flex h-16 w-full cursor-pointer justify-center rounded border-2 border-dashed border-white bg-charcoal p-3 text-white transition-colors hover:border-primary-light hover:text-primary-light sm:h-20 sm:p-4"
    >
      <input {...getInputProps()} />
      <BiCloudUpload className="h-full w-full" />
      <div className="absolute left-0 top-full flex w-full flex-col gap-1 py-1 text-xs text-white sm:text-sm">
        {acceptedFiles.map(({ name, size }) => (
          <div key={`${name}-${size}`} className="flex gap-1">
            <span className="truncate">{name}</span>
            <span>&ndash;</span>
            <span className="flex-shrink-0">{formatBytes(size)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploader;
