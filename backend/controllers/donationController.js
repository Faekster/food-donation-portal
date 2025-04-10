import Donation from "../models/Donation.js";
import User from "../models/User.js";

// Create a new donation
export const createDonation = async (req, res) => {
  try {
    const { foodItems, pickupAddress, pickupTime, notes } = req.body;

    // Create new donation
    const donation = new Donation({
      donor: req.user.userId,
      foodItems,
      pickupAddress,
      pickupTime,
      notes,
    });

    await donation.save();

    res.status(201).json({
      message: "Donation created successfully",
      donation,
    });
  } catch (error) {
    console.error("Create donation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all donations (with filtering)
export const getDonations = async (req, res) => {
  try {
    // Filter options based on query parameters
    const filter = {};

    // Filter by status if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // For recipients, show available donations by default
    if (req.user.role === "recipient" && !req.query.recipient) {
      filter.status = "available";
    }

    // For donors, show only their donations
    if (req.user.role === "donor") {
      filter.donor = req.user.userId;
    }

    // If recipient queries their claimed donations
    if (req.user.role === "recipient" && req.query.recipient) {
      filter.recipient = req.user.userId;
    }

    const donations = await Donation.find(filter)
      .populate("donor", "name organization")
      .populate("recipient", "name organization")
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    console.error("Get donations error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a specific donation
export const getDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("donor", "name organization address phone")
      .populate("recipient", "name organization address phone");

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Check if user has permission to view this donation
    if (
      req.user.role === "donor" &&
      donation.donor._id.toString() !== req.user.userId &&
      req.user.role === "recipient" &&
      donation.recipient?._id?.toString() !== req.user.userId &&
      donation.status !== "available"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this donation" });
    }

    res.json(donation);
  } catch (error) {
    console.error("Get donation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update donation status (claim, complete, cancel)
export const updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Get donation
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Validation for updating status
    if (status === "claimed") {
      if (donation.status !== "available") {
        return res
          .status(400)
          .json({ message: "This donation is not available" });
      }

      if (req.user.role !== "recipient") {
        return res
          .status(403)
          .json({ message: "Only recipients can claim donations" });
      }

      // Set recipient to current user
      donation.recipient = req.user.userId;
    } else if (status === "completed") {
      if (donation.status !== "claimed") {
        return res
          .status(400)
          .json({ message: "Donation must be claimed before completion" });
      }

      // Only donor or recipient can mark as completed
      if (
        donation.donor.toString() !== req.user.userId &&
        donation.recipient.toString() !== req.user.userId
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this donation" });
      }
    } else if (status === "cancelled") {
      // Only donor can cancel an available donation
      // Both donor and recipient can cancel a claimed donation
      if (
        donation.status === "available" &&
        donation.donor.toString() !== req.user.userId
      ) {
        return res
          .status(403)
          .json({ message: "Only the donor can cancel this donation" });
      } else if (
        donation.status === "claimed" &&
        donation.donor.toString() !== req.user.userId &&
        donation.recipient.toString() !== req.user.userId
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to cancel this donation" });
      }

      // Clear recipient if cancelling a claimed donation
      if (donation.status === "claimed") {
        donation.recipient = null;
      }
    }

    // Update donation
    donation.status = status;
    await donation.save();

    res.json({
      message: `Donation ${status} successfully`,
      donation,
    });
  } catch (error) {
    console.error("Update donation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete donation
export const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Only donor can delete their own donation
    if (donation.donor.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this donation" });
    }

    // Only available donations can be deleted
    if (donation.status !== "available") {
      return res
        .status(400)
        .json({ message: "Cannot delete a donation that is not available" });
    }

    await donation.remove();

    res.json({ message: "Donation deleted successfully" });
  } catch (error) {
    console.error("Delete donation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
