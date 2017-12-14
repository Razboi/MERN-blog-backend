const express =  require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/", (req, res) => {
	console.log( req.body );
	User.findOne({ username: req.body.username }).then( user => {
		if ( user && user.isValidPassword( req.body.password ) ) {
			res.json({ user: user.toAuthJSON() });
		} else {
			res.status( 400 ).json({ errors: { global: "Invalid credentials" } });
		}
	});
});

module.exports = router;
