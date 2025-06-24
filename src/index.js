require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { checkForCookie } = require("./middlewares/authentication");
const homeRoute = require("./routes/home");
const blogRoute = require("./routes/blog");
const profileRoute = require("./routes/profile");
const methodOverride = require("method-override");
const cloudinary = require('cloudinary').v2;

// cloudinary Configuration
cloudinary.config({
    cloud_name: 'dynnuveus',
    api_key: '115371696782186',
    api_secret:process.env.cloudinary_secret
});


mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:\n", err));

const PORT = process.env.PORT;

const app = express();

app.set("view engine", "ejs");
app.set("views", path.resolve("./src/views"));

// middlewares
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForCookie("token"));
app.use(express.static(path.resolve("./src/public")));

// routes
app.use("/", homeRoute);
app.use("/blog", blogRoute);
app.use("/profile", profileRoute);

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
