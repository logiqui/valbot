import { CommandInteraction, MessageEmbed } from 'discord.js'

import Client from '../../Client'
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

    const userInfo = await this.client.tracker.profile.getUser(riotId)
    const dmStats = await this.client.tracker.playlist.getPlaylist(
      riotId,
      'Deathmatch'
    )

    const greenSquare = Math.round(dmStats.winRate.value / 8.33)
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
          value: '```yaml\n' + dmStats.kdr.display + '\n```',
          inline: true
        },
        {
          name: 'KDA ',
          value: '```yaml\n' + dmStats.kda.display + '\n```',
          inline: true
        },
        {
          name: 'KAD ',
          value: '```yaml\n' + dmStats.kad.display + '\n```',
          inline: true
        },
        {
          name: 'Kills',
          value: '```yaml\n' + dmStats.kills.display + '\n```',
          inline: true
        },
        {
          name: 'Deaths',
          value: '```yaml\n' + dmStats.deaths.display + '```',
          inline: true
        },
        {
          name: 'Assists',
          value: '```yaml\n' + dmStats.assists.display + '\n```',
          inline: true
        },
        {
          name: 'Playtime',
          value: '```yaml\n' + dmStats.timePlayed.display + '\n```',
          inline: true
        },
        {
          name: 'Win Rate - ' + dmStats.winRate.display,
          value:
            winRate +
            ' ```yaml\n' +
            '    W: ' +
            dmStats.matchesWon.display +
            '   |   L: ' +
            dmStats.matchesLost.display +
            '\n```',
          inline: false
        }
      )

    return await interaction.reply({ embeds: [dmEmbed] })
  }
}
