import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../css/Orders.css";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const response = await fetch("http://localhost:5000/orders", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();

                if (data.success) {
                    setOrders(data.orders);
                } else {
                    setError(data.message || "Failed to load orders.");
                }
            } catch (err) {
                console.error("Orders fetch error:", err);
                setError("An error occurred while loading your orders.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    if (!token) {
        return (
            <>
                <Navbar />
                <div className="orders-container center-state">
                    <h2>Your Orders</h2>
                    <p className="login-prompt">
                        Please <Link to="/login">log in</Link> to view your order history.
                    </p>
                </div>
            </>
        );
    }

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="orders-container center-state">
                    <h3>Loading your orders...</h3>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="orders-container">
                <h2>Your Orders</h2>

                {error && <div className="alert alert-error">{error}</div>}

                {orders.length === 0 ? (
                    <div className="no-orders-state">
                        <span className="orders-icon">📦</span>
                        <h3>No orders found</h3>
                        <p>You haven't placed any orders yet.</p>
                        <Link to="/" className="browse-link">Browse Products</Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order.order_id} className="order-card">
                                <div className="order-header">
                                    <div>
                                        <p className="order-id-label">PRODUCT</p>
                                        <p className="order-id">{order.products}</p>
                                    </div>
                                    <div>
                                        <p className="order-id-label">QUANTITY</p>
                                        <p className="order-id">{order.quantity}</p>
                                    </div>
                                    <div>
                                        <p className="order-date-label">DATE PLACED</p>
                                        <p className="order-date">
                                            {new Date(order.created_at).toLocaleDateString("en-IN", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric"
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="order-total-label">TOTAL AMOUNT</p>
                                        <p className="order-total">₹{parseFloat(order.total_amount).toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="order-body">
                                    <div className="status-badges">
                                        <div className="status-badge-group">
                                            <span className="badge-label">Order Status:</span>
                                            <span className={`status-badge status-${order.order_status.toLowerCase()}`}>
                                                {order.order_status}
                                            </span>
                                        </div>
                                        <div className="status-badge-group">
                                            <span className="badge-label">Payment Status:</span>
                                            <span className={`status-badge payment-${order.payment_status.toLowerCase()}`}>
                                                {order.payment_status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default Orders;
