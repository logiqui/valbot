import { ApplicationCommandOptionData, CommandInteraction } from 'discord.js'
import ValBot from '../Client'

type CommandOptions = {
  name: string
  description: string
  options?: ApplicationCommandOptionData[]
  owner?: boolean
  roles?: string[]
}

export default class Command {
  client: ValBot
  name: string
  description: string
  options?: ApplicationCommandOptionData[]
  owner?: boolean
  roles?: string[]
  run: Function

  constructor(client: ValBot, options: CommandOptions) {
    this.client = client
    this.name = options.name
    this.description = options.description
    this.options = options.options
    this.owner = options.owner
    this.roles = options.roles

    this.run = async (client: ValBot, interaction: CommandInteraction) => {}
  }
}
