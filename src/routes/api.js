const express = require("express");
const Post = require("../models/posts");
const multer = require("multer");
const upload = multer({ dest: "../blog/src/public/uploads/" });
const fs = require("fs");

const router = express.Router();

// set the current date to use it as part of a new slug
var today = new Date();
var dd = String( today.getDate() );
var mm = String( today.getMonth() + 1 );
var yy = today.getFullYear().toString().substr( -2 );
var hh = String( today.getHours() );
var fullTime = hh + dd + mm + yy;



// GET ALL the posts info from the db
router.get("/posts", function( req, res, next ) {
	Post.find({}).then(function( posts ) {
		res.send( posts );
	});
});

// GET info of the post matching the slug param
router.get("/post/:slug", (req, res, next) => {
	Post.findOne({ slug: req.params.slug }).then( (post) => {
		res.send( post );
	});
});

// CREATE a post adding the info to the db and uploading the image with multer
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

// UPDATE the db
router.put("/post/:id", upload.single("updatedImage"), function( req, res, next ) {
	// if the updateImage field has data, set the req.body.image = to the new filename
	// then get the post and delete the stored (old) image
	if ( req.file ) {
		req.body.image = req.file.filename;
		Post.findOne({ _id: req.params.id }).then(function( post ) {
			fs.unlink("../blog/src/public/uploads/" + post.image );
		});
	}
	// save the new fields to the db and upload the new image with multer
	Post.findByIdAndUpdate({ _id: req.params.id }, req.body ).then(function() {
		// we find again the object by id so we can get the updated object
		Post.findOne({ _id: req.params.id }).then(function( post ) {
			res.send( post );
		});
	});
});

// DELETE the post info from the db and the post image from uploads
router.delete("/post/:id", function( req, res, next ) {
	Post.findByIdAndRemove({ _id: req.params.id }).then(function( post ) {
		// delete the image
		fs.unlink("../blog/src/public/uploads/" + post.image );
		res.send( post );
	});
});

module.exports = router;
