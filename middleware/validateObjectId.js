const mongoose = require("mongoose");

module.exports = (req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const error = new Error("Invalid ID");
    error.statusCode = 422;
    return next(error);
  }

  next();
};
