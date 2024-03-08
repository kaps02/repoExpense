// models/ExpenseModel.js
const {  DataTypes } = require('sequelize');
const sequelize = require('../config/database')

// Define the Expense model
const Expense = sequelize.define('Expense', {
        category: {
          type: DataTypes.STRING,
          allowNull: false
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        amount: {
          type: DataTypes.STRING, 
          allowNull: false
        }
      }, {
        freezeTableName: true // Set freezeTableName option to true
    });
      
// Sync the model with the database
//sequelize.sync();

// Export the Expense model
module.exports = Expense;
