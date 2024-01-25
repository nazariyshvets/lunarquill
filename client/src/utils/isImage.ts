const isImage = (file: File) => {
  return file.type.startsWith("image/");
};

export default isImage;
