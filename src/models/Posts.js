const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// create ninja Schema & model
const PostSchema = new Schema({
	title: {
		type: String,
		required: [ true, "Name field is required" ]
	},
	content: {
		type: String,
		required: [ true, "Content field is required" ]
	},
	image:  {
		type: String
	},
	slug: {
		type: String
	},
	introduction: {
		type: String
	},
	categories: {
		type: Array
	},
	keywords: {
		type: Array
	},
	created: {
		type: String
	},
	author: {
		type: String
	}
});

const Post = mongoose.model("post", PostSchema );

module.exports = Post;
