const express = require("express");
const db = require("../config/db");
const router = express.Router();
const middleware = require("../middleware/authmiddle");
router.post("/create", middleware, (req, res) => {

    const user_id = req.user.user_id;

    // Get Cart Items
    const cartQuery = `
        SELECT
            cart.product_id,
            cart.quantity,
            products.price
        FROM cart
        INNER JOIN products
        ON cart.product_id = products.product_id
        WHERE cart.user_id = ?
    `;

    db.query(cartQuery, [user_id], (err, cartItems) => {

        if (err)
            return res.status(500).json(err);

        if (cartItems.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Cart is empty."
            });

        }

        // Calculate Total
        let totalAmount = 0;

        cartItems.forEach(item => {
            totalAmount += item.price * item.quantity;
        });

        // Create Order
        const orderQuery = `
            INSERT INTO orders
            (user_id,total_amount,payment_status,order_status)
            VALUES(?,?,?,?)
        `;

        db.query(
            orderQuery,
            [user_id, totalAmount, "Paid", "Pending"],
            (err, orderResult) => {

                if (err)
                    return res.status(500).json(err);

                const orderId = orderResult.insertId;

                let completed = 0;

                cartItems.forEach(item => {

                    const itemQuery = `
                        INSERT INTO order_items
                        (order_id,product_id,quantity,price)
                        VALUES(?,?,?,?)
                    `;

                    db.query(
                        itemQuery,
                        [
                            orderId,
                            item.product_id,
                            item.quantity,
                            item.price
                        ],
                        (err) => {

                            if (err)
                                return res.status(500).json(err);

                            completed++;

                            if (completed === cartItems.length) {

                                // Clear Cart
                                db.query(
                                    "DELETE FROM cart WHERE user_id=?",
                                    [user_id],
                                    (err) => {

                                        if (err)
                                            return res.status(500).json(err);

                                        res.json({
                                            success: true,
                                            message: "Order Placed Successfully.",
                                            order_id: orderId
                                        });

                                    }
                                );

                            }

                        }
                    );

                });

            }
        );

    });

});

router.get("/", middleware, (req, res) => {

    const user_id = req.user.user_id;

    const query = `
        SELECT
    o.order_id,
    o.created_at,
    o.total_amount,
    o.payment_status,
    o.order_status,
    oi.quantity,

    GROUP_CONCAT(p.name SEPARATOR ', ') AS products

FROM orders o

JOIN order_items oi
ON o.order_id = oi.order_id

JOIN products p
ON oi.product_id = p.product_id

WHERE o.user_id = ?

GROUP BY o.order_id

ORDER BY o.created_at DESC;
    `;

    db.query(query, [user_id], (err, result) => {

        if (err)
            return res.status(500).json(err);

        res.json({
            success: true,
            orders: result
        });

    });

});
module.exports = router;