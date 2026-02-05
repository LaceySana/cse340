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
// Route to process add new classification
router.post(
    "/addClass", 
    invValidation.newClassificationRules(),
    invValidation.checkClassName,
    utilities.handleErrors(invController.addNewClassification),
);
// Route to build add new inventory view
router.get("/addInv", utilities.handleErrors(invController.buildAddInventory));
// Route to process add new inventory
router.post(
    "/addInv", 
    invValidation.newInventoryRules(),
    invValidation.checkInventoryData,
    utilities.handleErrors(invController.addNewInventory),
);
// Route to get inventory data
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));
// Route to build edit vehicle view
router.get("/edit/:inv_id", utilities.handleErrors(invController.buildEditInventory));
// Route to edit vehicle data
router.post(
    "/edit/",
    invValidation.newInventoryRules(),
    invValidation.checkUpdateData,
    utilities.handleErrors(invController.updateInventory),
);
// Route to build delete vehicle view
router.get("/delete/:inv_id", utilities.handleErrors(invController.deleteConfirmation));
// Route to delete vehicle data
router.post(
    "/delete",
    utilities.handleErrors(invController.deleteVehicle),
);




module.exports = router;