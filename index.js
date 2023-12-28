require('dotenv').config()
const { token, databaseToken } = process.env
const { Client, GatewayIntentBits, Collection } = require('discord.js')
const { connect } = require('mongoose')

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
	]
})

client.commands = new Collection()
require('./handlers/commands')(client)
require('./handlers/events')(client)

client.login(token)
connect(databaseToken)
