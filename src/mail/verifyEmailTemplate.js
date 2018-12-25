module.exports = ({config, user}) => `
<div class="main">

    <h2>Welcome to ${config.info.title}, ${user.fullname}!</h2>

    <div class="content">
        <a href="${config.server.api}/verify/${user.apikey}" class="action-btn">Click here to verify your email address!</a>
        <p class="text"> Did you know that ${config.info.title} runs on the open source software by Ambrest Designs LLC? Check it out on <a href="https://github.com/ambrest/vue-cloudfront">vue-blogfront</a>!</p>
    </div>
    
</div>
`;
