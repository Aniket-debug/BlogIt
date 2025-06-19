const { Router } = require("express");
const Blog = require("../models/blog");
const User = require("../models/user");
const multer = require("multer");
const path = require("path");

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./src/public/blogCoverImage/`));
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

router
  .route("/add-blog")
  .get(async (req, res) => {
    return res.render("addBlog", {
      user: req.user,
    });
  })
  .post(upload.single("cover-image"), async (req, res) => {
    try {
      const { title, content } = req.body;

      // Set default cover image path if no file is uploaded
      const coverImagePath = req.file
        ? `/blogCoverImage/${req.file.filename}`
        : `/images/userAvatar.png`;

      // Create the blog
      const blog = await Blog.create({
        title,
        content,
        createdBy: req.user._id,
        coverImageURL: coverImagePath,
      });

      // Add blog ID to user
      await User.findByIdAndUpdate(
        req.user._id,
        { $push: { blogs: blog._id } },
        { new: true }
      );

      return res.redirect(`/blog/${blog._id}`);
    } catch (error) {
      console.error("Error while creating blog:", error);
      return res
        .status(500)
        .send("Something went wrong while adding the blog.");
    }
  });

router.route("/:id").get(async (req, res) => {
  const blog = await Blog.findById(req.params.id)
    .populate("createdBy")
    .populate("comments.createdBy");
  return res.render("blog", {
    user: req.user,
    blog,
  });
});

router.post("/:id/comments", async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  blog.comments.push({
    text: req.body.text,
    createdBy: req.user._id,
    createdAt: new Date(),
  });
  await blog.save();
  res.redirect(`/blog/${req.params.id}`);
});

module.exports = router;
