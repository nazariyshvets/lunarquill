import { Router } from "express";

import {
  uploadFileController,
  downloadFileController,
  downloadFilesController,
  removeFileController,
} from "../controllers/file";

const router = Router();

router.post("/", uploadFileController);
router.get("/:fileId/download", downloadFileController);
router.post("/download", downloadFilesController);
router.delete("/:fileId", removeFileController);

export default router;
