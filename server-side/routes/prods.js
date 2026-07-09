const express = require("express");
const db = require("../config/db");
const router = express.Router();
const middleware = require("../middleware/authmiddle");
router.get("/", middleware, (req, res) => {

    const query = "SELECT * FROM products";

    db.query(query, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json({
            success: true,
            products: result
        });

    });

});
router.get("/:id", middleware, (req, res) => {

    const { id } = req.params;

    const query = "SELECT * FROM products WHERE product_id=?";

    db.query(query, [id], (err, result) => {

        if (err)
            return res.status(500).json(err);

        if (result.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Product not found."
            });

        }

        res.json({
            success: true,
            product: result[0]
        });

    });

});
router.get("/search/:keyword", middleware, (req, res) => {

    const { keyword } = req.params;

    const query = `
    SELECT *
    FROM products
    WHERE
    name LIKE ?
    OR
    category LIKE ?
    `;

    db.query(
        query,
        [`%${keyword}%`, `%${keyword}%`],
        (err, result) => {

            if (err)
                return res.status(500).json(err);

            res.json({
                success: true,
                products: result
            });

        }
    );

});
router.get("/filter", middleware, (req, res) => {

    const { category, minPrice, maxPrice } = req.query;

    const query = `
    SELECT *
    FROM products
    WHERE category=?
    AND price BETWEEN ? AND ?
    `;

    db.query(
        query,
        [
            category,
            minPrice || 0,
            maxPrice || 1000000
        ],
        (err, result) => {

            if (err)
                return res.status(500).json(err);

            res.json({
                success: true,
                products: result
            });

        }
    );

});