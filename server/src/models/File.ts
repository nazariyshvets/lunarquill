import { Schema, model, Document } from "mongoose";

interface IFile extends Document {
  length: number;
  chunkSize: number;
  uploadDate: Date;
  filename: string;
  contentType: string;
}

const FileSchema = new Schema<IFile>(
  {
    length: { type: Number, required: true },
    chunkSize: Number,
    uploadDate: { type: Date, default: Date.now },
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
  },
  { collection: "images.files" },
);

const File = model<IFile>("File", FileSchema);

export default File;
export type { IFile };
