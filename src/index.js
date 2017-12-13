const express = require("express");
const routes = require("./routes/api");
const auth = require("./routes/auth");
const bodyParser = require("body-parser");
const busboy = require("connect-busboy");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Promise = require("bluebird");

// for env variables
dotenv.config();
// set up express
const app = express();

// connect to mongodb
mongoose.connect( process.env.MONGODB_URL, { useMongoClient: true });
mongoose.Promise = Promise;

// this needs to be set before the routes
app.use( bodyParser.json() );
app.use( busboy() );

app.use( "/api", routes );
app.use("/api/auth", auth );

// this will be the "next" parameter
app.use(function( err, req, res, next ) {
	// console.log( err );
	res.status( 422 ).send({ error: err.message });
});

// listen for requests (env variable or 8080)
app.listen( process.env.port || 8080, function() {
	console.log("Running on 8080");
});
