const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`,
            [classification_id]
        );
        return data.rows;
    } catch (error) {
        console.error("getClassificationById error " + error);
    }
}

/* ***************************
 *  Get all vehicle details by inventory_id
 * ************************** */
async function getDetailsByInventoryId(inventory_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory
            WHERE inv_id = $1`,
            [inventory_id]
        );
        return data.rows[0];
    } catch (error) {
        console.error("getDetailsByInventoryId error " + error);
    }
}

/* ***************************
 *  Insert new classification entry
 * ************************** */
async function insertNewClassification(classification_name) {
    try {
        return await pool.query(
            `INSERT INTO classification (classification_name) VALUES ($1)`,
            [classification_name]
        );
    } catch (error) {
        console.error("insertNewClassification error " + error);
        return error.message;
    }
}

/* ***************************
 *  Insert new inventory entry
 * ************************** */
async function insertNewInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
    try {
        return await pool.query(
            `INSERT INTO inventory VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id]
        );
    } catch (error) {
        console.error("insertNewInventory error " + error);
        return error.message;
    }
}

module.exports = { getClassifications, getInventoryByClassificationId, getDetailsByInventoryId, insertNewClassification, insertNewInventory }