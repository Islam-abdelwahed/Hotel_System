const { Sequelize } = require('sequelize');

const sqlize = new Sequelize("hotel", "root", "14122004", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sqlize;
