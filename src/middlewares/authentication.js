const { validateToken } = require("../service/authentication");

function checkForCookie(cookieName) {
    return (req, res, next)=>{
        const tokenCookieValue = req.cookies[cookieName];
        if (!tokenCookieValue) {
            return next();
        }

        try {
            const userPaylod = validateToken(tokenCookieValue);
            req.user = userPaylod;
        } catch (error) {
            console.log(error);
        }

        return next();
    };
}

module.exports = {
    checkForCookie
}