import type SupportedFileType from "../types/SupportedFileType";

const isSupportedFileType = (fileType: string): fileType is SupportedFileType =>
  ["img", "video", "pdf", "txt"].includes(fileType);

export default isSupportedFileType;
