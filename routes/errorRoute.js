// Needed Resources
const express = require("express")
const router = new express.Router()
const errorController = require("../controllers/errorController")

// Route to build error  view
router.get("/", errorController.triggerError);

module.exports = router;