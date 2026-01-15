import express from "express";
import {
  getSingleProjectById,
  deleteProject,
  getAllPublishedProject,
  getProjectCodePreview,
  makeRevision,
  roolbackToVersion,
  saveProject,
} from "../controllers/ProjectController.ts";
import { protect } from "../middlewares/auth.ts";

const router = express.Router();

router.route("/revision/:projectId").post(protect, makeRevision);
router.route("/save/:projectId").put(protect, saveProject);
router.route("/rollback/:projectId/:versionId").get(protect, roolbackToVersion);
router.route("/:projectId").delete(protect, deleteProject);
router.route("/preview/:projectId").get(protect, getProjectCodePreview);
router.route("/published/:projectId").get(getSingleProjectById);
router.route("/published").get(getAllPublishedProject);

export default router;
