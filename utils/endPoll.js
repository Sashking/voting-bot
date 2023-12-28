const {
	ActionRowBuilder,
	ButtonBuilder,
	Message,
	ButtonStyle
} = require('discord.js')
const polls = require('../models/polls')

/**
 * @param {Message} pollMessage
 * @param {Message} controllerMessage
 */
module.exports = async (pollMessage, controllerMessage, options) => {
	const pollOptionButtons = []
	const pollNumberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']

	for (let i = 0; i < options.length; i++) {
		const option = options[i]
		pollOptionButtons.push(
			new ButtonBuilder()
				.setCustomId(`option${i}`)
				.setEmoji(pollNumberEmojis[i])
				.setLabel(truncate(option.name, 80))
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true)
		)
	}

	pollOptionButtons.length = options.length

	const pollActionRow = new ActionRowBuilder().setComponents(
		pollOptionButtons
	)

  const controllerPollEndEarlyButton = new ButtonBuilder()
		.setCustomId('endPoll')
		.setEmoji('🔒')
		.setLabel('Закончить голосование')
		.setStyle(ButtonStyle.Danger)
		.setDisabled(true)

	const controllerActionRow = new ActionRowBuilder().addComponents(
		controllerPollEndEarlyButton
	)

	if (pollMessage.editable) {
		await pollMessage.edit({
			components: [pollActionRow]
		})
	}

	if (controllerMessage.editable)
		await controllerMessage.edit({
			content: 'Голосование окончено',
			components: [controllerActionRow]
		})

	await polls.findOneAndDelete({ messageId: pollMessage.id })
}

function truncate(str, maxlength) {
	return str
		? str.length > maxlength
			? str.slice(0, maxlength - 1) + '…'
			: str
		: '---'
}
