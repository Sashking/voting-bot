const {
	SlashCommandBuilder,
	ChannelType,
	CommandInteraction,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle
} = require('discord.js')
const ms = require('ms')
const polls = require('../models/polls')
const renderPoll = require('../utils/renderPoll')
const endPoll = require('../utils/endPoll')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('Запускает голосование.')
		.addChannelOption((channelOption) =>
			channelOption
				.setName('канал')
				.setDescription('Канал, в котором запустить голосование.')
				.setRequired(true)
				.addChannelTypes(
					ChannelType.GuildText,
					ChannelType.GuildAnnouncement
				)
		)
		.addStringOption((timeOption) =>
			timeOption
				.setName('длительность')
				.setDescription(
					'Через сколько времени закроется голосование. (5m, 12h, 7d, ...)'
				)
				.setRequired(true)
		)
		.addStringOption((titleOption) =>
			titleOption
				.setName('название')
				.setDescription('Название голосования')
				.setRequired(true)
				.setMaxLength(256)
		)
		.addStringOption((option1) =>
			option1
				.setName('вариант1')
				.setDescription('Вариант 1 в голосовании.')
				.setRequired(true)
		)
		.addStringOption((option2) =>
			option2
				.setName('вариант2')
				.setDescription('Вариант 2 в голосовании.')
				.setRequired(true)
		)
		.addStringOption((option3) =>
			option3
				.setName('вариант3')
				.setDescription('Вариант 3 в голосовании.')
				.setRequired(false)
		)
		.addStringOption((option4) =>
			option4
				.setName('вариант4')
				.setDescription('Вариант 4 в голосовании.')
				.setRequired(false)
		)
		.addStringOption((option5) =>
			option5
				.setName('вариант5')
				.setDescription('Вариант 5 в голосовании.')
				.setRequired(false)
		)
		.addAttachmentOption((imageOption) =>
			imageOption
				.setName('картинка')
				.setDescription('К голосованию можно добавить картинку.')
				.setRequired(false)
		),
	/**
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		const channel = interaction.options.getChannel('канал')
		const duration = ms(interaction.options.getString('длительность'))
		const endTime = Date.now() + duration
		const title = interaction.options.getString('название')
		const image = interaction.options.getAttachment('картинка')
		const option1 = interaction.options.getString('вариант1')
		const option2 = interaction.options.getString('вариант2')
		const option3 = interaction.options.getString('вариант3')
		const option4 = interaction.options.getString('вариант4')
		const option5 = interaction.options.getString('вариант5')

		const options = [option1, option2, option3, option4, option5]
			.filter((option) => option !== null)
			.map((option) => {
				return {
					name: option,
					votes: []
				}
			})

		if (isNaN(duration)) {
			return await interaction.reply({
				content: `\`${interaction.options.getString(
					'длительность'
				)}\` не является допустимой длительностью`,
				ephemeral: true
			})
		}

		const pollEmbed = renderPoll(
			title,
			image?.url || null,
			endTime,
			options,
			interaction.guild.iconURL()
		)

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
			)
		}

		pollOptionButtons.length = options.length

		const pollActionRow = new ActionRowBuilder().setComponents(
			pollOptionButtons
		)

		const controllerEmbed = new EmbedBuilder()
			.setDescription(`Голосование \`${title}\` отправлено в ${channel}`)
			.setTimestamp()
			.setFooter({
				text: interaction.guild.name,
				iconURL: interaction.guild.iconURL()
			})
			.setColor('#248046')

		const controllerPollEndEarlyButton = new ButtonBuilder()
			.setCustomId('endPoll')
			.setEmoji('🔒')
			.setLabel('Закончить голосование')
			.setStyle(ButtonStyle.Danger)
		const controllerActionRow = new ActionRowBuilder().addComponents(
			controllerPollEndEarlyButton
		)

		await interaction
			.reply({
				embeds: [controllerEmbed],
				components: [controllerActionRow],
				fetchReply: true
			})
			.then(async (controllerMessageReply) => {
				channel
					.send({
						embeds: [pollEmbed],
						components: [pollActionRow]
					})
					.then((pollMessage) => {
						polls.create({
							messageId: pollMessage.id,
							controllerMessageId: controllerMessageReply.id,
							endTime,
							title,
							image: image ? image.url : null,
							options
						})

						setTimeout(() => {
							endPoll(
								pollMessage,
								controllerMessageReply,
								options
							)
						}, duration)
					})
			})
	}
}

function truncate(str, maxlength) {
	return str
		? str.length > maxlength
			? str.slice(0, maxlength - 1) + '…'
			: str
		: '---'
}
