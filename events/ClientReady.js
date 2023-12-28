const { Events, Client } = require('discord.js')
const polls = require('../models/polls')
const endPoll = require('../utils/endPoll')
const getMessageById = require('../utils/getMessageById')

module.exports = {
	name: Events.ClientReady,
	once: true,
	/**
	 * @param {Client} client
	 */
	execute(client) {
		console.log(client.user.tag)
    const guild = client.guilds.cache.get('1185909396199460934')

		polls.find().then(async (polls) => {
      for (const poll of polls) {
				const pollMessage = await getMessageById(poll.messageId, guild)
				const controllerMessage = await getMessageById(poll.controllerMessageId, guild)

        console.log(`restarting a timeout for poll ${poll.title}`)
				setTimeout(() => {
					endPoll(pollMessage, controllerMessage, poll.options)
				}, Math.max(poll.endTime - Date.now(), 0))

      }
		})
	}
}
