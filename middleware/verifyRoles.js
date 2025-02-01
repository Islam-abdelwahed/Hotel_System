const JWT = require("jsonwebtoken");
require("dotenv").config();

const verifyRoles = (roles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user.role) {
        const error = new Error("Unauthorized access");
        error.statusCode = 401;
        throw error;
      }

      if (roles.length && !roles.includes(req.user.role)) {
        const error = new Error("Access denied");
        error.statusCode = 403;
        throw error;
      }
      next();
    } catch (error) {
      if (!error.statusCode) error.statusCode = 500;
      next(error);
    }
  };
};

module.exports = verifyRoles;