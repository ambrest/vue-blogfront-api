const nodeMailer = require('nodemailer');
const config = require('../../config/config');

const transporter = nodeMailer.createTransport(config.mail);

module.exports = {

    /**
     * Sends a user a link with an API key to verify their email address
     * @param user - the complete user object to send the email to
     */
    sendVerification(user) {
        const options = {
            from: `Vue-Blogfront <${config.mail.auth.user}>`,
            to: user.email,
            subject: 'Email Verification',
            html: `
            <div class="main">
                <h1>Welcome to ${config.info.title}, ${user.fullname}!</h1>
                <a href="${config.server.api}/verify/${user.apikey}">Please click this link to verify your email address!</a>
                
                <p> Did you know that ${config.info.title} runs on the open source software <b>vue-blogfront</b> by Ambrest Designs LLC?</p>
            </div>
            `
        };

        transporter.sendMail(options, error => {
            if (error) throw error;
        });
    },

    /**
     * Send a password recovery link to a user with a verified email address
     * @param user - the complete user object
     */
    recoverPassword(user) {
        const options = {
            from: `Vue-Blogfront <${config.mail.auth.user}>`,
            to: user.email,
            subject: 'Email Verification',
            html: `
            <div class="main">
                <h1>Hey ${user.fullname}! Forgot your password?</h1>
                <a href="${config.server.domain}/recover/${user.apikey.key}">Please click this link to reset your password!</a>
                
                <p> Did you know that ${config.info.title} runs on the open source software <bold>vue-blogfront</bold> by Ambrest Designs LLC?</p>
            </div>
            `
        };

        transporter.sendMail(options, error => {
            if (error) throw error;
        });
    }
};
