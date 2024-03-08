const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Function to generate JWT token
exports.generateToken = (id, isPremiumUser) => {
    const payload = { userId: id, isPremiumUser };
    const secretKey = 'secretkey';
    return jwt.sign(payload, secretKey); // Signing the token with the payload and secret key
};


// Controller for user signup
exports.postSignup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Check if user with the given email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.log("User already exists in the database");
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        await User.create({ name, email, password: hashedPassword });
        console.log("User created successfully");
        res.status(200).json({ success: true, message: 'User created successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// Controller for rendering login page
exports.getLogin = (req, res) => {
    res.sendFile('login.html', { root: './view' }); 
}

// Controller for user login
exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('User does not exist');
            return res.status(401).json({ success: false, message: 'User does not exist' });
        }

        // Compare passwords
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            // Generate token and send it in response
            const token = exports.generateToken(user.id , user.isPremiumUser);

            console.log("Login successful");
            res.status(200).json({ success: true, message: "User logged in successfully", token });
        } else {
            console.log('Incorrect password');
            res.status(401).json({ success: false, message: 'Incorrect password' });
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};



// Controller to handle GET request to fetch user data
exports.getUserData = async (req, res) => {
    try {
        // Assuming you have the user ID available in the request object
        const userId = req.user.id;

        // Fetch user data from the database based on user ID
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
