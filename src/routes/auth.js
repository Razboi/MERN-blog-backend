const express =  require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/", (req, res) => {
	console.log( req.body );
	const { credentials } = req.body;
	User.findOne({ username: credentials.username }).then( user => {
		if ( user && user.isValidPassword( credentials.password ) ) {
			res.json({ user: user.toAuthJSON() });
		} else {
			res.status( 400 ).json({ errors: { global: "Invalid credentials" } });
		}
	});
});

module.exports = router;
