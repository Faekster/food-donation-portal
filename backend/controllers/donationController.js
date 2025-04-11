import Donation from "../models/Donation.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

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

    // Create notifications for recipients
    try {
      const recipients = await User.find({ role: "recipient" });
      for (const recipient of recipients) {
        await createNotification(
          recipient._id,
          "donation_created",
          "New Donation Available",
          `A new donation of ${foodItems.length} items is available in ${pickupAddress.city}.`,
          donation._id.toString()
        );
      }
    } catch (notifyError) {
      console.error("Error creating notifications:", notifyError);
      // Continue with response even if notifications fail
    }

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

    // Create notifications based on status change
    try {
      if (status === "claimed") {
        // Notify donor that their donation was claimed
        await createNotification(
          donation.donor.toString(),
          "donation_claimed",
          "Donation Claimed",
          `Your donation has been claimed by ${
            req.user.name || "a recipient"
          }.`,
          donation._id.toString()
        );
      } else if (status === "completed") {
        // Notify both parties
        if (donation.donor.toString() !== req.user.userId) {
          // Notify donor
          await createNotification(
            donation.donor.toString(),
            "donation_completed",
            "Donation Completed",
            `Your donation has been marked as completed.`,
            donation._id.toString()
          );
        }

        if (
          donation.recipient &&
          donation.recipient.toString() !== req.user.userId
        ) {
          // Notify recipient
          await createNotification(
            donation.recipient.toString(),
            "donation_completed",
            "Donation Completed",
            `A donation you claimed has been marked as completed.`,
            donation._id.toString()
          );
        }
      } else if (status === "cancelled") {
        // Notify the other party
        if (donation.status === "claimed" && donation.recipient) {
          if (donation.donor.toString() === req.user.userId) {
            // Donor cancelled, notify recipient
            await createNotification(
              donation.recipient.toString(),
              "donation_cancelled",
              "Donation Cancelled",
              `A donation you claimed has been cancelled by the donor.`,
              donation._id.toString()
            );
          } else if (donation.recipient.toString() === req.user.userId) {
            // Recipient cancelled, notify donor
            await createNotification(
              donation.donor.toString(),
              "donation_cancelled",
              "Claim Cancelled",
              `A claim on your donation has been cancelled by the recipient.`,
              donation._id.toString()
            );
          }
        }
      }
    } catch (notifyError) {
      console.error("Error creating status change notifications:", notifyError);
      // Continue with response even if notifications fail
    }

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

    await Donation.findByIdAndDelete(req.params.id);

    res.json({ message: "Donation deleted successfully" });
  } catch (error) {
    console.error("Delete donation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
