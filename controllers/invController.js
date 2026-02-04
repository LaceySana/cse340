const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    try {
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
    } catch (error) {
        console.error("buildByClassificationId error " + error);
    }
   
}

/* ***************************
 *  Build vehicle details by inventory ID view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
    const inventory_id = req.params.inventoryId;
    const data = await invModel.getDetailsByInventoryId(inventory_id);
    const details = await utilities.buildInventoryDetails(data);
    let nav = await utilities.getNav();
    const vehicleName = data.inv_make + " " + data.inv_model;
    res.render("./inventory/detail", {
        title: vehicleName + " details",
        nav,
        details,
    });
}

invCont.buildManagement = async function (req, res, next) {
    let nav = await utilities.getNav();
    res.render("./inventory/management", {
        title: "Management View",
        nav,
        errors: null
    });
}

invCont.buildAddClassification = async function (req, res, next) {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null
    });
}

invCont.addNewClassification = async function (req, res) {
    let nav = await utilities.getNav();
    const { classification_name } = req.body;

    const insertResults = await invModel.insertNewClassification(classification_name);

    if (insertResults) {
        req.flash("notice-good", `${classification_name} has been added to classifications.`);
        res.status(201).render("./inventory/management", {
            title: "Management View",
            nav,
            errors: null
        });
    } else {
        req.flash("notice-bad", `${classification_name} is not valid. Please try a different classification name.`);
        res.status(201).render("./inventory/add-classification", {
            title: "Add New Classification",
            nav,
            errors: null
        });
    }
}

invCont.buildAddInventory = async function (req, res, next) {
    let nav = await utilities.getNav();
    let classifications = await utilities.getClassificationSelectOpts();
    res.render("./inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classifications,
        errors: null
    });
}

invCont.addNewInventory = async function (req, res) {
    let nav = await utilities.getNav();
    
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;
    let classifications = await utilities.getClassificationSelectOpts(classification_id);
    
    const insertResults = await invModel.insertNewInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id);

    if (insertResults) {
        req.flash("notice-good", `${inv_make} ${inv_model} has been added to the inventory.`);
        res.status(201).render("./inventory/management", {
            title: "Management View",
            nav,
            errors: null
        });
    } else {
        req.flash("notice-bad", `Unable to add ${inv_make} ${inv_model} to the inventory. Please try again.`);
        res.status(201).render("./inventory/add-inventory", {
            title: "Add New Vehicle",
            nav,
            classifications,
            errors: null
        });
    }
}

module.exports = invCont;