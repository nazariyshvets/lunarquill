import fetchFile from "./fetchFile";
import showToast from "./showToast";

const downloadFile = async (
  url: string,
  fileType: string,
  fileName: string,
) => {
  try {
    const blob = await fetchFile(url, fileType, fileName, true);
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    showToast("error", `Could not download file ${fileName}`);
    console.error(`Error download file ${fileName}:`, err);
  }
};

export default downloadFile;
