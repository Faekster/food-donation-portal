import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";

// Import routes
import authRoutes from "./routes/auth.js";
import donationRoutes from "./routes/donations.js";
import userRoutes from "./routes/users.js"; // Add this import

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON request bodies

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/users", userRoutes); // Add this line

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Food Donation Portal API is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
