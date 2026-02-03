// Needed Resources
const utilities = require('../utilities');
const acctModel = require('../models/account-model');
const bcrypt = require('bcryptjs');


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    res.render("./account/login", {
        title: "Login",
        nav,
        errors: null
    })
}

/* ****************************************
*  Process Login
* *************************************** */
async function loginToAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  const loginResult = await acctModel.verifyLogin(
    account_email,
    account_password
  )

  if (loginResult) {
    req.flash(
      "notice-good",
      `Welcome back, ${loginResult[0].account_firstname}! You're login was successful.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } else {
    req.flash("notice-bad", "Sorry, we cannot log you in at this time. Please try again later.")
    res.status(501).render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  }
}



/* ****************************************
*  Deliver register view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav();
    res.render("./account/register", {
        title: "Register",
        nav,
        errors: null
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

// Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.');
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await acctModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice-good",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    });
  } else {
    req.flash("notice-bad", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    });
  }
}


module.exports = { buildLogin, buildRegister, registerAccount, loginToAccount }