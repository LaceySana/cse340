const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    });
}

/* ***************************
 *  Build inventory by ID view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
    const inventory_id = req.params.inventoryId;
    const data = await invModel.getDetailsByInventoryId(inventory_id);
    console.log(data);
    const details = await utilities.buildInventoryDetails(data);
    let nav = await utilities.getNav();
    const vehicleName = data.inv_make + " " + data.inv_model;
    res.render("./inventory/detail", {
        title: vehicleName + " details",
        nav,
        details,
    })
}

module.exports = invCont;