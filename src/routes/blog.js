const { Router } = require("express");
const Blog = require("../models/blog");
const User = require("../models/user");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
    if (req.user) {
      return res.render("addBlog", {
        user: req.user,
      });
    }
    return res.redirect("/");
  })
  .post(upload.single("cover-image"), async (req, res) => {
    try {
      const { title, content } = req.body;

      // Set default cover image path if no file is uploaded
      const coverImagePath = req.file
        ? `/blogCoverImage/${req.file.filename}`
        : `/images/blogCoverImage.png`;

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

router
  .route("/:id")
  .get(async (req, res) => {
    const blog = await Blog.findById(req.params.id)
      .populate("createdBy")
      .populate("comments.createdBy");
    return res.render("blog", {
      user: req.user,
      blog,
    });
  })
  .delete(async (req, res) => {
    try {
      const blogId = req.params.id;

      // 1. Find the blog
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).send("Blog not found");
      }

      // 2. Remove blog reference from user's blogs array
      const user = await User.findByIdAndUpdate(blog.createdBy, {
        $pull: { blogs: blogId },
      });

      // 3. Delete the cover image file if it's not the default
      const defaultImage = "/images/blogCoverImage.png";
      if (blog.coverImageURL && blog.coverImageURL !== defaultImage) {
        // Resolve the full path to the image file
        const imagePath = path.resolve(
          __dirname,
          "../public",
          "." + blog.coverImageURL
        );

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log("Old image deleted:", imagePath);
        } else {
          console.warn("Image not found:", imagePath);
        }
      }
      // 4. Delete the blog
      await Blog.findByIdAndDelete(blogId);

      // 5. Redirect
      res.redirect(`/profile/${user._id}`);
    } catch (err) {
      console.error("Error deleting blog:", err);
      res.status(500).send("Server error while deleting blog");
    }
  });

router
  .post("/:id/comments", async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    blog.comments.push({
      text: req.body.text,
      createdBy: req.user._id,
      createdAt: new Date(),
    });
    await blog.save();
    res.redirect(`/blog/${req.params.id}`);
  })
  .delete("/:id/comments/:cid", async (req, res) => {
    try {
      const { id, cid } = req.params;
      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).send("Blog not found");
      }

      // Remove the comment by its id
      blog.comments.pull(cid);
      await blog.save();

      res.redirect(`/blog/${id}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  });

module.exports = router;
