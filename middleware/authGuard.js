const JWT = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      const error = new Error("Unauthorized access token");
      error.statusCode = 401;
      throw error;
    }

    const decoded = JWT.verify(token, process.env.ACCESS_TOKEN);

    req.user = decoded;
    next();
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};
