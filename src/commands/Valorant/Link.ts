import { CommandInteraction, MessageEmbed } from 'discord.js'

import Client from '../../Client'
import { LinkEmbed } from '../../components/Embeds'
import Command from '../../structures/Command'
import User from '../../structures/database/entities/User'

export default class LinkAccount extends Command {
  constructor(client: Client) {
    super(client, {
      name: 'link',
      description: 'Link a Valorant account to your Discord',
      roles: ['perms'],
      options: [
        {
          name: 'riot-id',
          description: 'Riot ID: (Ex. logic ma fase#1244)',
          type: 'STRING',
          required: true
        }
      ]
    })
  }

  run = async (interaction: CommandInteraction) => {
    const riotId = interaction.options.getString('riot-id', true)
    const playerId = encodeURI(riotId).toLowerCase()

    if (!playerId.includes('#'))
      return this.client.utils.quickError(
        interaction,
        'Nome de usuário ou Tag inválido!'
      )

    const userRepository = this.client.database.getRepository(User)
    const account = await userRepository.findBy({
      discordId: interaction.user.id
    })

    if (account.length > 0)
      await userRepository.delete({ discordId: interaction.user.id })

    const newUser = userRepository.create({
      username: interaction.user.username,
      discordId: interaction.user.id,
      riotId
    })

    await userRepository.save(newUser)

    await interaction.reply({ embeds: [LinkEmbed(riotId)] })
  }
}
