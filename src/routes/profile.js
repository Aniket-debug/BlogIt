const { Router } = require("express");
const User = require("../models/user");

const router = Router();

router.route("/:id").get(async (req, res) => {
  if (req.user) {
    const user = await User.findById(req.params.id).populate("blogs");
    return res.render("profile", {
      user,
    });
  }
  return res.redirect("/signin");
});

module.exports = router;
