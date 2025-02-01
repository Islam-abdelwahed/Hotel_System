const sqlize = require("../util/sqlize");

const { DataTypes } = require("sequelize");

const employee = sqlize.define("employee", {
  id: {
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
    unique: true,
    type: DataTypes.INTEGER,
  },
  staffID: {
    allowNull: false,
    unique: true,
    type: DataTypes.STRING,
  },
  firstname: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  lastname: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  address: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  national_Id: {
    allowNull: false,
    unique: true,
    type: DataTypes.STRING,
  },
  phone: {
    allowNull: false,
    unique: true,
    type: DataTypes.STRING,
  },
  gender: {
    allowNull: false,
    values: ['male','female'],
    type: DataTypes.STRING,
  },
  birth_date: {
    allowNull: false,
    type: DataTypes.STRING,
  }
});

module.exports = employee;
