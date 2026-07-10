import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../css/navbar.css";

function Navbar({ search, setSearch }) {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setUser(null);
        navigate("/login");
    };

    return (
        <nav className="navbar">

            <div className="logo">
                <Link to="/">Emporia</Link>
            </div>

            {setSearch ? (
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search || ""}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            ) : (
                <div className="search-placeholder"></div>
            )}

            <div className="nav-links">

                <Link to="/">Home</Link>

                <Link to="/cart">Cart</Link>

                <Link to="/orders">Orders</Link>

                {isLoggedIn ? (
                    <>
                        {user && (
                            <span className="nav-user">
                                Hi, {user.username}
                            </span>
                        )}
                        <button onClick={handleLogout} className="logout-btn">
                            Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="login-link">Login</Link>
                )}

            </div>

        </nav>
    );
}

export default Navbar;
