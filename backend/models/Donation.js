import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  foodItems: [
    {
      name: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        enum: [
          "vegetables",
          "fruits",
          "grains",
          "dairy",
          "protein",
          "prepared",
          "other",
        ],
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        required: true,
      },
      expiryDate: {
        type: Date,
        required: true,
      },
    },
  ],
  pickupAddress: {
    street: String,
    city: String,
    postcode: String,
  },
  pickupTime: {
    from: Date,
    to: Date,
  },
  status: {
    type: String,
    enum: ["available", "claimed", "completed", "cancelled"],
    default: "available",
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Donation = mongoose.model("Donation", donationSchema);

export default Donation;
