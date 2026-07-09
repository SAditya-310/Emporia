const express = require("express");
const db = require("../config/db");
const router = express.Router();
const middleware = require("../middleware/authmiddle");
router.post("/add", middleware, (req, res) => {

    const user_id = req.user.user_id;

    const { product_id, rating, review } = req.body;

    if (!product_id || !rating || !review) {

        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });

    }

    const checkQuery =
        "SELECT * FROM reviews WHERE user_id=? AND product_id=?";

    db.query(checkQuery, [user_id, product_id], (err, result) => {

        if (err)
            return res.status(500).json(err);

        if (result.length > 0) {

            return res.json({
                success: false,
                message: "You already reviewed this product."
            });

        }

        const insertQuery = `
            INSERT INTO reviews
            (user_id,product_id,rating,review)
            VALUES(?,?,?,?)
        `;

        db.query(
            insertQuery,
            [user_id, product_id, rating, review],
            (err) => {

                if (err)
                    return res.status(500).json(err);

                res.json({
                    success: true,
                    message: "Review Added Successfully."
                });

            }
        );

    });

});
router.get("/:productId", (req, res) => {

    const product_id = req.params.productId;

    const query = `
        SELECT

            reviews.review_id,
            reviews.rating,
            reviews.review,
            reviews.created_at,

            users.username

        FROM reviews

        INNER JOIN users

        ON reviews.user_id = users.user_id

        WHERE reviews.product_id=?

        ORDER BY reviews.created_at DESC
    `;

    db.query(query, [product_id], (err, result) => {

        if (err)
            return res.status(500).json(err);

        res.json({
            success: true,
            reviews: result
        });

    });

});
router.delete("/:id", middleware, (req, res) => {

    const user_id = req.user.user_id;
    const review_id = req.params.id;

    const query = `
        DELETE FROM reviews
        WHERE review_id=? AND user_id=?
    `;

    db.query(query, [review_id, user_id], (err, result) => {

        if (err)
            return res.status(500).json(err);

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Review not found."
            });

        }

        res.json({
            success: true,
            message: "Review Deleted Successfully."
        });

    });

});
router.delete("/:id", middleware, (req, res) => {

    const user_id = req.user.user_id;
    const review_id = req.params.id;

    const query = `
        DELETE FROM reviews
        WHERE review_id=? AND user_id=?
    `;

    db.query(query, [review_id, user_id], (err, result) => {

        if (err)
            return res.status(500).json(err);

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Review not found."
            });

        }

        res.json({
            success: true,
            message: "Review Deleted Successfully."
        });

    });

});