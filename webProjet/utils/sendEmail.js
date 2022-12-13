const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (email, subject, link) => {
    try {
        const transporter = nodemailer.createTransport({
            service:"gmail",
            host:"stmp.gmail.com",
            // service: process.env.SERVICE,
            // port: 587,//gmail
            secure: true,//ssl
            auth: {
                user: process.env.USER,
                pass: process.env.EMAIL_TEST_APP_PSWD,
            },
        });
        var link =  ''+link+ '';

        let info=await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: "password reset", 

            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +  
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +  
                   ''+link+ ''+'\n\n' +  
                'If you did not request this, please ignore this email and your password will remain unchanged.\n',

        });
        console.log(info);
        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};
module.exports = sendEmail;
