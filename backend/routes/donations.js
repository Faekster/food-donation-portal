import express from "express";
import {
  createDonation,
  getDonations,
  getDonation,
  updateDonationStatus,
  deleteDonation,
} from "../controllers/donationController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// All donation routes require authentication
router.use(auth);

// Create donation route (donor only)
router.post("/", createDonation);

// Get all donations route
router.get("/", getDonations);

// Get specific donation route
router.get("/:id", getDonation);

// Update donation status route
router.patch("/:id/status", updateDonationStatus);

// Delete donation route
router.delete("/:id", deleteDonation);

export default router;
