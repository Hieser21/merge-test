const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600,
    },
});

async function sendResetEmail(email, name, token, id){
    try {
     let mail =  await mailSender(email, name, 'Password Reset', `<p>This email is sent in response to a password reset request for ${email}</p>
            <p>Click this link for resetting your account <a href="https://login-liard-six.vercel.app
reset/${id}/${token}">https://login-liard-six.vercel.app
reset/${id}/${token}</a></p>
        `)

        console.log ("Reset mail sent ", mail );
    }
    catch (error) {
        console.log(error)
    }
}
tokenSchema.pre("save", async function (next) {
	console.log("New document saved to database");
	// Only send an email when a new document is created
	if (this.isNew) { 
		await sendResetEmail(this.email, this.name, this.token, this.userId);
	}
	next();
});

module.exports = mongoose.model("Token", tokenSchema);