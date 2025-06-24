const cloudinary = require("cloudinary").v2;
const User = require("../models/user");
const Blog = require("../models/blog");
const stream = require("stream");

async function handleGetHome(req, res) {
    const allBlogs = await Blog.find({});
    return res.render("home", {
        user: req.user,
        blogs: allBlogs,
    });
}

async function handleGetSignIn(req, res) {
    if (!req.user) {
        const msg = req.query.msg;
        return res.render("signin", { msg });
    }
    return res.redirect(`profile/${req.user._id}`);
}

async function handlePostSignIn(req, res) {
    const { email, password } = req.body;
    try {
        const token = await User.matchUserAndReturnToken(email, password);
        return res.cookie("token", token).redirect("/");
    } catch (error) {
        return res
            .status(400)
            .render("signin", { error: "Invalid email or password" });
    }
}

async function handleGetSignUp(req, res) {
    if (!req.user) {
        const msg = req.query.msg;
        return res.render("signup", { msg });
    }
    return res.redirect(`profile/${req.user._id}`);
}

async function handlePostSignUp(req, res) {
    try {
        const { fullname, email, password } = req.body;

        let userProfle = `/images/userAvatar.png`;

        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload_stream(
                {
                    resource_type: "image",
                    folder: "userProfileImages",
                    public_id: `profile-${Date.now()}`,
                    transformation: [
                        { width: 800, crop: "scale", fetch_format: "auto", quality: "auto" },
                    ],
                },
                async (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                    } else {
                        userProfle = result.secure_url;

                        const user = await User.create({
                            fullname,
                            email,
                            password,
                            profileImageURL: userProfle,
                        });
                        return res.redirect(
                            "/signin?msg=Account%20created%20successfully%20please%20SignIn"
                        );
                    }
                }
            );

            // Send the image buffer to the Cloudinary upload stream
            const bufferStream = new stream.PassThrough();
            bufferStream.end(req.file.buffer);
            bufferStream.pipe(uploadResult);
        } else {
            const user = await User.create({
                fullname,
                email,
                password,
                profileImageURL: userProfle,
            });
            return res.redirect(
                "/signin?msg=Account%20created%20successfully%20please%20SignIn"
            );
        }
    } catch (err) {
        console.error("Error while creating User:", error);
        return res
            .status(500)
            .send("Something went wrong while creating the User.");
    }
}

async function handlePostSignOut(req, res) {
    return res.clearCookie("token").redirect("/");
}

module.exports = {
    handleGetHome,
    handleGetSignIn,
    handlePostSignIn,
    handleGetSignUp,
    handlePostSignUp,
    handlePostSignOut,
}