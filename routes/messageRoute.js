// Needed Resources
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const msgController = require("../controllers/messageController");

// build inbox view route
router.get("/inbox", utilities.checkLogin, utilities.handleErrors(msgController.buildInbox));
// build sent messages view route
router.get("/sent", utilities.checkLogin, utilities.handleErrors(msgController.buildSent));
// Route to get message data
router.get("/getMessage/:msg_id", utilities.handleErrors(msgController.getMessageJSON));
// build create new message view route
router.get("/new-message", utilities.checkLogin, utilities.handleErrors(msgController.buildNewMessage));
// create new message route
router.post("/new-message", utilities.checkLogin, utilities.handleErrors(msgController.sendNewMessage));


module.exports = router;