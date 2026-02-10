// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const acctController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation");
// Route to build login view
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
// Route to build update account information view
router.get("/update/:account_id", utilities.handleErrors(acctController.buildUpdateAccount))
// Route to update account information
router.post(
    "/update", 
    regValidate.updateRules(),
    regValidate.checkUpdateData,
    utilities.handleErrors(acctController.updateAccount)
)
// Route to change password
router.post(
    "/update/password", 
    regValidate.passwordRules(),
    regValidate.checkPasswordData,
    utilities.handleErrors(acctController.changePassword)
)
// Route to process logout
router.get("/logout", utilities.handleErrors(acctController.accountLogout))

module.exports = router;