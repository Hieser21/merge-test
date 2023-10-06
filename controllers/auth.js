const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const user = require("../models/user")
const jwt = require('jsonwebtoken')
const OTP = require('../models/OTP')
const Token = require('../models/token')
const otpGenerator = require("otp-generator");
const mailSender = require('../utils/mailSender');
require('dotenv').config()
//signup handle
exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body

        // Check if All Details are there or not
        if (!name ||
            !email ||
            !password
        ) {
            return res.status(403).send({
                success: false,
                message: "All Fields are required",
            });
        }

        //check if user already exists
        const existingUser = await user.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }
        //generate OTP for registration
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        const result = await OTP.findOne({ otp: otp });
        console.log("OTP", otp);
        console.log("Result", result);
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
            });
        }
        const otpPayload = { email, name, otp };

        const otpBody = await OTP.create(otpPayload);

        console.log('OTP Body ', otpBody)


        //secure password
        let hashedPassword
        try {
            hashedPassword = await bcrypt.hash(password, 10)
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: `Hashing pasword error for ${password}: ` + error.message
            })
        }
        const payload = {
            email: email,
            name: name,
            role: 'Visitor'
        }
        let token = jwt.sign(payload,
            process.env.JWT_SECRET,
            { expiresIn: "2 days" }
        )
        const User = await user.create({
            name, email, password: hashedPassword, role: "Visitor", authType: 'login', token
        })
        let date = Date.now() + 172800000
        let expiry = new Date(date)
        res.header('Set-Cookie', `token = ${token}; HttpOnly; Expires=${expiry}`)
        res.header('Access-Control-Allow-Origin', "*")
        return res.status(200).json({
            success: true,
            User,
            type: 'reg',
            message: "user created successfully ✅"
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "User registration failed"
        })
    }
}

exports.login = async (req, res) => {

    try {
        //data fetch

        const { email, password } = req.body
        //validation on email and password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the details carefully"
            })
        }

        //check for registered User
        let User = await user.findOne({ email })
        //if user not registered or not found in database
        if (!User) {
            return res.status(401).json({
                success: false,
                message: "You have to Signup First"
            })
        }

        const payload = {
            email: User.email,
            id: User._id,
            role: User.role,
        }
        let name;
        //verify password and generate a JWt token 🔎
        if (await bcrypt.compare(password, User.password)) {
            //if password matched
            let token = jwt.sign(payload,
                process.env.JWT_SECRET,
                { expiresIn: "2 days" }
            )
            User = User.toObject()
            if (User.authType == 'google') {
                return res.status(403).json({ success: false, message: 'Account uses Google OAuth for sign-in' })
            }
            User.token = token
            name = User.name
            User.password = undefined
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true  //It will make cookie not accessible on client side -> good way to keep hackers away

            }
            let date = Date.now() + 172800000
            let expiry = new Date(date)
            res.header('Set-Cookie', `token = ${token}; HttpOnly; Expires=${expiry}`)
            res.header('Access-Control-Allow-Origin', "*")
            res.status(200).json({
                success: true,
                User,
                type: 'login',
                message: "Logged in Successfully✅"

            })
        } else {
            //password donot matched
            return res.status(403).json({
                success: false,
                message: "Password incorrects⚠️"
            })
        }

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Login failure⚠️ :" + error
        })
    }

}

exports.gauth = async (req, res) => {
    console.log(req.body.data)
    const { email, name } = req.body.data
    try {
        let newUser;
        let User = await user.findOne({ email: email })
        if (!User) {
            newUser = await user.create({ name, email, password: "[placeholder]", authType: 'google', role: "Visitor",})
            console.log(newUser)
            var otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            const result = await OTP.findOne({ email: email });
            console.log("OTP", otp);
            console.log("Result", result);
            while (result) {
                otp = otpGenerator.generate(6, {
                    upperCaseAlphabets: false,
                });
            }
            const otpPayload = { email, name, otp };

            const otpBody = await OTP.create(otpPayload);
            const payload = {
                email: email,
                name: name,
                role: 'Visitor'
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "2 days"});
            console.log('OTP Body ', otpBody)
            let date = Date.now() + 172800000
            let expiry = new Date(date)
            res.header('Set-Cookie', `token = ${token}; HttpOnly; Expires=${expiry}`)
            return res.status(200).json({
                success: true,
                User: {
                    email: email,
                    name: name,
                    role: 'Visitor',
                    token: token
                },
                type: 'reg',
                message: "Registration successful"
            })

        }
        User = User.toObject()
        const payload = {
            email: User.email,
            id: User._id,
            role: User.role
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "2 days"});
        
            User.token = token

        if (User.authType == 'login') {
            return res.status(403).json({ success: false, message: "Account uses User-Password system for sign in" })

        }
        let date = Date.now() + 172800000
        let expiry = new Date(date)
        res.header('Set-Cookie', `token = ${token}; HttpOnly; Expires=${expiry}`)
        return res.status(200).json({
            success: true,
            User,
            type: 'login',
            message: "Login successful"
        })
    } catch (e) { console.log(e) }
}

exports.otp = async (req, res) => {
    let otp = req.body.otp
    const response = await OTP.findOne({ otp: otp }).sort({ createdAt: -1 }).limit(1).then((res) => { return res });

    if (!response) {
        // Invalid OTP
        return res.status(400).json({
            success: false,
            message: "The OTP is not valid",
        });
    }


    res.status(200).json({ success: true, message: "The OTP is valid!" })

}
exports.phoneRegister = async (req, res) => {
    console.log(req.body)
    const { phone, name } = req.body
    let User = await user.findOne({ phone: phone })
    if (!User) {
        const payload = {
                phone: phone,
                name: name,
                role: "Visitor"
            }
            let token = jwt.sign(payload,
                process.env.JWT_SECRET,
                { expiresIn: "2 days" }
            )
        let newUser = await user.create({ phone, email: "[placeholder]", name, role: 'Visitor', authType: 'phone', password: "[placeholder]", token })
        console.log(newUser)
        newUser = newUser.toObject()
        
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        const result = await OTP.findOne({ otp: otp });
        console.log("OTP", otp);
        console.log("Result", result);
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
            });
        }
        const otpPayload = { phone, name, otp, type: 'sms' };

        const otpBody = await OTP.create(otpPayload);
        console.log('OTP Body ', otpBody)
        let date = Date.now() + 172800000
        let expiry = new Date(date)
        res.header('Set-Cookie', `token = ${token}; HttpOnly; Expires=${expiry}`)
        return res.status(200).json({
            success: true,
            User: newUser,
            type: 'reg',
            message: "Registration successful"
        })
    }
    return res.status(400).json({ success: false, message: "User already exists!" })
}

exports.phoneLogin = async (req, res) => {
    const { phone } = req.body
    let User = await user.findOne({ phone: phone })
    if (!User) {
        return res.status(403).json({ success: false, message: "User has not registered yet!" })
    }
    User = User.toObject()
    const payload = {
        phone: User.phone,
        id: User._id,
        role: User.role
    }
    console.log(User)
    if (User.authType == 'phone') {
        let token = jwt.sign(payload,
            process.env.JWT_SECRET,
            { expiresIn: "2 days" }
        )
        User.token = token

    }
    if (User.authType == 'login' || User.authType == 'google') {
        res.status(403).json({ success: false, message: "Account uses User-Password/Google Auth system for sign in" })

    }
    var otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
    });
    const result = await OTP.findOne({ otp: otp });
    console.log("OTP", otp);
    console.log("Result", result);
    while (result) {
        otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
        });
    }
    let name = User.name
    const otpPayload = { phone, name, otp, type: 'sms' };

    const otpBody = await OTP.create(otpPayload);

    console.log('OTP Body ', otpBody)
    let date = Date.now() + 172800000
    let expiry = new Date(date)
    res.header('Set-Cookie', `token = ${token}; HttpOnly; Expires=${expiry}`)
    return res.status(200).json({
        success: true,
        User,
        type: 'login',
        message: "Login successful"
    })

}
exports.forget = async (req, res,) => {
    try {
        let token;
        const User = await user.findOne({ email: req.body.email }).then(res => res);
        if (!user) return res.status(400).send("user with given email doesn't exist");
        token = await Token.create({
            email: User.email,
            name: User.name,
            userId: User._id,
            token: crypto.randomBytes(32).toString("hex")
        });

        console.log(token)
        return res.status(200).json({ success: true, message: "Reset email sent." })
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
}
exports.resetGet = async (req, res) => {
    const { userId, token } = req.params;

    let resetUser = Token.findOne({ userId: userId, token: token })
    if (!resetUser) {
        return res.status(404).json({
            success: false,
            message: 'Link expired or invalid'
        })
    }

}
exports.reset = async (req, res) => {
    const { password, confirmPassword } = req.body
    const { userId, token } = req.params
    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Password does not match confirm password field. Double-check your password."
        })

    }
    let hashedPassword
    try {
        hashedPassword = await bcrypt.hash(password, 10)
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Hashing pasword error for ${password}: ` + error.message
        })
    }
    let validLink = Token.findOne({ userId: userId, token: token })
    if (validLink) {
        let User = await user.findByIdAndUpdate(userId, { password: hashedPassword, authType: 'login' })
        console.log(User)
        return res.status(200).json({ success: true, message: "Password changed" })

    } else {
        return res.status(404).json({ success: false, message: "Route does not exist." })
    }
}
