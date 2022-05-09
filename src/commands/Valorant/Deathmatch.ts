import { CommandInteraction, MessageEmbed } from 'discord.js'

import Client from '../../Client'
import API from '../../structures/API'
import { ErrorEmbed } from '../../components/Embeds'
import Command from '../../structures/Command'
import Users from '../../structures/database/entities/User'

export default class DeathmatchStatus extends Command {
  constructor(client: Client) {
    super(client, {
      name: 'deathmatch',
      description: 'Get overall deathmatch stats for a Valorant user',
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
      const dmStats = userInfo.deathmatch

      const greenSquare = Math.round(dmStats.matchesWinPct.value / 8.33)
      const redSquare = 12 - greenSquare

      const winRate =
        '<:greenline:839562756930797598>'.repeat(greenSquare) +
        '<:redline:839562438760071298>'.repeat(redSquare)

      const author = {
        name: userInfo.name,
        iconURL: userInfo.avatar,
        url: `https://tracker.gg/valorant/profile/riot/${encodeURI(
          userInfo.name
        )}/overview`
      }

      const dmEmbed = new MessageEmbed()
        .setColor('#11806A')
        .setTitle(`Deathmatch Career Stats`)
        .setAuthor(author)
        .setThumbnail(author.iconURL)
        .addFields(
          {
            name: 'KDR',
            value: '```yaml\n' + dmStats.kDRatio.displayValue + '\n```',
            inline: true
          },
          {
            name: 'KDA ',
            value: '```yaml\n' + dmStats.kDARatio.displayValue + '\n```',
            inline: true
          },
          {
            name: 'KAD ',
            value: '```yaml\n' + dmStats.kADRatio.displayValue + '\n```',
            inline: true
          },
          {
            name: 'Kills',
            value: '```yaml\n' + dmStats.kills.displayValue + '\n```',
            inline: true
          },
          {
            name: 'Deaths',
            value: '```yaml\n' + dmStats.deaths.displayValue + '```',
            inline: true
          },
          {
            name: 'Assists',
            value: '```yaml\n' + dmStats.assists.displayValue + '\n```',
            inline: true
          },
          {
            name: 'Playtime',
            value: '```yaml\n' + dmStats.timePlayed.displayValue + '\n```',
            inline: true
          },
          {
            name: 'Win Rate - ' + dmStats.matchesWinPct.displayValue,
            value:
              winRate +
              ' ```yaml\n' +
              '    W: ' +
              dmStats.matchesWon.displayValue +
              '   |   L: ' +
              dmStats.matchesLost.displayValue +
              '\n```',
            inline: false
          }
        )

      return await interaction.reply({ embeds: [dmEmbed] })
    } catch (error) {
      await this.client.utils.quickError(
        interaction,
        'Jogador não encontrado no banco de dados.'
      )
    }
  }
}
