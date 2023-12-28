const { ChannelType, Guild } = require('discord.js')

/**
 * @param {String} messageId
 * @param {Guild} guild
 */
module.exports = async (messageId, guild) => {
	const channels = guild.channels.cache
		.filter(
			(channel) =>
				channel.type === ChannelType.GuildText ||
				channel.type === ChannelType.GuildAnnouncement
		)
		.map((c) => c)

	for (const channel of channels) {
		try {
      const msg = await channel.messages.fetch(messageId)
      return msg
    } catch(e) {}
	}

	// const message = await getMessage(channels)
	// return message
}
