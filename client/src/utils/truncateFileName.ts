const truncateFileName = (fileName: string, maxLength = 20) => {
  const extensionMatch = fileName.match(/\.[^.]+$/);
  const extension = extensionMatch ? extensionMatch[0] : "";
  const baseName = fileName.slice(0, fileName.length - extension.length);

  return fileName.length <= maxLength
    ? fileName
    : `${baseName.slice(0, maxLength - 3 - extension.length)}...${extension}`;
};

export default truncateFileName;
