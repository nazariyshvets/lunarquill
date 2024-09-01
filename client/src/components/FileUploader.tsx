import { useDropzone, DropzoneOptions } from "react-dropzone";
import { BiCloudUpload } from "react-icons/bi";

import formatBytes from "../utils/formatBytes";

interface FileUploaderProps extends DropzoneOptions {
  type: "image" | "video";
}

const FileUploader = ({ type, ...dropzoneOptions }: FileUploaderProps) => {
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: { [`${type}/*`]: [] },
    ...dropzoneOptions,
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
