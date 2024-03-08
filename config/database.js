// config/database.js
const { Sequelize } = require('sequelize');


// Initialize Sequelize with MySQL connection

const sequelize = new Sequelize({
    dialect: 'mysql', // Or any other dialect such as 'postgres', 'sqlite' etc.
  host: 'localhost',
  username: 'root',
  password: 'Kapil@12345678',
  database: 'complete-expense',//database name
})
module.exports = sequelize;
