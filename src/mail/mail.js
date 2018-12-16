const nodeMailer = require('nodemailer');
const config = require('../../config/config');

const transporter = nodeMailer.createTransport(config.mail);

module.exports = {
    sendVerification(address, apikey) {
        const options = {
            from: `Vue-Blogfront <${config.mail.auth.user}>`,
            to: address,
            subject: "Email Verification",
            html: `
            <div class="main">
                <h1>Email Verification!</h1>
                <a href="${config.server.domain}/verify/${apikey}">Verify your email address!</a>
            </div>
            `
        };

        transporter.sendMail(options, (error, info) => {
            if (error) throw error;
        });
    }
};
