module.exports = {
    username: /^[\w\d]{2,15}$/,
    password: /^(.){4,20}$/,
    apikey: /^[a-z\d]{8}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{12}$/,
    id: /^_[a-z\d]{9}$/,
    fullname: /^[a-zA-Z]{1,20} [a-zA-Z]{1,20}$/,
    email: /^[\w\d]{1,20}@[\w\d]{1,20}\.[\w]{2,10}$/,
    title: /^[\w\d '".,/+\-!?:;]{5,200}$/
};
