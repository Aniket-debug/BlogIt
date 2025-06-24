const cloudinary = require("cloudinary").v2;
const Blog = require("../models/blog");
const User = require("../models/user");
const stream = require("stream");

async function handleBlogPostReq(req, res) {
    try {
        const { title, content } = req.body;

        console.log(req.user._id);

        let coverImagePath = "/images/blogCoverImage.png"; // default

        // Upload image to Cloudinary if provided
        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload_stream(
                {
                    resource_type: "image",
                    folder: "blogCoverImages",
                    public_id: `cover-${Date.now()}`,
                    transformation: [
                        { width: 800, crop: "scale", fetch_format: "auto", quality: "auto" },
                    ],
                },
                async (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                    } else {
                        coverImagePath = result.secure_url;

                        // Create the blog
                        const blog = await Blog.create({
                            title,
                            content,
                            createdBy: req.user._id,
                            coverImageURL: coverImagePath,
                        });
                        // Add blog to user
                        console.log(req.user._id);
                        const user = await User.findByIdAndUpdate(
                            req.user._id,
                            { $push: { blogs: blog._id } },
                            { new: true }
                        );

                        console.log(user);

                        return res.redirect(`/blog/${blog._id}`);
                    }
                }
            );

            // Send the image buffer to the Cloudinary upload stream
            const bufferStream = new stream.PassThrough();
            bufferStream.end(req.file.buffer);
            bufferStream.pipe(uploadResult);
        } else {
            // No file uploaded — fallback
            const blog = await Blog.create({
                title,
                content,
                createdBy: req.user._id,
                coverImageURL: coverImagePath,
            });

            await User.findByIdAndUpdate(
                req.user._id,
                { $push: { blogs: blog._id } },
                { new: true }
            );

            return res.redirect(`/blog/${blog._id}`);
        }
    } catch (error) {
        console.error("Error while creating blog:", error);
        return res
            .status(500)
            .send("Something went wrong while adding the blog.");
    }
}

async function handleBlogDeleteReq(req, res) {
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

        // 3. Delete cover image from Cloudinary if not the default
        const defaultImage = "/images/blogCoverImage.png";

        if (blog.coverImageURL && blog.coverImageURL !== defaultImage) {
            const imageUrl = blog.coverImageURL;

            // Extract the public_id from the URL
            const publicIdMatch = imageUrl.match(/\/blogCoverImages\/([^./]+)/);
            const publicId = publicIdMatch ? `blogCoverImages/${publicIdMatch[1]}` : null;

            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
                console.log("Cloudinary image deleted:", publicId);
            } else {
                console.warn("Could not extract public_id from URL:", imageUrl);
            }
        }

        // 4. Delete the blog
        await Blog.findByIdAndDelete(blogId);

        // 5. Redirect
        res.redirect(`/profile/${blog.createdBy}`);
    } catch (err) {
        console.error("Error deleting blog:", err);
        res.status(500).send("Server error while deleting blog");
    }
}

async function handleBlogGetReq(req, res) {
    const blog = await Blog.findById(req.params.id)
        .populate("createdBy")
        .populate("comments.createdBy");
    return res.render("blog", {
        user: req.user,
        blog,
    });
}

async function handleAddBlogGetReq(req, res) {
    if (req.user) {
        return res.render("addBlog", {
            user: req.user,
        });
    }
    return res.redirect("/");
}

async function handleDeleteComment(req, res) {
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
}

async function handlePostComment(req, res) {
    const blog = await Blog.findById(req.params.id);
    blog.comments.push({
        text: req.body.text,
        createdBy: req.user._id,
        createdAt: new Date(),
    });
    await blog.save();
    res.redirect(`/blog/${req.params.id}`);
}

module.exports = {
    handleBlogPostReq,
    handleBlogDeleteReq,
    handleBlogGetReq,
    handleAddBlogGetReq,
    handleDeleteComment,
    handlePostComment
}