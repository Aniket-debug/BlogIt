const { Router } = require("express");
const upload = require("../service/uploadMulter");

const { handleGetHome,
  handleGetSignIn,
  handlePostSignIn,
  handleGetSignUp,
  handlePostSignUp,
  handlePostSignOut
} = require("../controllers/home");

const router = Router();

router.get("/", handleGetHome);

router
  .route("/signin")
  .get(handleGetSignIn)
  .post(handlePostSignIn);

router
  .route("/signup")
  .get(handleGetSignUp)
  .post(upload.single("profile-image"), handlePostSignUp);

router
  .post("/signout", handlePostSignOut);

module.exports = router;
