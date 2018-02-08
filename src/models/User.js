const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
	username: { type: String, required: true, lowercase: true, index: true },
	passwordHash: { type: String, required: true }
}, { timestamps: true });
// timestamps is an additional option

// compare the hash of the password used to login with the hash stored
UserSchema.methods.isValidPassword = function isValidPassword( password ) {
	return bcrypt.compareSync( password, this.passwordHash );
};

// generate a jsonwebtoken
UserSchema.methods.generateJWT = function generateJWT() {
	return jwt.sign({
		// public data
		username: this.username
	},
	process.env.JWT_SECRET
);
};

// return the username and the token generated
UserSchema.methods.toAuthJSON = function toAuthJSON() {
	return {
		username: this.username,
		token: this.generateJWT()
	};
};

const User = mongoose.model("User", UserSchema );
module.exports = User;
