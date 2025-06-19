require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { checkForCookie } = require("./middlewares/authentication");
const homeRoute = require("./routes/home");
const blogRoute = require("./routes/blog");
const profileRoute = require("./routes/profile");
const Blog = require("./models/blog");


mongoose.connect(process.env.DB_URL).then((e) => {
  console.log("mongoDb connected");
});

const PORT = process.env.PORT;

const app = express();

app.set("view engine", "ejs");
app.set("views", path.resolve("./src/views"));

// middlewares
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForCookie("token"));
app.use(express.static(path.resolve("./src/public")));

// routes
app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  return res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});
app.use("/", homeRoute);
app.use("/blog", blogRoute);
app.use("/profile", profileRoute);

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
