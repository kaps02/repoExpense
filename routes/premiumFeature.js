const express = require("express");

const premiumAuth = require("../middleware/auth");

const router = express.Router();

const premiumController = require("../controllers/premiumFeature");

router.get("/leaderboard", premiumAuth.authenticate , premiumController.showLeaderBoard);

module.exports = router;