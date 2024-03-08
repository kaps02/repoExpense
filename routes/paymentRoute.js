const express = require("express");

const paymentAuth = require("../middleware/auth");

const router = express.Router();

const paymentController = require("../controllers/paymentController");

router.get("/createOrder",paymentAuth.authenticate, paymentController.createPayment);
router.post("/updateOrder",paymentAuth.authenticate, paymentController.updatePayment);
router.get("/userData",paymentAuth.authenticate, paymentController.getUserData);

module.exports = router;