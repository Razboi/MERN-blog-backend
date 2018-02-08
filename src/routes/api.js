const express = require("express");
const Post = require("../models/Posts");
const multer = require("multer");
const upload = multer({ dest: "../blog/src/public/uploads/" });
const fs = require("fs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// set the current date to use it as part of a new slug
var today = new Date();
var dd = String( today.getDate() );
var mm = String( today.getMonth() + 1 );
var yy = today.getFullYear().toString().substr( -2 );
var yyyy = today.getFullYear().toString();
var hh = String( today.getHours() );
var min = String( today.getMinutes() );
var fullTime = hh + dd + mm + yy;
var dateAndTime = `${dd}/${mm}/${yyyy} ${hh}:${min}`;

// ---------------------------- GET POSTS ------------------------------

// GET ALL the posts info from the db
router.get("/posts/:page", function( req, res, next ) {
	var skipNum = req.params.page * 7 - 7;
	Post.find({}, null, { skip: skipNum }).limit( 7 ).then(function( posts ) {
		res.send( posts );
	});
});

// GET post matching the slug param
router.get("/post/:slug", (req, res, next) => {
	Post.findOne({ slug: req.params.slug }).then( (post) => {
		res.send( post );
	});
});

// GET posts matching the search
router.get("/search/:kw/:page", (req, res, next) => {
	var skipNum = req.params.page * 7 - 7;
	// to perform case-insensitive matching on a variable I created a new regexp with the i modifier
	Post.find({
		$or: [
			{ title: new RegExp( req.params.kw, "i") },
			{ keywords: new RegExp( req.params.kw, "i") }
		]
	}, null, { skip: skipNum }).limit( 7 ).then(function( posts ) {
		res.send( posts );
	});
});

// GET posts matching the category
router.get("/category/:kw/:page", (req, res, next) => {
	var skipNum = req.params.page * 7 - 7;
	var catArr = req.params.kw.split(",");
	// to perform case-insensitive matching on a variable I created a new regexp with the i modifier
	Post.find({ categories: { $in: catArr } }, null, { skip: skipNum }).limit( 7 )
	.then(function( posts ) {
		res.send( posts );
	});
});

// ---------------------------------------------------------------------------

// -------------------------------- COUNTERS ---------------------------------

// count all posts
router.get("/count/posts", ( req, res, next) => {
	Post.count({}).then( (count) => {
		res.send([ count ]);
	});
});

// count all search results
router.get("/count/search/:kw", ( req, res, next) => {
	Post.count({
		$or: [
			{ title: new RegExp( req.params.kw, "i") },
			{ keywords: new RegExp( req.params.kw, "i") }
		]
	}).then( (count) => {
		res.send([ count ]);
	});
});

// count all category results
router.get("/count/category/:kw", ( req, res, next) => {
	Post.count({ categories: req.params.kw }).then( (count) => {
		res.send([ count ]);
	});
});

// ---------------------------------------------------------------------------

// ------------------------- CREATE | UPDATE | DELETE -------------------------

// CREATE a post adding the info to the db and uploading the image with multer
router.post("/posts", upload.single("image"), function( req, res, next ) {
	// check the authenticity of the token
	jwt.verify( req.body.token, process.env.JWT_SECRET, function( err, token ) {
		// if there's an error (fake token or non existent) send error and delete uploaded img
		// else create the post
		if ( err ) {
			fs.unlink("../blog/src/public/uploads/" + req.file.filename );
			res.send( err );
		} else {
			// we can access the text data with .body and the image data with .file
			// save the image name, title and content to mongodb
			Post.create({
				image: req.file.filename,
				title: req.body.title,
				content: req.body.content,
				introduction: req.body.introduction,
				categories: req.body.categories.split(" "),
				keywords: req.body.keywords.split(","),
				created: dateAndTime,
				author: req.body.username,
				slug: req.body.title.replace( /\s+/g, "-").replace( /\?/g, "").toLowerCase() + "-" + fullTime
			}).then( ( post ) => {
				res.send( post );
				// next is the next function on the middleware (index)
			}).catch( next );
		}
	});
});

// UPDATE the db
router.put("/post/:id", upload.single("updatedImage"), function( req, res, next ) {
	// check the authenticity of the token
	jwt.verify( req.body.token, process.env.JWT_SECRET, function( err, token ) {
		// if there's an error return it, else update
		if ( err ) {
			res.send( err );
		} else {
			// if the updateImage field has data (new img)
			// get the post and delete the stored (old) image
			if ( req.file ) {
				req.body.image = req.file.filename;
				Post.findOne({ _id: req.params.id }).then(function( post ) {
					fs.unlink("../blog/src/public/uploads/" + post.image );
				});
			}
			// save the new fields to the db and upload the new image with multer
			Post.findByIdAndUpdate({
				_id: req.params.id },
				{
				image: req.body.image,
				title: req.body.title,
				content: req.body.content,
				introduction: req.body.introduction,
				categories: req.body.categories.split(" "),
				keywords: req.body.keywords.split(",")
				}).then(function() {
				// we find again the object by id so we can get the updated object
				Post.findOne({ _id: req.params.id }).then(function( post ) {
					res.send( post );
				});
			});
		}
	});
});

// DELETE the post info from the db and the post image from uploads
router.delete("/post/:id", function( req, res, next ) {
	console.log( req );
	// check the authenticity of the token
	jwt.verify( req.body.token, process.env.JWT_SECRET, function( err, token ) {
		if ( err ) {
			send( err );
		} else {
			Post.findByIdAndRemove({ _id: req.params.id }).then(function( post ) {
				// delete the image
				fs.unlink("../blog/src/public/uploads/" + post.image );
				res.send( post );
			});
		}
	});
});

module.exports = router;
