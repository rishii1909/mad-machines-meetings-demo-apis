import express from "express";
import mongoose from "mongoose";
import { meetingRouter } from "./routes/meeting"; // Update the path as needed
import { memberRouter } from "./routes/member"; // Update the path as needed
import { roomRouter } from "./routes/room"; // Update the path as needed

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/meetings-demo")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

// Register routes
app.use("/", meetingRouter);
app.use("/", memberRouter);
app.use("/", roomRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
