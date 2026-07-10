import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../css/ProductDetail.css";

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cartMsg, setCartMsg] = useState({ type: "", text: "" });

    // Review Form State
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [reviewMsg, setReviewMsg] = useState({ type: "", text: "" });

    const token = localStorage.getItem("token");
    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            try {
                // Fetch product details
                const prodRes = await fetch(`http://localhost:5000/products/${id}`, {
                    headers: token ? { "Authorization": `Bearer ${token}` } : {}
                });
                const prodData = await prodRes.json();

                if (prodData.success) {
                    setProduct(prodData.product);
                } else {
                    setError(prodData.message || "Product not found.");
                }

                // Fetch reviews
                const revRes = await fetch(`http://localhost:5000/reviews/${id}`);
                const revData = await revRes.json();
                if (revData.success) {
                    setReviews(revData.reviews);
                }
            } catch (err) {
                console.error("Error fetching product data:", err);
                setError("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [id, token]);

    const handleAddToCart = async () => {
        setCartMsg({ type: "", text: "" });
        if (!token) {
            setCartMsg({ type: "error", text: "Please log in to add items to your cart." });
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
                    product_id: parseInt(id),
                    quantity: quantity
                })
            });
            const data = await response.json();

            if (data.success) {
                setCartMsg({ type: "success", text: "Product added to cart!" });
            } else {
                setCartMsg({ type: "error", text: data.message || "Failed to add to cart." });
            }
        } catch (err) {
            console.error("Cart error:", err);
            setCartMsg({ type: "error", text: "Could not add item to cart. Try again later." });
        }
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        setReviewMsg({ type: "", text: "" });

        if (!token) {
            setReviewMsg({ type: "error", text: "Please log in to leave a review." });
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/reviews/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: parseInt(id),
                    rating: rating,
                    review: reviewText
                })
            });
            const data = await response.json();

            if (data.success) {
                setReviewMsg({ type: "success", text: "Review added successfully!" });
                setReviewText("");
                // Refresh reviews list
                const revRes = await fetch(`http://localhost:5000/reviews/${id}`);
                const revData = await revRes.json();
                if (revData.success) {
                    setReviews(revData.reviews);
                }
            } else {
                setReviewMsg({ type: "error", text: data.message || "Failed to submit review." });
            }
        } catch (err) {
            console.error("Review submit error:", err);
            setReviewMsg({ type: "error", text: "An error occurred while submitting." });
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        try {
            const response = await fetch(`http://localhost:5000/reviews/${reviewId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                // Refresh reviews list
                setReviews(reviews.filter((r) => r.review_id !== reviewId));
            } else {
                alert(data.message || "Failed to delete review.");
            }
        } catch (err) {
            console.error("Delete review error:", err);
            alert("An error occurred.");
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="product-detail-container loading-state">
                    <h3>Loading product details...</h3>
                </div>
            </>
        );
    }

    if (error || !product) {
        return (
            <>
                <Navbar />
                <div className="product-detail-container error-state">
                    <h3>{error || "Product not found."}</h3>
                    <Link to="/" className="back-link">Back to Home</Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="product-detail-container">
                <Link to="/" className="back-link">← Back to Products</Link>

                <div className="product-main-view">
                    <div className="product-image-container">
                        <img src={product.image_url} alt={product.name} />
                    </div>

                    <div className="product-details-info">
                        <span className="category-badge">{product.category}</span>
                        <h1>{product.name}</h1>
                        
                        <div className="rating-summary">
                            <span className="stars">⭐ {product.average_rating || "No ratings"}</span>
                            <span className="reviews-count">({reviews.length} customer reviews)</span>
                        </div>

                        <p className="product-price">₹{product.price}</p>
                        
                        <div className="product-desc-box">
                            <h3>Description</h3>
                            <p>{product.description || "No description available for this product."}</p>
                        </div>

                        <div className="stock-status">
                            Availability: {product.stock > 0 ? (
                                <span className="in-stock">In Stock ({product.stock} left)</span>
                            ) : (
                                <span className="out-of-stock">Out of Stock</span>
                            )}
                        </div>

                        {product.stock > 0 && (
                            <div className="purchase-controls">
                                <div className="qty-selector">
                                    <button 
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="qty-btn"
                                    >
                                        -
                                    </button>
                                    <span className="qty-val">{quantity}</span>
                                    <button 
                                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                        className="qty-btn"
                                    >
                                        +
                                    </button>
                                </div>

                                <button onClick={handleAddToCart} className="add-to-cart-btn">
                                    Add to Cart
                                </button>
                            </div>
                        )}

                        {cartMsg.text && (
                            <div className={`cart-alert alert-${cartMsg.type}`}>
                                {cartMsg.text}
                            </div>
                        )}
                    </div>
                </div>

                <div className="reviews-section">
                    <h2>Customer Reviews</h2>
                    
                    {/* Add Review Form */}
                    <div className="add-review-container">
                        <h3>Write a Review</h3>
                        {token ? (
                            <form onSubmit={handleAddReview} className="review-form">
                                {reviewMsg.text && (
                                    <div className={`alert alert-${reviewMsg.type}`}>
                                        {reviewMsg.text}
                                    </div>
                                )}
                                <div className="review-form-group">
                                    <label htmlFor="rating-select">Rating</label>
                                    <select
                                        id="rating-select"
                                        value={rating}
                                        onChange={(e) => setRating(parseInt(e.target.value))}
                                    >
                                        <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                                        <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                                        <option value="3">⭐⭐⭐ (3 - Average)</option>
                                        <option value="2">⭐⭐ (2 - Poor)</option>
                                        <option value="1">⭐ (1 - Terrible)</option>
                                    </select>
                                </div>
                                <div className="review-form-group">
                                    <label htmlFor="review-text">Your Review</label>
                                    <textarea
                                        id="review-text"
                                        rows="4"
                                        placeholder="Share your thoughts about this product..."
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="submit-review-btn">
                                    Submit Review
                                </button>
                            </form>
                        ) : (
                            <p className="login-prompt">
                                Please <Link to="/login">log in</Link> to write a review.
                            </p>
                        )}
                    </div>

                    {/* Reviews List */}
                    <div className="reviews-list">
                        {reviews.length > 0 ? (
                            reviews.map((rev) => (
                                <div key={rev.review_id} className="review-card">
                                    <div className="review-header">
                                        <span className="review-user">👤 {rev.username}</span>
                                        <span className="review-date">
                                            {new Date(rev.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="review-rating">
                                        {"⭐".repeat(rev.rating)}
                                    </div>
                                    <p className="review-body">{rev.review}</p>
                                    {currentUser && currentUser.username === rev.username && (
                                        <button
                                            onClick={() => handleDeleteReview(rev.review_id)}
                                            className="delete-review-btn"
                                        >
                                            Delete Review
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProductDetail;
