import { Collection, CommandInteraction } from 'discord.js'

import Client from '../../Client'
import Command from '../../structures/Command'

export default class Ping extends Command {
  constructor(client: Client) {
    super(client, {
      name: 'ping',
      description: 'Expected BOT Ping',
      roles: ['perms']
    })
  }

  run = async (interaction: CommandInteraction) => {
    await interaction.reply({
      content: `O ping do bot é \`${this.client.ws.ping}\`ms.`,
      ephemeral: true
    })
  }
}
