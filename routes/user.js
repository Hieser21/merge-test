const express = require('express')
const router = express.Router()
const OTP = require('../models/OTP')
const user = require('../models/user')
const bcrypt = require('bcrypt')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const crypto = require('node:crypto')
const otpGenerator = require('otp-generator')
//Handlers from controllers
const {login, signup, gauth, otp, phoneLogin, phoneRegister, resetGet, forget, reset} = require("../controllers/auth")
const {auth, isStudent, isAdmin} = require('../middlewares/authMiddle')

router.post('/login', login)
router.post('/signup', signup)

router.post('/otp', otp)

router.post('/gauth', gauth)
router.post('/phone/register', phoneRegister);
router.post('/phone/login', phoneLogin);
router.post("/password-reset", forget);
router.get('/password-reset/:userId/:token', resetGet)
router.post('/password-reset/:userId/:token', reset)
router.post("/test",auth, (req,res)=>{
    res.json({
        success: true,
        message: "You are a valid Tester 👨‍💻"
    })
})
router.post('/cookies', (req, res) => {
    console.log(req.cookies, req.signedCookies)
    let token = req.cookies.token;
    let isValid = jwt.verify(token, process.env.JWT_SECRET)
    if (!isValid) {
        return res.status(401).json({success: false, message: "No token"})
    }
    return res.status(200).json({success: true, message: "Token valid!"})
})
//protected routes
router.get('/student', auth, isStudent, (req,res)=>{
    res.json({
        success: true,
        message: "You are a valid Student 🧑‍🎓"
    })
})

router.get('/admin', auth, isAdmin, (req,res)=>{
    res.json({
        success: true,
        message: "You are a valid Admin 😎"
    })   
})


module.exports = router
