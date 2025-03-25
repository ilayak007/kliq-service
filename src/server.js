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
const matchRoutes = require('./routes/matchRoutes');
const predictionsRoute = require('./routes/predictions');
const customerSummaryRoute = require('./routes/customerSummaryRoutes');
const customersDashboardRoute = require('./routes/customersDashboardRoutes');
const loginRoute = require('./routes/loginRoutes');
const changePasswordRoute = require('./routes/changePasswordRoute');
const getDetailedSummarydRoute = require('./routes/detailedSummaryRoute');
const updateMatchResultRoute = require('./routes/updateMatchResultRoute');
const updateCustomerRoute  = require("./routes/updateCustomerRoute");

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => res.send("Kliq Service is running!"));

// API Routes
app.use("/campaigns", campaignRoutes);
app.use("/creators", creatorRoutes);
app.use("/invited-creators", invitedCreatorRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionsRoute);
app.use('/api/customer', customerSummaryRoute);
app.use('/api/customers', customersDashboardRoute);
app.use('/api/customer',loginRoute);
app.use('/api/customer',changePasswordRoute);
app.use('/api',getDetailedSummarydRoute);
app.use('/api',updateMatchResultRoute);
app.use('/api',updateCustomerRoute);



const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
