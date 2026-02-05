// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const acctController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation");

router.get("/login", acctController.buildLogin)
// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(acctController.loginToAccount)
)
router.get("/register", acctController.buildRegister)
// Route for register form action
router.post(
    "/register", 
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(acctController.registerAccount)
)
// Route for account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(acctController.buildAcctManagement))

module.exports = router;