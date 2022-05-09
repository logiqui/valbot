import { CommandInteraction, MessageEmbed } from 'discord.js'

import Client from '../../Client'
import API from '../../components/API'
import Command from '../../structures/Command'
import Users from '../../structures/database/entities/User'

import assets from '../../../assets.json'

import { editGetRow, getRow, timeout } from '../../components/Pages'
import { ErrorEmbed } from '../../components/Embeds'

export default class AccountStats extends Command {
  constructor(client: Client) {
    super(client, {
      name: 'stats',
      description: 'View Valorant account statistics',
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

      if (userAccount.length < 1) {
        return await interaction.reply({
          embeds: [ErrorEmbed],
          ephemeral: true
        })
      }

      if (!riotId) riotId = userAccount[0].riotId

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
      const compStats = userInfo.ranked

      const greenSquare = Math.round(compStats.matchesWinPct.value / 8.33)
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

      const embeds: MessageEmbed[] = []

      embeds.push(
        new MessageEmbed()
          .setColor('#11806A')
          .setTitle(`Competitive Career Stats`)
          .setAuthor(author)
          .setThumbnail(author.iconURL)
          .addFields(
            {
              name: 'KDR',
              value: '```yaml\n' + compStats.kDRatio.displayValue + '\n```',
              inline: true
            },
            {
              name: 'KDA ',
              value: '```yaml\n' + compStats.kDARatio.displayValue + '\n```',
              inline: true
            },
            {
              name: `Rank ${this.client.utils.getEmoji(
                assets.rankEmojis,
                userInfo.tierName
              )}`,
              value: '```grey\n' + userInfo.rank + '\n```',
              inline: true
            },
            {
              name: 'Kills',
              value: '```yaml\n' + compStats.kills.displayValue + '\n```',
              inline: true
            },
            {
              name: 'Deaths',
              value: '```yaml\n' + compStats.deaths.displayValue + '```',
              inline: true
            },
            {
              name: 'Assists',
              value: '```yaml\n' + compStats.assists.displayValue + '\n```',
              inline: true
            },
            {
              name: 'Most Kills',
              value:
                '```yaml\n' + compStats.mostKillsInMatch.displayValue + '\n```',
              inline: true
            },
            {
              name: 'Playtime',
              value: '```yaml\n' + compStats.timePlayed.displayValue + '\n```',
              inline: true
            },
            {
              name: 'Win Rate - ' + compStats.matchesWinPct.displayValue,
              value:
                winRate +
                ' ```yaml\n' +
                '    W: ' +
                compStats.matchesWon.displayValue +
                '   |   L: ' +
                compStats.matchesLost.displayValue +
                '\n```',
              inline: false
            }
          )
      )

      embeds.push(
        new MessageEmbed()
          .setColor('#11806A')
          .setTitle(`Competitive Career Stats`)
          .setAuthor(author)
          .setThumbnail(author.iconURL)
          .addFields(
            {
              name: 'Kills/Match',
              value:
                '```yaml\n' + compStats.killsPerMatch.displayValue + '\n```',
              inline: true
            },
            {
              name: 'Deaths/Match ',
              value:
                '```yaml\n' + compStats.deathsPerMatch.displayValue + '\n```',
              inline: true
            },
            {
              name: 'Assists/Match',
              value:
                '```yaml\n' + compStats.assistsPerMatch.displayValue + '\n```',
              inline: true
            },
            {
              name: 'Headshot %',
              value:
                '```yaml\n' +
                compStats.headshotsPercentage.displayValue +
                '\n```',
              inline: true
            },
            {
              name: 'DMG/Round',
              value:
                '```yaml\n' + compStats.damagePerRound.displayValue + '\n```',
              inline: true
            },
            {
              name: 'Avg Combat Score',
              value:
                '```yaml\n' + compStats.scorePerRound.displayValue + '\n```',
              inline: true
            },
            {
              name: 'Plants',
              value: '```yaml\n' + compStats.plants.displayValue + '\n```',
              inline: true
            },
            {
              name: 'Defuses',
              value: '```yaml\n' + compStats.defuses.displayValue + '\n```',
              inline: true
            },
            {
              name: 'Avg Econ Rating',
              value:
                '```yaml\n' +
                compStats.econRatingPerMatch.displayValue +
                '\n```',
              inline: true
            },
            {
              name: 'Aces',
              value: '```yaml\n' + compStats.aces.displayValue + '\n```',
              inline: true
            },
            {
              name: 'First Bloods',
              value: '```yaml\n' + compStats.firstBloods.displayValue + '\n```',
              inline: true
            },
            {
              name: 'First Deaths',
              value: '```yaml\n' + compStats.deathsFirst.displayValue + '\n```',
              inline: true
            }
          )
      )

      const id = Number(interaction.user.id)

      let pages: any = []
      pages[id] = pages[id] || 0

      const embed = embeds[pages[id]]
      const randomID = Math.floor(Math.random() * 99999999)

      const navButtons = getRow(id, pages, embeds, randomID)
      if (typeof navButtons === 'number') {
        const cooldownEmbed = new MessageEmbed()
          .setColor('#11806A')
          .setAuthor(author)
          .setThumbnail(author.iconURL)
          .addFields({
            name: ':warning: You are on cooldown!',
            value:
              'Please wait ' +
              navButtons +
              ' more seconds before using this command.'
          })

        return await interaction.reply({
          embeds: [cooldownEmbed],
          ephemeral: true
        })
      }

      const reply = await interaction.reply({
        embeds: [embed],
        components: [navButtons],
        fetchReply: true
      })

      const filter = (x: any) => x.user.id === interaction.user.id
      const collector = interaction.channel!.createMessageComponentCollector({
        filter,
        time: timeout
      })

      collector.on('collect', (btnInt) => {
        if (!btnInt) return
        btnInt.deferUpdate()

        if (btnInt.customId !== 'previous' + randomID && pages[id] > 0) return
        if (btnInt.customId === 'previous' + randomID && pages[id] > 0) {
          --pages[id]
        } else if (
          btnInt.customId === 'next' + randomID &&
          pages[id] < embeds.length - 1
        ) {
          ++pages[id]
        }

        if (reply) {
          interaction.editReply({
            embeds: [embeds[pages[id]]],
            components: [editGetRow(id, pages, embeds, randomID)]
          })
        }
      })
    } catch (error) {
      await this.client.utils.quickError(
        interaction,
        'Jogador não encontrado no banco de dados.'
      )
    }
  }
}
