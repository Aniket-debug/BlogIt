const JWT = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

if (!secret) {
    throw new Error("JWT_SECRET environment variable not set");
}

function createToken(user) {
    const payload = {
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        profileImageURL: user.profileImageURL,
    };
    const token = JWT.sign(payload, secret);
    return token;
}

function validateToken(token){
    const payload = JWT.verify(token, secret);
    return payload;
}

module.exports = {
    validateToken,
    createToken
}