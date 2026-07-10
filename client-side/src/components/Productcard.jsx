import { Link } from "react-router-dom";
import "../css/Productcard.css";

function ProductCard({ product }) {

    return (

        <Link
            to={`/product/${product.product_id}`}
            className="product-link"
        >

            <div className="product-card">

                <div className="product-image-wrap">
                    <img
                        src={product.image_url}
                        alt={product.name}
                    />
                </div>

                <div className="product-info">

                    <span className="product-category">{product.category}</span>

                    <h3>{product.name}</h3>

                    <p className="price">
                        ₹{product.price}
                    </p>

                    <p className="rating">
                        ⭐ {product.average_rating || "New"}
                    </p>

                    <span className="view-btn">
                        View Product
                    </span>

                </div>

            </div>

        </Link>

    );

}

export default ProductCard;
