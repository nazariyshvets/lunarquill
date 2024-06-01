import { Router } from "express";

import {
  getContactRelationController,
  getContactByIdController,
  removeContactRelationController,
} from "../controllers/contact";

const router = Router();

router.get("/:userId1/:userId2", getContactRelationController);
router.get("/:id", getContactByIdController);
router.delete("/relation", removeContactRelationController);

export default router;
