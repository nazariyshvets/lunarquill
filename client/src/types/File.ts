interface File {
  _id: string;
  length: number;
  chunkSize: number;
  uploadDate: Date;
  filename: string;
  contentType: string;
}

export type { File };
