import axios from "axios";

const fetchAudioFile = async (url: string, fileName: string) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const blob = new Blob([response.data], { type: "audio/mp3" });
    const audioFile = new File([blob], fileName, { type: "audio/mp3" });

    return audioFile;
  } catch (err) {
    console.log("Error fetching the audio file:", err);
    throw err;
  }
};

export default fetchAudioFile;
