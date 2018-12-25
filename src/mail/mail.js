const nodeMailer = require('nodemailer');
const config = require('../../config/config');

// Email templates
const verifyEmailTemplate = require('./verifyEmailTemplate');
const recoverPasswordTemplate = require('./recoverPasswordTemplate');

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
            html: verifyEmailTemplate({user, config})
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
            html: recoverPasswordTemplate({user, config})
        };

        transporter.sendMail(options, error => {
            if (error) throw error;
        });
    }
};
