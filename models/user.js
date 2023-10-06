const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required : true
    },
    email: {
        type: String,
        trim: true
    },
    phone: {
        type: String
    },
    password: {
        type: String,
        required : true
    },
    role: {
        type: String,
        enum : ['Admin', 'Student', 'Visitor']
    },
    authType: {
        type: String,
        enum: ['google', 'login', 'phone']
    },
    token: {
        type: String
    }
})

module.exports = mongoose.model('user', userSchema)