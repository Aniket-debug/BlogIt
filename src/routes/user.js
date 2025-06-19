const { Router } = require("express");
const User = require("../models/user");

const router = Router();

router
  .route("/signin")
  .get(async (req, res) => {
    return res.render("signin");
  })
  .post(async (req, res) => {
    const { email, password } = req.body;
    try {
      const token = await User.matchUserAndReturnToken(email, password);
      return res.cookie("token", token).redirect("/");
    } catch (error) {
      return res.status(400).render("signin", {error:"Invalid email or password"});
    }
  });

router
  .route("/signup")
  .get(async (req, res) => {
    return res.render("signup");
  })
  .post(async (req, res) => {
    const { fullname, email, password } = req.body;
    const user = await User.create({
      fullname,
      email,
      password,
    });
    return res.redirect("/");
  });

router.get("/signout", (req, res)=>{
  res.clearCookie("token").redirect("/");
})

module.exports = router;
