const User = require('../models/userModel');
const Expense = require('../models/expenseModel');
const sequelize = require('../config/database');

exports.showLeaderBoard = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: [
                'id','name',[sequelize.fn('sum', sequelize.col('amount')), 'total_cost'] // Aggregate the 'amount' column
            ],
            include:[{
                model: Expense,
                attributes:[]
            }],
            group: ['user.id'],
            order:[['total_cost' , 'DESC']]
        });
        
        res.status(200).json(users);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

