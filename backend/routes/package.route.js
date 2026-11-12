import express from "express";
import { isAdmin, requireSignIn, optionalAuth, markAdmin } from "../middlewares/authMiddleware.js";
import {
  createPackage,
  deletePackage,
  getPackageData,
  getPackageFilters,
  getPackages,
  updatePackage,
} from "../controllers/package.controller.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/create-package", requireSignIn, isAdmin, upload.array("packageImages", 10), createPackage);
router.post("/update-package/:id", requireSignIn, isAdmin, upload.array("packageImages", 10), updatePackage);
router.delete("/delete-package/:id", requireSignIn, isAdmin, deletePackage);

// admins (?admin=1) also see hidden packages
router.get("/get-packages", optionalAuth, markAdmin, getPackages);
router.get("/filters", getPackageFilters);
// accepts a Mongo id or a slug
router.get("/get-package-data/:id", optionalAuth, markAdmin, getPackageData);

export default router;
