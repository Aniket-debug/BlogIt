const { Router } = require("express");
const upload = require("../service/uploadMulter");


const { handleBlogPostReq,
  handleBlogDeleteReq,
  handleBlogGetReq,
  handleAddBlogGetReq,
  handleDeleteComment,
  handlePostComment } = require("../controllers/blog");

const router = Router();

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
