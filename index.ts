import 'reflect-metadata'
import { Intents } from 'discord.js'
import ValBot from './src/Client'

const client = new ValBot({
  intents: Object.values(Intents.FLAGS),
  restTimeOffset: 0,
  allowedMentions: { parse: ['everyone'] }
})

client.init()
