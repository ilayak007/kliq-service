const express = require("express");
const { getAllCreators, getTopCreators, addCreator } = require("../controllers/creatorController");

const router = express.Router();

router.get("/", getAllCreators);
router.post("/", addCreator);
router.get('/top', getTopCreators);

module.exports = router;
