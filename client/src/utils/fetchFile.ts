import axios from "axios";

const fetchFile = async (
  url: string,
  fileType: string,
  fileName: string,
  isBlob = false,
) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const blob = new Blob([response.data], { type: fileType });

  if (isBlob) {
    return blob;
  }

  return new File([blob], fileName, { type: fileType });
};

export default fetchFile;
