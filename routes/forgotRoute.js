const express = require("express");

const router = express.Router();

const passwordController = require("../controllers/passwordController");

//Middleware
//const Auth = require("../middleware/auth");
router.get('/updatepassword/:resetpasswordid', passwordController.updatepassword)

router.get('/resetpassword/:id', passwordController.resetpassword)

router.post("/forgotpassword", passwordController.forgotpassword);

module.exports = router;