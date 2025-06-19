require("dotenv").config();
const path = require("path");
const express = require("express");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const { checkForCookie } = require("./middlewares/authentication");
const Blog = require("./models/blog");

mongoose.connect(process.env.DB_URL).then((e) => {
  console.log("mongoDb connected");
});

const PORT = process.env.PORT;

const app = express();
app.set("view engine", "ejs");
app.set("views", path.resolve("./src/views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForCookie("token"));
app.use(express.static(path.resolve("./src/public")));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  return res.render("home",{
    user: req.user,
    blogs: allBlogs
  });
});
app.use("/", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
