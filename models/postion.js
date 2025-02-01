const sqlize = require("../util/sqlize");

const { DataTypes } = require("sequelize");

const postion = sqlize.define("postion", {
  id: {
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
    unique: true,
    type: DataTypes.INTEGER,
  },
  postion_title: {
    allowNull: false,
    unique: true,
    type: DataTypes.STRING,
  },
  postion_salary: {
    allowNull: false,
    type: DataTypes.DOUBLE,
  },
});

module.exports = postion;
