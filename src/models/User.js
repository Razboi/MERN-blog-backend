const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
	username: { type: String, required: true, lowercase: true, index: true },
	passwordHash: { type: String, required: true }
}, { timestamps: true });
// timestamps is an additional option


UserSchema.methods.isValidPassword = function isValidPassword( password ) {
	return bcrypt.compareSync( password, this.passwordHash );
};

UserSchema.methods.generateJWT = function generateJWT() {
	return jwt.sign({
		// public data
		username: this.username
	},
	process.env.JWT_SECRET
);
};

UserSchema.methods.toAuthJSON = function toAuthJSON() {
	return {
		username: this.username,
		token: this.generateJWT()
	};
};

const User = mongoose.model("User", UserSchema );
module.exports = User;
