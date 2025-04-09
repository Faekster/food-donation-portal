import express from "express";
import {
  register,
  login,
  getCurrentUser,
} from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Register route - POST /api/auth/register
router.post("/register", register);

// Login route - POST /api/auth/login
router.post("/login", login);

// Get current user route (protected) - GET /api/auth/me
router.get("/me", auth, getCurrentUser);

export default router;
