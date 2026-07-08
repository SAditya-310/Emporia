require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/auth");
const cors = require("cors");
const db = require("./config/db");
const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth',authRoutes);
app.get("/",(req,res)=>{
    res.send("Server Running");
});

app.listen(process.env.PORT,()=>{
    console.log(`Server running on port ${process.env.PORT}`);
});