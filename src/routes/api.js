const express = require("express");
const Post = require("../models/posts");
const multer = require("multer");
const upload = multer({ dest: "../blog/src/public/uploads/" });

const router = express.Router();

// set the current date to use it as part of a new slug
var today = new Date();
var dd = String( today.getDate() );
var mm = String( today.getMonth() + 1 );
var yy = today.getFullYear().toString().substr( -2 );
var hh = String( today.getHours() );
var fullTime = hh + dd + mm + yy;



// get info of the post matching the slug param
router.get("/post/:slug", (req, res, next) => {
	Post.findOne({ slug: req.params.slug }).then( (post) => {
		res.send( post );
	});
});

// get from the db
router.get("/posts", function( req, res, next ) {
	Post.find({}).then(function( posts ) {
		res.send( posts );
	});
});

// add to the db using multer for the image upload
router.post("/posts", upload.single("image"), function( req, res, next ) {
	// we can access the text data with .body and the image data with .file
	// save the image name, title and content to mongodb
	Post.create({
		image: req.file.filename,
		title: req.body.title,
		content: req.body.content,
		introduction: req.body.introduction,
		slug: req.body.title.replace( /\s+/g, "-").replace( /\?/g, "").toLowerCase() + "-" + fullTime
	}).then( ( post ) => {
		res.send( post );
		// next is the next function on the middleware (index)
	}).catch( next );
});

// update the db
router.put("/post/:id", function( req, res, next ) {
	Post.findByIdAndUpdate({ _id: req.params.id }, req.body ).then(function() {
		console.log( req.body );
		// we find again the object by id so we can get the updated object
		Post.findOne({ _id: req.params.id }).then(function( post ) {
			res.send( post );
		});
	});
});

// delete from the db
router.delete("/post/:id", function( req, res, next ) {
	Post.findByIdAndRemove({ _id: req.params.id }).then(function( post ) {
		res.send( post );
	});
});

module.exports = router;
