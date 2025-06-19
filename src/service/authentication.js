const JWT = require("jsonwebtoken");
const { validate } = require("../models/user");

const secret = "somethingThatCanNotBeGuessed";

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