import { Router } from "express";

import {
  uploadFileController,
  downloadFileController,
  downloadFilesController,
  removeFileController,
} from "../controllers/file";

const router = Router();

router.post("/", uploadFileController);
router.post("/download", downloadFilesController);
router.get("/:fileId/download", downloadFileController);
router.delete("/:fileId", removeFileController);

export default router;
