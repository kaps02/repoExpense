const Forgotpassword = require('../models/passwordModel');
const User = require("../models/userModel");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');


exports.forgotpassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({
                message: "This Email is not registered",
            });
        }

        // Generate UUID for password reset link
        const id = uuidv4();
        const resetLink = `http://localhost:5000/password/resetpassword/${id}`;

        // Set up Sendinblue API client
        var defaultClient = SibApiV3Sdk.ApiClient.instance;
        var apiKey = defaultClient.authentications["api-key"];
        apiKey.apiKey = process.env.EMAIL_API_KEY

        // Create an instance of the Sendinblue TransactionalEmailsApi
        var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

        // Prepare email data
        const sender = { email: "kapil02rahate@gmail.com" };
        const sendSmtpEmail = {
            sender,
            to: [{ email: user.email, name: user.name }],
            subject: "Password Reset Request",
            textContent: 'Click the link to reset your password',
            htmlContent: `<a href="${resetLink}">Reset Password</a>`,
        };

        // Send the email
        await apiInstance.sendTransacEmail(sendSmtpEmail);

        // Save the UUID in the database for future verification
        await Forgotpassword.create({ id, active: true, UserId: user.id });

        // Respond with success message
        res.status(200).json({ message: "Password reset link sent successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.resetpassword = async (req, res) => {
    const id = req.params.id;
    const forgotpasswordrequest = await Forgotpassword.findOne({ where: { id } })
    //console.log("id..", id, forgotpasswordrequest);

    if (forgotpasswordrequest) {
        forgotpasswordrequest.update({ active: false });
        res.status(200).send(`<html>
                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                            console.log('called...')
                                        }
                                    </script>
                                    <form action="/password/updatepassword/${id}" method="get">
                                        <label for="newpassword">Enter New password</label>
                                        <input name="newpassword" type="password" required></input>
                                        <button>reset password</button>
                                    </form>
                                </html>`
        )
        res.end()

    } else {
        console.log("error while resetting password.......");
        res.status(404).json({ error: 'No user Exists', success: false })

    }
}


exports.updatepassword = async (req, res) => {
    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;
        console.log(newpassword , resetpasswordid ,"......")

        const resetpasswordrequest = await Forgotpassword.findOne({ where: { id: resetpasswordid } });
        if (!resetpasswordrequest) {
            return res.status(404).json({ error: 'Link Expire...', success: false });
        }

        const user = await User.findOne({ where: { id: resetpasswordrequest.UserId } });    //exist in user table
        if (!user) {
            return res.status(404).json({ error: 'No user Exists', success: false });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newpassword, salt);

        await user.update({ password: hash });
        console.log("password updated successfully....")
        res.status(201).json({ message: 'Successfully updated the new password' });
    } catch (error) {
        console.error(error);
        return res.status(403).json({ error, success: false });
    }
};
