const getFileDataUrls = async (files: Blob[]) => {
  try {
    const fileReaders: Promise<string>[] = [];

    files.forEach((file) => {
      const fileReader = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64Data = reader.result as string;
          const mimeType =
            base64Data.match(/^data:(.*?);base64/)?.[1] || "image/jpeg";
          const base64String = `data:${mimeType};base64,${
            base64Data.split(",")[1]
          }`;

          resolve(base64String);
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      fileReaders.push(fileReader);
    });

    return await Promise.all(fileReaders);
  } catch (error) {
    console.error("Error getting file data urls:", error);
    return [];
  }
};

export default getFileDataUrls;
