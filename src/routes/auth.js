const express =  require("express");
const router = express.Router();
const User = require("../models/User");

// send credentials to verify user
router.post("/", (req, res) => {
	const { credentials } = req.body;
	// search a user object with that username
	User.findOne({ username: credentials.username }).then( user => {
		// if the user exists and the password is valid set the jsonwebtoken else error
		if ( user && user.isValidPassword( credentials.password ) ) {
			res.json({ user: user.toAuthJSON() });
		} else {
			res.status( 400 ).json({ errors: { global: "Invalid credentials" } });
		}
	});
});

module.exports = router;
