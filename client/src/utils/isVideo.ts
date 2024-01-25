const isVideo = (file: File) => {
  return file.type.startsWith("video/");
};

export default isVideo;
