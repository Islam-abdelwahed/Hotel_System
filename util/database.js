const mySql = require("mysql2");
require("dotenv").config();

const pool = mySql.createPool({
  host: "localhost",
  user: "root",
  port: 3306,
  password: process.env.SQL_PASSWORD,
  database: "hotel"
});

module.exports = pool.promise();