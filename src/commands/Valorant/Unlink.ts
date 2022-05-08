import { CommandInteraction } from 'discord.js'

import Client from '../../Client'
import { UnlinkEmbed } from '../../components/Embeds'
import Command from '../../structures/Command'
import User from '../../structures/database/entities/User'

export default class UnlinkAccount extends Command {
  constructor(client: Client) {
    super(client, {
      name: 'unlink',
      description: 'Unlink a Valorant account from your Discord',
      roles: ['perms']
    })
  }

  run = async (interaction: CommandInteraction) => {
    const userRepository = this.client.database.getRepository(User)

    await userRepository.delete({
      discordId: interaction.user.id
    })

    await interaction.reply({ embeds: [UnlinkEmbed] })
  }
}
