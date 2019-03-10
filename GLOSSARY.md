<h4 align="center">
    <img src="./img/logo.svg" width="20%" height="20%">
    <h3 align="center">Glossary</h3>
</h4>

This document will serve to be an overview of the code found in this repository, aiming to make the function of all of its parts clear and understandable, making it easier for one to contribute.

`vue-blog-backend` was created by Ambrest Designs LLC as a backend for `vue-blogfront`, but it can of course be used by any other front end.

## Dependencies

`vue-blog-backend` depends on the following node modules:

* `express` - Receive and send requests
* `graphql` - Used to implement the `vue-blog-backend` api
* `graphql-tools` - Allows the modularization of our api
* `graphql-middleware` - Allows us to modularize validation
* `mongodb` - For interfacing with the database
* `mongoose` - For simplification of database interfacing
* `bcrypt` - Generate password hashes
* `uuid` - Generate API Keys
* `compression` - Enable the use of G-Zip
* `cors` - Enable Cross Origin Requests

## Source

```text
app.js - Contains the code to start and run the server.
config.json - Contains all of the settings for the server.

/src
    /api
        api.js - Integrates all of the api points into one, configures GraphQL

        /api-points
            comment.js - Contains all of the GraphQL information for the 'comment' api point
            info.js - Contains all of the GraphQL information for the 'info' api point
            post.js - Contains all of the GraphQL information for the 'post' api point
            user.js - Contains all of the GraphQL information for the 'user' api point
    /auth
        auth.js - Contains tools for generating API keys and unique IDs

    /database
        db.js - Contains all code for interfacing with MongoDB

    /tools
        comment.js - Implementation of the 'comment' api point
        post.js - Implementation of the 'post' api point
        user.js - Implementation of the 'user' api point

    /validation
        validation.js - Middleware for validating all incoming data in GraphQL
```
