import express from "express";
import {
  createNewProject,
  getUserCredits,
  getUserProject,
  getUserProjects,
  purchaseCredit,
  togglePublish,
} from "../controllers/userController.ts";
import { protect } from "../middlewares/auth.ts";

const router = express.Router();

router.route("/credits").get(protect, getUserCredits);
router.route("/project").post(protect, createNewProject);
router.route("/project/:projectId").get(protect, getUserProject);
router.route("/projects").get(protect, getUserProjects);
router.route("/publish-toggle/:projectId").get(protect, togglePublish);

router.route("/purchase-credit").post(protect, purchaseCredit);

export default router;
