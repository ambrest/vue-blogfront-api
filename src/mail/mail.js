const nodeMailer = require('nodemailer');
const config = require('../../config/config');

const transporter = nodeMailer.createTransport(config.mail);

module.exports = {
    sendVerification(user) {
        const options = {
            from: `Vue-Blogfront <${config.mail.auth.user}>`,
            to: user.address,
            subject: "Email Verification",
            html: `
            <div class="main">
                <h1>Welcome to ${config.info.title}, ${user.fullname}!</h1>
                <a href="${config.server.api}/verify/${user.apikey}">Please click this link to verify your email address!</a>
                
                <p> Did you know that ${config.info.title} runs on the open source software <bold>vue-blogfront</bold> by Ambrest Designs LLC? ch</p>
            </div>
            `
        };

        transporter.sendMail(options, (error, info) => {
            if (error) throw error;
        });
    }
};
