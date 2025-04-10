import express from "express";
import {
  updateProfile,
  changePassword,
} from "../controllers/userController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// All user routes require authentication
router.use(auth);

// Update profile route
router.put("/profile", updateProfile);

// Change password route
router.put("/password", changePassword);

export default router;
