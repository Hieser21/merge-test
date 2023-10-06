const mongoose = require("mongoose")
const mailSender = require('../utils/mailSender')
const messageSender = require('../utils/messageSender')
const OTPSchema = new mongoose.Schema({
	email: {
		type: String,
	},
	name: {
		type: String,
	},
	otp: {
		type: String,
		required: true,
	},
	type: {
		type: String
	},
	phone: {
		type: String
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
	},
})

// Define a function to send emails
async function sendVerificationEmail(email, name, otp) {
	// Send the email using our custom mailSender Function
	try {
		const mailResponse = await mailSender(
			email,
			name,
			"Verification Email",
			`<p>This email is sent in response to a login attempt on Apar's Classroom </p>
             <p> This is your one-time password:-> ${otp} </p>
			 <p>If you did not attempt to login, you can safely ignore this</p>
            `
		);
		console.log("Email sent successfully: ", mailResponse);
	} catch (error) {
		console.log("Error occurred while sending email: ", error);
		throw error;
	}
}
async function sendMessage(phone, otp) {
	try {
		const res = await messageSender(phone,`${otp}%20is%20your%20verification%20code%20for%20aparsclassroom.com`)
		console.log(res)
	} catch (error) {
		console.log(error)
	}
}

OTPSchema.pre("save", async function (next) {
	console.log("New document saved to database");
	console.log(this.email, this.name, this.otp)
	// Only send an email when a new document is created
	if (this.isNew) {
		if (this.type == 'sms') {
			await sendMessage(this.phone, this.otp);
		}
		await sendVerificationEmail(this.email, this.name, this.otp);
	}
	next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;