// Needed Resources
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const msgController = require("../controllers/messageController");

// build inbox view route
router.get("/inbox", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(msgController.buildInbox));
// build sent messages view route
router.get("/sent", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(msgController.buildSent));
// Route to get message data
router.get("/getMessage/:msg_id", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(msgController.getMessageJSON));
// build create new message view route
router.get("/new-message", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(msgController.buildNewMessage));
// create new message route
router.post("/new-message", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(msgController.sendNewMessage));
// build create msg reply view route
router.get("/reply/:conversation_id", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(msgController.buildReply));
// create msg reply route
router.post("/reply", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(msgController.sendReply));
// delete msg route
router.get("/delete/:msg_id", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(msgController.deleteMessageForAccount));



module.exports = router;