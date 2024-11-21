import JSZip from "jszip";

const extractFilesFromBlob = async (blob: Blob) => {
  const zip = new JSZip();

  try {
    const zipContent = await zip.loadAsync(blob);
    const filesArray: { name: string; data: Blob }[] = [];

    await Promise.all(
      Object.keys(zipContent.files).map(async (filename) => {
        const file = zipContent.files[filename];

        if (!file.dir) {
          const fileData = await file.async("blob");
          filesArray.push({ name: filename, data: fileData });
        }
      }),
    );

    return filesArray;
  } catch (error) {
    console.error("Error extracting files from ZIP:", error);
    return [];
  }
};

export default extractFilesFromBlob;
