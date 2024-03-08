require('dotenv').config({ path: 'E:/dec_Batch/expense_website/signup/.env' });

const Razorpay = require('razorpay');
const Order = require('../models/orderModel');
const User = require('../models//userModel');
const {generateToken} = require('../controllers/userController')

const razorpayInstance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});

var options = {
    amount: 10000,  // amount in the smallest currency unit [no * 100]
    currency: "INR",
    receipt: "order_rcptid_11"
};

exports.createPayment = (req, res) => {
    // Create Razorpay order
    razorpayInstance.orders.create(options, (err, order) => {
        console.log(options)
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error creating order', message: err.message });
        }

        // Create order in database table
        req.user.createOrder({ orderId: order.id, status: "PENDING" })
            .then(() => {
                //console.log("order created successfuly ..." ,order,  razorpayInstance.key_id )
                return res.status(201).json({ order, key_id: razorpayInstance.key_id });
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ error: 'Error creating order in database', message: err.message });
            });
    });
};

exports.updatePayment = async (req, res) => {
    try {console.log(req.body)
        const { order_id, payment_id,  status } = req.body;
       // console.log('tbl order id..' , orderId );
        const userId = req.user.id;
        const order = await Order.findOne({ where: { orderId : order_id } });
        //console.log("order is :", order);
        const promise1 = await Order.update({ paymentId: payment_id, status: status },{ where: { orderId: order_id } });
        const promise2 = await req.user.update({ isPremiumUser: true });

        Promise.all([promise1, promise2])
            .then(() => {
                
                return res.status(202).
                json({ success: true, message: "Transaction Successful" , token : generateToken(userId , true)});
            })
            .catch((error) => { 
                throw new Error(error);
            });
    } catch (err) {
        console.log(err);
        res.status(403).json({ error: err, message: "Something went wrong" });
    }
};


// Controller to handle GET request to fetch user data
exports.getUserData = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Send user data in the response
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            isPremiumUser: user.isPremiumUser
            // Add other fields as needed
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
