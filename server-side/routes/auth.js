const express = require("express");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const db = require("../config/db");
const nodemailer = require("nodemailer");
const router = express.Router();
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});
router.post("/register", async (req, res) => {
    try {
        const { username, email, mobile_no, password } = req.body;
        if (!username || !email || !mobile_no || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email."
            });
        }
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain 8 characters, uppercase, lowercase, number and special character."
            });
        }
        const checkQuery =
            "SELECT * FROM users WHERE email=?";

        db.query(checkQuery, [email], async (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (result.length > 0) {

                return res.json({
                    success: false,
                    message: "Email already exists."
                });

            }
            const hashedPassword =
                await bcrypt.hash(password, 10);
            const insertUser = `
            INSERT INTO users
            (username,email,mobile_no,password,is_verified)
            VALUES(?,?,?,?,false)
            `;

            db.query(
                insertUser,
                [username, email, mobile_no, hashedPassword],
                (err, userResult) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    const otp =
                        otpGenerator.generate(6, {
                            upperCaseAlphabets: false,
                            lowerCaseAlphabets: false,
                            specialChars: false
                        });

                    const expiry =
                        new Date(Date.now() + 5 * 60 * 1000);

                    const otpQuery = `
                    INSERT INTO otp_verification
                    (user_id,otp,expiry_time)
                    VALUES(?,?,?)
                    `;
                    const userId = userResult.insertId;
                    db.query(
                        otpQuery,
                        [userId, otp, expiry],
                        (err) => {

                            if (err) {
                                return res.status(500).json(err);
                            }

                            const mailOptions = {
                                from: process.env.EMAIL,
                                to: email,
                                subject: "Email Verification - Emporia",
                                html: `
                                     <h2>Welcome to Emporia</h2>

                                     <p>Your OTP for email verification is:</p>

                                     <h1>${otp}</h1>

                                     <p>This OTP is valid for 5 minutes.</p>
                                    `
                            };

                            transporter.sendMail(mailOptions, (err, info) => {
                                if (err) {

                                    console.log(err);

                                    return res.status(500).json({
                                        success: false,
                                        message: "Failed to send OTP."
                                    });

                                }
                                console.log(info);
                                res.json({
                                    success: true,
                                    message: "OTP sent successfully."
                                });

                            });
                        }
                    );

                }
            );

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

});
router.post("/verify-otp", (req, res) => {

    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            success: false,
            message: "Email and OTP are required."
        });
    }

    // Find User
    const userQuery = "SELECT * FROM users WHERE email=?";

    db.query(userQuery, [email], (err, userResult) => {

        if (err)
            return res.status(500).json(err);

        if (userResult.length === 0) {
            return res.json({
                success: false,
                message: "User not found."
            });
        }

        const user = userResult[0];

        // Find OTP
        const otpQuery =
            "SELECT * FROM otp_verification WHERE user_id=? AND otp=?";

        db.query(otpQuery, [user.user_id, otp], (err, otpResult) => {

            if (err)
                return res.status(500).json(err);

            if (otpResult.length === 0) {
                return res.json({
                    success: false,
                    message: "Invalid OTP."
                });
            }

            const otpData = otpResult[0];

            // Check Expiry
            if (new Date() > new Date(otpData.expiry_time)) {

                return res.json({
                    success: false,
                    message: "OTP Expired."
                });

            }

            const updateQuery =
                "UPDATE users SET is_verified=true WHERE user_id=?";

            db.query(updateQuery, [user.user_id], (err) => {

                if (err)
                    return res.status(500).json(err);

                const deleteQuery =
                    "DELETE FROM otp_verification WHERE user_id=?";

                db.query(deleteQuery, [user.user_id], (err) => {

                    if (err)
                        return res.status(500).json(err);

                    res.json({
                        success: true,
                        message: "Email Verified Successfully."
                    });

                });

            });

        });

    });

});
router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required."
            });
        }

        const query = "SELECT * FROM users WHERE email=?";

        db.query(query, [email], async (err, result) => {

            if (err)
                return res.status(500).json(err);

            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            const user = result[0];

            // Email verified?
            if (!user.is_verified) {
                return res.status(401).json({
                    success: false,
                    message: "Please verify your email first."
                });
            }

            // Compare Password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Incorrect Password."
                });
            }
            const token = jwt.sign(
                {
                    user_id: user.user_id,
                    email: user.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

            res.status(200).json({
                success: true,
                message: "Login Successful.",
                token,
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email
                }
            });

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

});
module.exports = router;