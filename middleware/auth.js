const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers['authorization']; // Corrected access to headers
        console.log('Token in auth :.......',token);

        if (!token) {
            return res.status(401).json({ success: false, message: 'Token not provided' });
        }

        const user = jwt.verify(token , 'secretkey');
        console.log('user id is:......', user.userId);

        const foundUser = await User.findByPk(user.userId);

        if (!foundUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Attach user to request object
        req.user = foundUser;
        next();
    } catch (err) {
        console.error('Authentication error:........', err);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
}

module.exports = { authenticate };
