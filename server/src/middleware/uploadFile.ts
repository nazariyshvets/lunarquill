import * as util from "node:util";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";

const storage = new GridFsStorage({
  url: process.env.DB_URL!,
  file: (_, file) => {
    const filename = `${Date.now()}__${file.originalname}`;

    if (file.mimetype.startsWith("image/"))
      return { bucketName: "images", filename };

    return filename;
  },
});

const uploadFile = util.promisify(multer({ storage }).single("file"));
const uploadFiles = util.promisify(multer({ storage }).array("files", 10));

export { uploadFile, uploadFiles };
