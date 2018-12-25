module.exports = ({config, user}) => `
<div class="main">

    <h2>Hey ${user.fullname}! Forgot your password?</h2>

    <div class="content">
        <a href="${config.server.domain}/recover/${user.apikey.key}" class="action-btn">Please click this link to reset your password!</a>
        <p class="text"> Did you know that ${config.info.title} runs on the open source software by Ambrest Designs LLC? Check it out on <a href="https://github.com/ambrest/vue-cloudfront">vue-blogfront</a>!</p>
    </div>

</div>

`;
