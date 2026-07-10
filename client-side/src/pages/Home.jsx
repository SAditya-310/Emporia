import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CategoryBar from "../components/Category";
import ProductCard from "../components/Productcard";

import "../css/home.css";

function Home() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {

        const token = localStorage.getItem("token");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        fetch("http://localhost:5000/products", { headers })
            .then(res => res.json())
            .then(data => {

                if (data.success) {
                    setProducts(data.products);
                } else {
                    setError(data.message || "Could not load products.");
                }

            })
            .catch(err => {
                console.log(err);
                setError("Failed to connect to server. Make sure the backend is running.");
            })
            .finally(() => setLoading(false));

    }, []);

    const filteredProducts = products.filter((product) => {

        const matchesSearch = product.name
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesCategory =
            selectedCategory === "All" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;

    });

    return (

        <>

            <Navbar
                search={search}
                setSearch={setSearch}
            />

            <Hero />

            <CategoryBar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
            />

            <section
                id="products"
                className="products-section"
            >

                <h2>
                    Our Products
                </h2>

                {error && (
                    <div className="home-alert alert-error">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="home-loading">
                        <p>Loading products...</p>
                    </div>
                ) : (
                    <div className="products-grid">

                        {
                            filteredProducts.length > 0 ?

                                filteredProducts.map(product => (

                                    <ProductCard
                                        key={product.product_id}
                                        product={product}
                                    />

                                ))

                                :

                                <div className="no-products">
                                    <span>🔍</span>
                                    <h3>No Products Found</h3>
                                    <p>Try a different search or category.</p>
                                </div>

                        }

                    </div>
                )}

            </section>

        </>

    );

}

export default Home;
