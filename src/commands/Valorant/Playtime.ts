import { CommandInteraction, MessageEmbed } from 'discord.js'

import Client from '../../Client'
import API from '../../structures/API'
import { ErrorEmbed } from '../../components/Embeds'
import Command from '../../structures/Command'
import Users from '../../structures/database/entities/User'

export default class Playtime extends Command {
  constructor(client: Client) {
    super(client, {
      name: 'playtime',
      description: 'Get the total playtime of a Valorant user',
      roles: ['perms'],
      options: [
        {
          name: 'riot-id',
          description: 'Riot ID: (Ex. logic ma fase#1244)',
          type: 'STRING',
          required: false
        }
      ]
    })
  }

  run = async (interaction: CommandInteraction) => {
    try {
      let riotId = interaction.options.getString('riot-id')

      const usersRepository = this.client.database.getRepository(Users)
      const userAccount = await usersRepository.findBy({
        discordId: interaction.user.id
      })

      if (!riotId) {
        if (userAccount.length < 1) {
          return await interaction.reply({
            embeds: [ErrorEmbed],
            ephemeral: true
          })
        }

        riotId = userAccount[0].riotId
      }

      if (riotId.includes('@')) {
        try {
          const mentionId = riotId.split('!')[1].slice(0, -1)
          const taggedAccount = await usersRepository.findBy({
            discordId: mentionId
          })
          riotId = taggedAccount[0].riotId
        } catch (error) {
          return await interaction.reply({
            embeds: [ErrorEmbed],
            ephemeral: true
          })
        }
      }

      const playerId = riotId.split('#')
      const user = await API.getUser(playerId[0], playerId[1])

      const userInfo = user.info()
      const profileStats = userInfo.segments

      let totalTime = 0
      for (let i = 0; i < profileStats.length; i++) {
        if (profileStats[i].type === 'playlist')
          totalTime += profileStats[i].stats.timePlayed.value
      }

      const hours = Math.floor(totalTime / (1000 * 60 * 60))
      const minutes = Math.floor(totalTime / (1000 * 60)) - hours * 60
      const totalPlayTime = hours + 'h ' + minutes + 'm'

      const author = {
        name: userInfo.name,
        iconURL: userInfo.avatar,
        url: `https://tracker.gg/valorant/profile/riot/${encodeURI(
          userInfo.name
        )}/overview`
      }

      const playtimeEmbed = new MessageEmbed()
        .setColor('#11806A')
        .setAuthor(author)
        .setThumbnail(author.iconURL)
        .addFields({
          name: 'Total Playtime (All game modes)',
          value: '```yaml\n' + `${totalPlayTime}` + '\n```'
        })

      return await interaction.reply({ embeds: [playtimeEmbed] })
    } catch (error) {
      await this.client.utils.quickError(
        interaction,
        'Jogador não encontrado no banco de dados.'
      )
    }
  }
}
