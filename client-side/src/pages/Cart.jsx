import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../css/Cart.css";

function Cart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionMsg, setActionMsg] = useState({ type: "", text: "" });

    const token = localStorage.getItem("token");

    const fetchCartData = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/cart", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setCartItems(data.cart);
            } else {
                setError(data.message || "Failed to load cart items.");
            }
        } catch (err) {
            console.error("Cart fetch error:", err);
            setError("An error occurred while loading your cart.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartData();
    }, [token]);

    const handleUpdateQuantity = async (productId, currentQty, delta) => {
        setActionMsg({ type: "", text: "" });
        
        // If decreasing quantity to 0, remove the item entirely
        if (currentQty + delta < 1) {
            const item = cartItems.find(i => i.product_id === productId);
            if (item) {
                handleRemoveItem(item.cart_id);
            }
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: delta
                })
            });
            const data = await response.json();

            if (data.success) {
                // Refresh data
                await fetchCartData();
            } else {
                setActionMsg({ type: "error", text: data.message || "Failed to update quantity." });
            }
        } catch (err) {
            console.error("Qty update error:", err);
            setActionMsg({ type: "error", text: "Error updating quantity." });
        }
    };

    const handleRemoveItem = async (cartId) => {
        setActionMsg({ type: "", text: "" });
        if (!window.confirm("Remove this item from your cart?")) return;

        try {
            const response = await fetch(`http://localhost:5000/cart/remove/${cartId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setCartItems(cartItems.filter(item => item.cart_id !== cartId));
                setActionMsg({ type: "success", text: "Item removed." });
            } else {
                setActionMsg({ type: "error", text: data.message || "Failed to remove item." });
            }
        } catch (err) {
            console.error("Remove item error:", err);
            setActionMsg({ type: "error", text: "Error removing item." });
        }
    };

    const handleClearCart = async () => {
        setActionMsg({ type: "", text: "" });
        if (!window.confirm("Are you sure you want to clear your entire cart?")) return;

        try {
            const response = await fetch("http://localhost:5000/cart/clear", {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setCartItems([]);
                setActionMsg({ type: "success", text: "Cart cleared successfully." });
            } else {
                setActionMsg({ type: "error", text: data.message || "Failed to clear cart." });
            }
        } catch (err) {
            console.error("Clear cart error:", err);
            setActionMsg({ type: "error", text: "Error clearing cart." });
        }
    };

    const handleCheckout = async () => {
        setActionMsg({ type: "", text: "" });
        if (cartItems.length === 0) return;

        try {
            const response = await fetch("http://localhost:5000/orders/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setCartItems([]);
                setActionMsg({ type: "success", text: "Order placed successfully! Redirecting to orders page..." });
                setTimeout(() => {
                    navigate("/orders");
                }, 2000);
            } else {
                setActionMsg({ type: "error", text: data.message || "Failed to place order." });
            }
        } catch (err) {
            console.error("Checkout error:", err);
            setActionMsg({ type: "error", text: "An error occurred during checkout." });
        }
    };

    const calculateCartTotal = () => {
        return cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    };

    if (!token) {
        return (
            <>
                <Navbar />
                <div className="cart-container center-state">
                    <h2>Your Shopping Cart</h2>
                    <p className="login-prompt">
                        Please <Link to="/login">log in</Link> to view and manage your cart.
                    </p>
                </div>
            </>
        );
    }

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="cart-container center-state">
                    <h3>Loading your cart...</h3>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="cart-container">
                <h2>Shopping Cart</h2>

                {actionMsg.text && (
                    <div className={`alert alert-${actionMsg.type} cart-alert-bar`}>
                        {actionMsg.text}
                    </div>
                )}

                {error && <div className="alert alert-error">{error}</div>}

                {cartItems.length === 0 ? (
                    <div className="empty-cart-state">
                        <span className="cart-icon">🛒</span>
                        <h3>Your cart is empty</h3>
                        <p>Explore our premium product catalog and add items to your cart.</p>
                        <Link to="/" className="shop-link">Shop Products</Link>
                    </div>
                ) : (
                    <div className="cart-content-grid">
                        <div className="cart-items-list">
                            <div className="cart-actions-row">
                                <span>{cartItems.length} Items</span>
                                <button onClick={handleClearCart} className="clear-cart-btn">
                                    Clear Cart
                                </button>
                            </div>

                            {cartItems.map((item) => (
                                <div key={item.cart_id} className="cart-item-card">
                                    <div className="cart-item-image">
                                        <img src={item.image_url} alt={item.name} />
                                    </div>
                                    <div className="cart-item-details">
                                        <Link to={`/product/${item.product_id}`} className="item-name">
                                            {item.name}
                                        </Link>
                                        <p className="item-price">₹{item.price}</p>
                                    </div>
                                    <div className="cart-item-qty">
                                        <button
                                            onClick={() => handleUpdateQuantity(item.product_id, item.quantity, -1)}
                                            className="qty-btn"
                                        >
                                            -
                                        </button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity(item.product_id, item.quantity, 1)}
                                            className="qty-btn"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="cart-item-subtotal">
                                        <p>₹{parseFloat(item.subtotal).toFixed(2)}</p>
                                    </div>
                                    <div className="cart-item-remove">
                                        <button
                                            onClick={() => handleRemoveItem(item.cart_id)}
                                            className="remove-btn"
                                            title="Remove Item"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary-card">
                            <h3>Order Summary</h3>
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{calculateCartTotal().toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span className="free-shipping">FREE</span>
                            </div>
                            <div className="summary-row total-row">
                                <span>Total</span>
                                <span>₹{calculateCartTotal().toFixed(2)}</span>
                            </div>
                            <button onClick={handleCheckout} className="checkout-btn">
                                Proceed to Checkout
                            </button>
                            <Link to="/" className="continue-shopping">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Cart;
