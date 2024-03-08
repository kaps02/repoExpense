const express = require('express');
const router = express.Router();

const expenseController = require('../controllers/expenseController');
const userAuthentication = require('../middleware/auth')



router.post('/add' ,userAuthentication.authenticate ,expenseController.createExpense );
router.delete('/delete/:id' ,userAuthentication.authenticate , expenseController.deleteExpense );
router.get('/get'  ,userAuthentication.authenticate , expenseController.getExpense );

router.get('/' , expenseController.expense );


module.exports = router;