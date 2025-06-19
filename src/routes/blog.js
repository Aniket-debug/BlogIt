const { Router } = require("express");
const Blog = require("../models/blog");
const multer = require("multer");
const path = require("path");

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./src/public/uploads/`));
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
})

const upload = multer({ storage: storage })

router
  .route("/add-blog")
  .get(async (req, res) => {
    return res.render("addBlog", {
      user: req.user,
    });
  })
  .post(upload.single("image"), async (req, res) => {
    const {title, content} = req.body;
    const blog = await Blog.create({
      title,
      content,
      createdBy: req.user._id,
      coverImageURL: `/uploads/${req.file.filename}`
    })
    return res.redirect(`/blog/${blog._id}`);
  });

module.exports = router;
