const crypto = require("crypto");

const randomID = () => {
  const randomNum = crypto.randomInt(1e9, 1e10); 
  return randomNum.toString();
};

module.exports = randomID;
