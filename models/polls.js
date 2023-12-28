const { Schema, model } = require('mongoose')

module.exports = model(
	'polls',
	new Schema({
		messageId: String,
    controllerMessageId: String,
		endTime: Number,
		title: String,
		image: String,
		options: []
	})
)
