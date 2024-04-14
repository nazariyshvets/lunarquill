import axios from "axios";

const fetchFile = async (url: string, fileType: string, fileName: string) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const blob = new Blob([response.data], { type: fileType });

    return new File([blob], fileName, { type: fileType });
  } catch (err) {
    console.log("Error fetching the audio file:", err);

    throw err;
  }
};

export default fetchFile;
