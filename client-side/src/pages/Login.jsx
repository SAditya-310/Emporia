import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../css/login.css";

function Login() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("login"); // 'login' or 'register'
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Form inputs
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [regUsername, setRegUsername] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regMobile, setRegMobile] = useState("");
    const [regPassword, setRegPassword] = useState("");

    const [otpCode, setOtpCode] = useState("");

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        try {
            const response = await fetch("http://localhost:5000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: loginEmail, password: loginPassword })
            });
            const data = await response.json();

            if (data.success) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                setSuccessMsg("Login successful! Redirecting...");
                setTimeout(() => {
                    navigate("/");
                    // Force refresh navbar state
                    window.location.reload();
                }, 1000);
            } else {
                setErrorMsg(data.message || "Failed to login. Please check your credentials.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setErrorMsg("An error occurred. Please try again later.");
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        try {
            const response = await fetch("http://localhost:5000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: regUsername,
                    email: regEmail,
                    mobile_no: regMobile,
                    password: regPassword
                })
            });
            const data = await response.json();

            if (data.success) {
                setSuccessMsg("OTP sent to your email. Please verify.");
                setIsVerifyingOtp(true);
            } else {
                setErrorMsg(data.message || "Registration failed.");
            }
        } catch (err) {
            console.error("Registration error:", err);
            setErrorMsg("An error occurred during registration.");
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        try {
            const response = await fetch("http://localhost:5000/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: regEmail,
                    otp: otpCode
                })
            });
            const data = await response.json();

            if (data.success) {
                setSuccessMsg("Email verified successfully! You can now log in.");
                setIsVerifyingOtp(false);
                setActiveTab("login");
                setLoginEmail(regEmail);
                setLoginPassword("");
                setOtpCode("");
            } else {
                setErrorMsg(data.message || "Invalid OTP code.");
            }
        } catch (err) {
            console.error("OTP verification error:", err);
            setErrorMsg("An error occurred during OTP verification.");
        }
    };

    return (
        <>
            <Navbar />
            <div className="login-container">
                <div className="login-card">
                    {isVerifyingOtp ? (
                        <div className="form-section">
                            <h2>Verify OTP</h2>
                            <p className="subtitle">We have sent a verification code to {regEmail}</p>

                            {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
                            {successMsg && <div className="alert alert-success">{successMsg}</div>}

                            <form onSubmit={handleOtpSubmit}>
                                <div className="form-group">
                                    <label htmlFor="otp">Enter 6-Digit OTP</label>
                                    <input
                                        type="text"
                                        id="otp"
                                        maxLength="6"
                                        placeholder="123456"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="submit-btn">Verify</button>
                                <button
                                    type="button"
                                    className="back-btn"
                                    onClick={() => setIsVerifyingOtp(false)}
                                >
                                    Back to Register
                                </button>
                            </form>
                        </div>
                    ) : (
                        <>
                            <div className="tab-header">
                                <button
                                    className={activeTab === "login" ? "tab-btn active" : "tab-btn"}
                                    onClick={() => {
                                        setActiveTab("login");
                                        setErrorMsg("");
                                        setSuccessMsg("");
                                    }}
                                >
                                    Login
                                </button>
                                <button
                                    className={activeTab === "register" ? "tab-btn active" : "tab-btn"}
                                    onClick={() => {
                                        setActiveTab("register");
                                        setErrorMsg("");
                                        setSuccessMsg("");
                                    }}
                                >
                                    Register
                                </button>
                            </div>

                            {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
                            {successMsg && <div className="alert alert-success">{successMsg}</div>}

                            {activeTab === "login" ? (
                                <form className="form-section" onSubmit={handleLoginSubmit}>
                                    <h2>Welcome Back</h2>
                                    <div className="form-group">
                                        <label htmlFor="email">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            placeholder="example@email.com"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="password">Password</label>
                                        <input
                                            type="password"
                                            id="password"
                                            placeholder="••••••••"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="submit-btn">Log In</button>
                                </form>
                            ) : (
                                <form className="form-section" onSubmit={handleRegisterSubmit}>
                                    <h2>Create Account</h2>
                                    <div className="form-group">
                                        <label htmlFor="username">Full Name</label>
                                        <input
                                            type="text"
                                            id="username"
                                            placeholder="John Doe"
                                            value={regUsername}
                                            onChange={(e) => setRegUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="reg-email">Email Address</label>
                                        <input
                                            type="email"
                                            id="reg-email"
                                            placeholder="john@example.com"
                                            value={regEmail}
                                            onChange={(e) => setRegEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="mobile">Mobile Number</label>
                                        <input
                                            type="tel"
                                            id="mobile"
                                            placeholder="9876543210"
                                            value={regMobile}
                                            onChange={(e) => setRegMobile(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="reg-password">Password</label>
                                        <input
                                            type="password"
                                            id="reg-password"
                                            placeholder="••••••••"
                                            value={regPassword}
                                            onChange={(e) => setRegPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="submit-btn">Register</button>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default Login;
