// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require('../utilities/');
const invValidation = require('../utilities/inventory-validation');
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
// Route to build detail view for inventory item
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));
// Route to build management view
router.get("/", utilities.handleErrors(invController.buildManagement));
// Route to build add new classification view
router.get("/addClass", utilities.handleErrors(invController.buildAddClassification));
// Route to build add new classification view
router.post(
    "/addClass", 
    invValidation.newClassificationRules(),
    invValidation.checkClassName,
    utilities.handleErrors(invController.addNewClassification),
);
// Route to build add new inventory view
router.get("/addInv", utilities.handleErrors(invController.buildAddInventory));
// Route to build add new inventory view
router.post(
    "/addInv", 
    invValidation.newInventoryRules(),
    invValidation.checkInventoryData,
    utilities.handleErrors(invController.addNewInventory),
);

module.exports = router;