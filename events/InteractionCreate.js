const { Events, Interaction } = require('discord.js')
const polls = require('../models/polls')
const renderPoll = require('../utils/renderPoll')
const endPoll = require('../utils/endPoll')
const getMessageById = require('../utils/getMessageById')

module.exports = {
	name: Events.InteractionCreate,
	/**
	 * @param {Interaction} interaction
	 */
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(
				interaction.commandName
			)

			if (!command) {
				console.error(
					`No command matching ${interaction.commandName} was found.`
				)
				return
			}

			try {
				await command.execute(interaction)
			} catch (error) {
				console.error(error)
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({
						content:
							'There was an error while executing this command!',
						ephemeral: true
					})
				} else {
					await interaction.reply({
						content:
							'There was an error while executing this command!',
						ephemeral: true
					})
				}
			}
		} else if (interaction.isButton()) {
			if (interaction.customId.startsWith('option')) {
				const messageId = interaction.message.id

				let alreadyVoted = false
				let alreadyVotedIndex = 0

				await polls.findOne({ messageId }).then((poll) => {
					poll.options.forEach(async (option, i) => {
						if (
							option.votes.find(
								(vote) => vote === interaction.user.id
							)
						)
							return (
								(alreadyVoted = true), (alreadyVotedIndex = i)
							)
					})
				})

				if (alreadyVoted) {
					const voteIndex = interaction.customId.substring(
						interaction.customId.length - 1
					)

					if (voteIndex == alreadyVotedIndex) {
						await polls
							.findOne({ messageId })
							.then(async (poll) => {
								poll.options[voteIndex].votes.splice(
									poll.options[voteIndex].votes.indexOf(
										interaction.user.id
									),
									1
								)
								poll.markModified('options')
								await poll
									.save()
									.catch((err) => console.log(err))

								await interaction.reply({
									content: `Вы убрали свой голос.`,
									ephemeral: true
								})
							})
					} else {
						await polls
							.findOne({ messageId })
							.then(async (poll) => {
								poll.options[voteIndex].votes.push(
									interaction.user.id
								)
								poll.options[alreadyVotedIndex].votes.splice(
									poll.options[
										alreadyVotedIndex
									].votes.indexOf(interaction.user.id),
									1
								)
								poll.markModified('options')
								await poll
									.save()
									.catch((err) => console.log(err))

								await interaction.reply({
									content: `Вы поменяли свой голос с \`${poll.options[alreadyVotedIndex].name}\` на \`${poll.options[voteIndex].name}\`!`,
									ephemeral: true
								})
							})
					}
				} else {
					const voteIndex = interaction.customId.substring(
						interaction.customId.length - 1
					)

					await polls.findOne({ messageId }).then(async (poll) => {
						poll.options[voteIndex].votes.push(interaction.user.id)
						poll.markModified('options')
						await poll.save().catch((err) => console.log(err))

						await interaction.reply({
							content: `Вы проголосовали за вариант \`${poll.options[voteIndex].name}\`!`,
							ephemeral: true
						})
					})
				}

				await polls.findOne({ messageId }).then(async (poll) => {
					await interaction.message.edit({
						embeds: [
							renderPoll(
								poll.title,
								poll.image,
								poll.endTime,
								poll.options,
								interaction.guild.iconURL()
							)
						]
					})
				})
			} else if (interaction.customId === 'endPoll') {
				const controllerMessageId = interaction.message.id

				await polls
					.findOne({ controllerMessageId })
					.then(async (poll) => {
						const pollMessage = getMessageById(
							poll.messageId,
							interaction.guild
						)
						const controllerMessage = getMessageById(
							poll.controllerMessageId,
							interaction.guild
						)

						await endPoll(
							pollMessage,
							controllerMessage,
							poll.options
						)

						if (!interaction.deferred)
							await interaction.deferUpdate()
					})
			}
		}
	}
}
