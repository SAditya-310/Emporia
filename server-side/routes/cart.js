const express = require("express");
const db = require("../config/db");
const router = express.Router();
const middleware = require("../middleware/authmiddle");
router.post("/add", middleware , (req, res) => {

    const user_id = req.user.user_id;

    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {

        return res.status(400).json({
            success: false,
            message: "Product ID and Quantity are required."
        });

    }

    // Check Product Exists

    const productQuery =
        "SELECT * FROM products WHERE product_id=?";

    db.query(productQuery, [product_id], (err, productResult) => {

        if (err)
            return res.status(500).json(err);

        if (productResult.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Product not found."
            });

        }

        // Check Already in Cart

        const cartQuery =
            "SELECT * FROM cart WHERE user_id=? AND product_id=?";

        db.query(cartQuery, [user_id, product_id], (err, cartResult) => {

            if (err)
                return res.status(500).json(err);

            // Product already exists

            if (cartResult.length > 0) {

                const updateQuery = `
                UPDATE cart
                SET quantity = quantity + ?
                WHERE user_id=? AND product_id=?
                `;

                db.query(
                    updateQuery,
                    [quantity, user_id, product_id],
                    (err) => {

                        if (err)
                            return res.status(500).json(err);

                        return res.json({
                            success: true,
                            message: "Cart Updated Successfully."
                        });

                    }
                );

            }

            // Insert New Product

            else {

                const insertQuery = `
                INSERT INTO cart
                (user_id, product_id, quantity)
                VALUES (?, ?, ?)
                `;

                db.query(
                    insertQuery,
                    [user_id, product_id, quantity],
                    (err) => {

                        if (err)
                            return res.status(500).json(err);

                        res.json({
                            success: true,
                            message: "Product Added To Cart."
                        });

                    }
                );

            }

        });

    });

});
router.get("/", middleware, (req, res) => {

    const user_id = req.user.user_id;

    const query = `
        SELECT
            cart.cart_id,
            products.product_id,
            products.name,
            products.price,
            products.image_url,
            cart.quantity,
            (products.price * cart.quantity) AS subtotal

        FROM cart

        INNER JOIN products

        ON cart.product_id = products.product_id

        WHERE cart.user_id = ?
    `;

    db.query(query, [user_id], (err, result) => {

        if (err)
            return res.status(500).json(err);

        res.json({
            success: true,
            cart: result
        });

    });

});
router.delete("/remove/:id", middleware, (req, res) => {

    const user_id = req.user.user_id;
    const cart_id = req.params.id;

    const query = `
        DELETE FROM cart
        WHERE cart_id = ? AND user_id = ?
    `;

    db.query(query, [cart_id, user_id], (err, result) => {

        if (err)
            return res.status(500).json(err);

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Item not found."
            });

        }

        res.json({
            success: true,
            message: "Item removed from cart."
        });

    });

});
router.delete("/clear", middleware, (req, res) => {

    const user_id = req.user.user_id;

    const query = `
        DELETE FROM cart
        WHERE user_id = ?
    `;

    db.query(query, [user_id], (err, result) => {

        if (err)
            return res.status(500).json(err);

        res.json({
            success: true,
            message: "Cart cleared successfully."
        });

    });

});
module.exports = router;