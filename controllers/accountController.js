// Needed Resources
const utilities = require('../utilities');
const acctModel = require('../models/account-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require("dotenv").config();


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    res.render("./account/login", {
        title: "Login",
        nav,
        errors: null
    });
}

/* ****************************************
*  Process Login
* *************************************** */
async function loginToAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_email, account_password } = req.body;

    const accountData = await acctModel.getAccountByEmail(account_email);

    if (!accountData) {
        req.flash("notice-bad", "Please check your credentials and try again.");
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        });
        return;
    } 
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password;
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
            if (process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
            }
            return res.redirect("/account/");
        }
        else {
            req.flash("message notice-bad", "Please check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        throw new Error('Access Forbidden')
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


/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAcctManagement(req, res, next) {
    let nav = await utilities.getNav();
    res.render("./account/management", {
        title: "My Account",
        nav,
        errors: null
    })
}


/* ****************************************
*  Deliver update account view
* *************************************** */
async function buildUpdateAccount(req, res, next) {
    const account_id = parseInt(req.params.account_id);
    const acctDetails = res.locals.accountData;
    let nav = await utilities.getNav();
    console.log(res.locals);
    res.render("./account/update", {
        title: "Update Account Information",
        nav,
        errors: null,
        account_id,
        account_firstname: acctDetails.account_firstname,
        account_lastname: acctDetails.account_lastname,
        account_email: acctDetails.account_email,
    })
}

/* ****************************************
*  Process Account Update
* *************************************** */
async function updateAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_id, account_firstname, account_lastname, account_email } = req.body;

    const updateResult = await acctModel.updateAccount(
        account_id,
        account_firstname,
        account_lastname,
        account_email
    );

    if (updateResult) {
        req.flash(
            "notice-good",
            `Congratulations ${updateResult.account_firstname}, your account has been updated.`
        );
        const accountData = await acctModel.getAccountByEmail(account_email);
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
        if (process.env.NODE_ENV === 'development') {
            res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
        } else {
            res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
        }
        return res.redirect("/account/");
        // res.render("./account/management", {
        //     title: "My Account",
        //     nav,
        //     errors: null
        // })
    } else {
        req.flash("notice-bad", "Sorry, the update failed.");
        res.status(501).render("account/update", {
            title: "Update Account Information",
            nav,
            errors: null
        });
    }
}

/* ****************************************
*  Process Change Password
* *************************************** */
async function changePassword(req, res) {
    let nav = await utilities.getNav();
    const account_id = req.body.account_id;
    const account_password = req.body.account_password;
// Hash the password before storing
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hashSync(account_password, 10);
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error updating your password.');
        res.status(500).render("account/update", {
          title: "Update Account Information",
          nav,
          errors: null,
        });
    }

    const updateResult = acctModel.changePassword(account_id, hashedPassword);

    if (updateResult) {
        req.flash(
            "notice-good",
            `Congratulations, your password has been updated.`
        );
        res.status(201).render("account/management", {
            title: "My Account",
            nav,
            errors: null
        });
    } else {
        req.flash("notice-bad", "Sorry, the update failed.");
        res.status(501).render("account/update", {
            title: "Update Account Information",
            nav,
            errors: null,
        });
    }
}

/* ****************************************
*  Process Logout of Account
* *************************************** */
async function accountLogout(req, res) {
    try {
        res.clearCookie("jwt");
    } catch (error) {
        return error.message;
    }
    req.flash("notice-good", "You have successfully logged out.")
    res.redirect("/");
}

module.exports = { buildLogin, buildRegister, registerAccount, loginToAccount, buildAcctManagement, buildUpdateAccount, updateAccount, changePassword, accountLogout }