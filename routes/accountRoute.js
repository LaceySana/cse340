// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require('../utilities')
const acctController = require("../controllers/accountController")

router.get("/login", acctController.buildLogin)
router.get("/register", acctController.buildRegister)
// Route for register form action
router.post('/register', utilities.handleErrors(acctController.registerAccount))

module.exports = router;