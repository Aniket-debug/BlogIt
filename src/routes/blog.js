const { Router } = require("express");
const Blog = require("../models/blog");
const User = require("../models/user");
const multer = require("multer");

const { handleBlogPostReq,
  handleBlogDeleteReq,
  handleBlogGetReq,
  handleAddBlogGetReq,
  handleDeleteComment,
  handlePostComment } = require("../controllers/blog");


const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router
  .route("/add-blog")
  .get(handleAddBlogGetReq)
  .post(upload.single("cover-image"), handleBlogPostReq);

router
  .route("/:id")
  .get(handleBlogGetReq)
  .delete(handleBlogDeleteReq);

router
  .post("/:id/comments", handlePostComment)
  .delete("/:id/comments/:cid", handleDeleteComment);

module.exports = router;
