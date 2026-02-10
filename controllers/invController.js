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
        const classData = await invModel.getClassifications();
        const thisClass = classData.rows.filter(classification => classification.classification_id == classification_id);
        const className = thisClass[0].classification_name;
        
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
    const classificationSelect = await utilities.buildClassificationSelectElem();
    res.render("./inventory/management", {
        title: "Management View",
        nav,
        classificationSelect,
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
    let classificationSelect = await utilities.buildClassificationSelectElem();
    res.render("./inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationSelect,
        errors: null
    });
}

/* ***************************
 *  Add new inventory item
 * ************************** */
invCont.addNewInventory = async function (req, res) {
    let nav = await utilities.getNav();
    
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;
    
    const insertResults = await invModel.insertNewInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id);
    
    if (insertResults) {
        let classificationSelect = await utilities.buildClassificationSelectElem();
        req.flash("notice-good", `${inv_make} ${inv_model} has been added to the inventory.`);
        res.status(201).render("./inventory/management", {
            title: "Management View",
            nav,
            classificationSelect,
            errors: null
        });
    } else {
        let classificationSelect = await utilities.buildClassificationSelectElem(classification_id);
        req.flash("notice-bad", `Unable to add ${inv_make} ${inv_model} to the inventory. Please try again.`);
        res.status(201).render("./inventory/add-inventory", {
            title: "Add New Vehicle",
            nav,
            classificationSelect,
            errors: null
        });
    }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id);
    const invData = await invModel.getInventoryByClassificationId(classification_id);
    if (invData[0].inv_id) {
        return res.json(invData);
    } else {
        next(new Error("No data returned"));
    }
}

/* ***************************
 *  Build edit inventory info view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id);
    
    let nav = await utilities.getNav();
    const vehicleData = await invModel.getDetailsByInventoryId(inv_id);
    const name = `${vehicleData.inv_make} ${vehicleData.inv_model}`; 
    const classificationSelect = await utilities.buildClassificationSelectElem(vehicleData.classification_id);
    
    res.status(201).render("./inventory/edit-inventory", {
        title: "Edit " + name,
        nav,
        classificationSelect,
        errors: null,
        inv_id: vehicleData.inv_id,
        inv_make: vehicleData.inv_make,
        inv_model: vehicleData.inv_model,
        inv_year: vehicleData.inv_year,
        inv_description: vehicleData.inv_description,
        inv_image: vehicleData.inv_image,
        inv_thumbnail: vehicleData.inv_thumbnail,
        inv_price: vehicleData.inv_price,
        inv_miles: vehicleData.inv_miles,
        inv_color: vehicleData.inv_color,
        classification_id: vehicleData.classification_id
    });
}

/* ***************************
 *  Update inventory data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
    let nav = await utilities.getNav();
    
    const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;
    
    const updateResult = await invModel.updateInventory(inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id);
    
    if (updateResult) {
        const itemName = updateResult.inv_make + " " + updateResult.inv_model;
        req.flash("notice-good", `The ${itemName} was successfully updated.`);
        res.redirect("/inv/");
    } else {
        const classificationSelect = await utilities.buildClassificationSelectElem(classification_id);
        const itemName = `${inv_make} ${inv_model}`;
        req.flash("notice-bad", `Sorry, the update failed. Please try again.`);
        res.status(501).render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationSelect,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        });
    }
}

/* ***************************
 *  Build delete vehicle view
 * ************************** */
invCont.deleteConfirmation = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id);
    
    let nav = await utilities.getNav();
    const vehicleData = await invModel.getDetailsByInventoryId(inv_id);
    const name = `${vehicleData.inv_make} ${vehicleData.inv_model}`; 
    
    res.status(201).render("./inventory/delete-confirm", {
        title: "Delete " + name,
        nav,
        errors: null,
        inv_id: vehicleData.inv_id,
        inv_make: vehicleData.inv_make,
        inv_model: vehicleData.inv_model,
        inv_year: vehicleData.inv_year,
        inv_price: vehicleData.inv_price,
    });
}

/* ***************************
 *  Delete vehicle
 * ************************** */
invCont.deleteVehicle = async function (req, res, next) {
    let nav = await utilities.getNav();
    
    const inv_id = parseInt(req.body.inv_id);
    
    const deleteResult = await invModel.deleteVehicle(inv_id);
    
    if (deleteResult) {
        req.flash("notice-good", `The deletion was successful.`);
        res.redirect("/inv/");
    } else {
        req.flash("notice-bad", `Sorry, the deletion failed. Please try again.`);
        res.redirect(`delete/${inv_id}`);
    }
}






module.exports = invCont;