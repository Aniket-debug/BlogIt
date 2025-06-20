const { Router } = require("express");
const User = require("../models/user");
const Blog = require("../models/blog");
const multer = require("multer");
const path = require("path");

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./src/public/userProfile/`));
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  return res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

router
  .route("/signin")
  .get(async (req, res) => {
    if (!req.user) {
      const msg = req.query.msg;
      return res.render("signin", { msg });
    }
    return res.redirect(`profile/${req.user._id}`);
  })
  .post(async (req, res) => {
    const { email, password } = req.body;
    try {
      const token = await User.matchUserAndReturnToken(email, password);
      return res.cookie("token", token).redirect("/");
    } catch (error) {
      return res
        .status(400)
        .render("signin", { error: "Invalid email or password" });
    }
  });

router
  .route("/signup")
  .get(async (req, res) => {
    if (!req.user) {
      const msg = req.query.msg;
      return res.render("signup", { msg });
    }
    return res.redirect(`profile/${req.user._id}`);
  })
  .post(upload.single("profile-image"), async (req, res) => {
    const { fullname, email, password } = req.body;
    const userProfle = req.file
      ? `/userProfile/${req.file.filename}`
      : `/images/userAvatar.png`;
    console.log(req.file);
    const user = await User.create({
      fullname,
      email,
      password,
      profileImageURL: userProfle,
    });
    return res.redirect(
      "/signin?msg=Account%20created%20successfully%20please%20SignIn"
    );
  });

router.get("/signout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

module.exports = router;
