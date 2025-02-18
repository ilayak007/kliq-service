require("dotenv").config();
const express = require("express");
const cors = require("cors");

const campaignRoutes = require("./routes/campaignRoutes");
const creatorRoutes = require("./routes/creatorRoutes");
const invitedCreatorRoutes = require("./routes/invitedCreatorRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Kliq Service is running!"));

// Use routes
app.use("/campaigns", campaignRoutes);
app.use("/creators", creatorRoutes);
app.use("/invited-creators", invitedCreatorRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
