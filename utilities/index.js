const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    console.log(data)
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list += 
            '<a href="/inv/type/' + 
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data) {
    let grid;
    if(data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>';
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
            + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
            + 'details"><img src="' + vehicle.inv_thumbnail 
            +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
            +' on CSE Motors" /></a>';
            grid += '<div class="namePrice">';
            grid += '<hr />';
            grid += '<h2>';
            grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
            grid += '</h2>';
            grid += '<span>$' 
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
            grid += '</div>';
            grid += '</li>';
        })
        grid += '</ul>';
    } else {
        grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    }
    return grid;
}

/* **************************************
* Build the detail view HTML
* ************************************ */
Util.buildInventoryDetails = async function (vehicle) {
    let vehicleName = vehicle.inv_make + ' ' + vehicle.inv_model;
    const numFormat = (num) => new Intl.NumberFormat("en-US").format(num);
    let details = '<div id="vehicle-details">';
    details += '<img src="' + vehicle.inv_image +
    '" alt="Image of ' + vehicleName + ' on CSE Motors" />';
    details += '<article>';
    details += '<h2>' + vehicle.inv_year + ' ' + vehicleName + '</h2>'
    details += '<h3>Price: $' + numFormat(vehicle.inv_price) + '</h3>';
    details += '<ul id="vehicle-info">';
    details += '<li><strong>Milage: </strong>' + numFormat(vehicle.inv_miles) + '</li>';
    details += '<li><strong>Color: </strong>' + vehicle.inv_color + '</li>';
    details += '<li><strong>Description: </strong>' + vehicle.inv_description + '</li>';
    details += '</ul>';
    details += '</article>';
    
    details += '</div>';


    return details;
}

Util.buildClassificationSelectElem = async function (classification_id) {
    let data = await invModel.getClassifications();
    let classSelect = `
    <select id="classification-list" name="classification_id" required>
        <option value="" ${!classification_id ? "selected" : ""} disabled>Select a Classification</option>
    `;
    data.rows.forEach(row => {
        classSelect += `<option value="${row.classification_id}" ${row.classification_id == classification_id ? "selected" : ""}>${row.classification_name}</option>`;
    });
    classSelect += `</select>`;
    return classSelect;
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData) {
                if (err) {
                    req.flash("Please log in");
                    res.clearCookie("jwt");
                    return res.redirect("/account/login");
                }
                res.locals.accountData = accountData;
                res.locals.loggedin = 1;
                next();
            })
    } else {
        next();
    }
}

/* ****************************************
*  Check Login
* ************************************** */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        next();
    } else {
        req.flash("notice-bad", "Please log in.");
        return res.redirect("/account/login");
    }
}

/* ****************************************
*  Check Account Type
* ************************************** */
Util.checkAccountType = (req, res, next) => {
    let acctType = res.locals.accountData.account_type;
    if (acctType === "Employee" || acctType === "Admin") {
        next();
    } else {
        req.flash("notice-bad", "Access denied. Please log in with an authorized account.");
        return res.redirect("/account/login");
    }
}




module.exports = Util