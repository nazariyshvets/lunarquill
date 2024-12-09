import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import archiver from "archiver";

import { uploadFile } from "../middleware/uploadFile";
import { getGridFSBucket } from "../db";
import File from "../models/File";

const uploadFileController = async (req: Request, res: Response) => {
  await uploadFile(req, res);

  const file = req.file;

  if (!file) {
    throw new Error("File is required");
  }

  const fileInfo = await File.findOne({ filename: file.filename });

  return res.status(200).json(fileInfo);
};

const downloadFileController = async (req: Request, res: Response) => {
  const { fileId } = req.params;

  if (!fileId) {
    throw new Error("File id is required");
  }
  if (!ObjectId.isValid(fileId)) {
    throw new Error("Invalid file id");
  }

  const imageBucket = await getGridFSBucket("images");
  const downloadStream = imageBucket.openDownloadStream(new ObjectId(fileId));

  downloadStream.on("file", (file) => {
    res.setHeader(
      "Content-Type",
      file.contentType || "application/octet-stream",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.filename}"`,
    );
  });
  downloadStream.on("error", () => {
    res.end();
  });
  downloadStream.pipe(res).on("finish", () => {
    res.end();
  });
};

const downloadFilesController = async (req: Request, res: Response) => {
  const { fileIds } = req.body;

  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    throw new Error("An array of file ids is required");
  }

  const invalidIds = fileIds.filter((id) => !ObjectId.isValid(id));

  if (invalidIds.length) {
    throw new Error(`Invalid file ids: ${invalidIds.join(", ")}`);
  }

  const imageBucket = await getGridFSBucket("images");
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="files.zip"`);

  archive.on("error", (err) => {
    throw new Error(`Error creating zip archive: ${err.message}`);
  });
  archive.pipe(res);

  for (const fileId of fileIds) {
    const downloadStream = imageBucket.openDownloadStream(new ObjectId(fileId));
    const file = await File.findById(fileId);

    if (!file) {
      throw new Error(`File with id ${fileId} not found`);
    }

    archive.append(downloadStream, { name: `${fileId}_${file.filename}` });
  }

  await archive.finalize();
};

const removeFileController = async (req: Request, res: Response) => {
  const { fileId } = req.params;

  if (!fileId) {
    throw new Error("File id is required");
  }
  if (!ObjectId.isValid(fileId)) {
    throw new Error("Invalid file id");
  }

  const imageBucket = await getGridFSBucket("images");

  await imageBucket.delete(new ObjectId(fileId));

  return res.status(200).json({ message: "The file was deleted successfully" });
};

export {
  uploadFileController,
  downloadFileController,
  downloadFilesController,
  removeFileController,
};
