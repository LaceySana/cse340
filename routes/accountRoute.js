// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const acctController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation");

router.get("/login", acctController.buildLogin)
router.get("/register", acctController.buildRegister)
// Route for register form action
router.post(
    "/register", 
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(acctController.registerAccount)
)

module.exports = router;