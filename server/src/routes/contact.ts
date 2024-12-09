import { Router } from "express";

import {
  getContactRelationController,
  getContactByIdController,
  removeContactRelationController,
} from "../controllers/contact";

const router = Router();

router.delete("/relation", removeContactRelationController);
router.get("/:userId1/:userId2", getContactRelationController);
router.get("/:id", getContactByIdController);

export default router;
