// models/ExpenseModel.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database')

// Define the Expense model
const User = sequelize.define('User', {
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        email: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        password: {
          type: DataTypes.STRING, 
          allowNull: false
        },
        isPremiumUser: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false // Set default value if needed
      },
      totalExpense:{
        type:DataTypes.INTEGER,
        defaultValue:0

      }
      }, {
        freezeTableName: true // Set freezeTableName option to true
    });
      


// Export the Expense model
module.exports = User;
