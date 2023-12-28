const {
	bold,
	italic,
	TimestampStyles,
	time,
	EmbedBuilder
} = require('discord.js')

module.exports = (title, image, endTime, options, iconURL) => {
	const pollNumberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']

	let totalVotes = 0

	options.forEach((option) => {
		totalVotes += option.votes.length
	})

	const pollOptionsString = options
		.map((option, i) => {
			const votes = option.votes.length
			const votesSuffix = getNumberSuffix(votes)
			const votesPercentage = (votes / totalVotes) * 100

			let graph = ''
			if (votesPercentage) {
				graph = '🟩 '.repeat(Math.floor(votesPercentage / 10))
				graph += '⬛ '.repeat(10 - Math.floor(votesPercentage / 10))
			} else graph = '⬛ '.repeat(10)

			return `${pollNumberEmojis[i]} ${bold(
				option.name
			)}\n${graph} ${votes} голос${votesSuffix} (${
				isNaN(votes / totalVotes) ? 0 : votesPercentage.toFixed(1)
			}%)`
		})
		.join('\n\n')

	const pollDurationString = `${italic('Конец голосования')} ${time(
		Math.floor(endTime / 1000),
		TimestampStyles.RelativeTime
	)}`

	let digitSuffix = getNumberSuffix(totalVotes)

	const pollEmbed = new EmbedBuilder()
		.setTitle(title)
		.setDescription(`${pollOptionsString}\n\n\n${pollDurationString}`)
		.setFooter({
			text: `Всего ${totalVotes} голос${digitSuffix}`,
			iconURL
		})
		.setTimestamp()
		.setColor('#248046')

	if (image) pollEmbed.setImage(image)

	return pollEmbed
}

function getNumberSuffix(number) {
	const lastDigit = number.toString().charAt(number.toString().length - 1)

	if (lastDigit == 1) return ''
	else if (lastDigit > 1 && lastDigit < 5) return 'а'
	else return 'ов'
}
