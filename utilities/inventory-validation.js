const utilities = require(".");
const { body, validationResult} = require("express-validator");
const inventoryModel = require("../models/inventory-model");
const validate = {};


/*  **********************************
*  Rules for adding new classification
* ********************************* */
validate.newClassificationRules = () => {
    return [
        // classification name is required and must be only alphabetic characters
        body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a classification name.")
        .isLength({ min: 2 })
        .withMessage("Classification name must be at least 2 characters.")
        .isAlpha()
        .withMessage("Classification name must only contain alphabetic characters.")
    ];
}

/*  **********************************
*  Check and return errors or continue
* ********************************* */
validate.checkClassName = async (req, res, next) => {
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("./inventory/add-classification", {
            errors,
            title: "Add New Classification",
            nav,
        })
        return;
    }
    next();
}


/*  **********************************
*  Rules for adding new inventory item
* ********************************* */
validate.newInventoryRules = () => {
    return [
        // 
        body("inv_make")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide the vehicle's make.")
        .isLength({ min: 3 })
        .withMessage("Vehicle's make must be at least 3 characters."),
        // 
        body("inv_model")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide the vehicle's model.")
        .isLength({ min: 3 })
        .withMessage("Vehicle's model must be at least 3 characters."),
        // 
        body("inv_year")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide the vehicle's year.")
        .isNumeric()
        .withMessage("Vehicle's year must be numeric.")
        .isLength({ min: 4, max: 4 })
        .withMessage("Vehicle's year must be 4 digits."),
        // 
        body("inv_description")
        .trim()
        .notEmpty()
        .withMessage("Please provide a vehicle description.")
        .isLength({ min: 10, max: 200 })
        .withMessage("Vehicle's description must be between 10-200 characters."),
        // 
        body("inv_image")
        .trim()
        .notEmpty()
        .withMessage("Please provide an image file path for the vehicle.")
        .matches("^\/images\/vehicles\/[A-Za-z0-9_\-]+\.(png|jpg|jpeg|gif|webp)$")
        .withMessage("Image path is invalid."),
        // 
        body("inv_thumbnail")
        .trim()
        .notEmpty()
        .withMessage("Please provide a thumbnail image file path for the vehicle.")
        .matches("^\/images\/vehicles\/[A-Za-z0-9_\-]+\.(png|jpg|jpeg|gif|webp)$")
        .withMessage("Thumbnail image path is invalid."),
        // 
        body("inv_price")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide the vehicle's price.")
        .isCurrency({require_symbol: false, allow_decimal: true, digits_after_decimal: [0, 1, 2]})
        .withMessage("Invalid vehicle price."),
        // 
        body("inv_miles")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide the vehicle's miles.")
        .isNumeric()
        .withMessage("Vehicle's miles must be a number.")
        .isFloat({min: 0})
        .withMessage("Vehicle's miles cannot be less than 0."),
        // 
        body("inv_color")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide the vehicle's color.")
        .isLength({ min: 3 })
        .withMessage("Vehicle's color must be at least 3 characters."),
        // 
        body("classification_id")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide the vehicle's classification.")
    ];
}

/*  **********************************
*  Check and return errors or continue
* ********************************* */
validate.checkInventoryData = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        let classificationSelect = await utilities.buildClassificationSelectElem(classification_id);
        res.render("./inventory/add-inventory", {
            errors,
            title: "Add New Vehicle",
            nav,
            classificationSelect,
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
        })
        return;
    }
    next();
}

/*  **********************************
*  Check and return errors or continue
* ********************************* */
validate.checkUpdateData = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_id } = req.body;
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        let classificationSelect = await utilities.buildClassificationSelectElem(classification_id);
        const name = `${inv_make} ${inv_model}`; 
        res.render("./inventory/edit-inventory", {
            errors,
            title: "Edit " + name,
            nav,
            classificationSelect,
            inv_make, 
            inv_model, 
            inv_year, 
            inv_description, 
            inv_image, 
            inv_thumbnail, 
            inv_price, 
            inv_miles, 
            inv_color, 
            classification_id,
            inv_id
        })
        return;
    }
    next();
}

module.exports = validate;