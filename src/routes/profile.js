const { Router } = require("express");
const User = require("../models/user");

const router = Router();

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).populate("blogs");

  return res.render("profile", {
    user,
  });
});

module.exports = router;