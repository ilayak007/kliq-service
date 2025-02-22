/**
 * Kliq Service - Main Server File
 * Sets up Express server with routes, middlewares, and error handling.
 * 
 * Author: Ilayaraja Kasirajan
 * Created On: 18-Feb-2025
 * Last Updated: 20-Feb-2025
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const campaignRoutes = require("./routes/campaignRoutes");
const creatorRoutes = require("./routes/creatorRoutes");
const invitedCreatorRoutes = require("./routes/invitedCreatorRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => res.send("Kliq Service is running!"));

// API Routes
app.use("/campaigns", campaignRoutes);
app.use("/creators", creatorRoutes);
app.use("/invited-creators", invitedCreatorRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
