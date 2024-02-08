const getBlobFromFile = (file: File) => {
  const blob = file.slice(0, file.size, file.type);
  return new Blob([blob], { type: file.type });
};

export default getBlobFromFile;
