import { CommandInteraction, MessageEmbed } from 'discord.js'

import Client from '../../Client'
import API from '../../components/API'
import { ErrorEmbed } from '../../components/Embeds'

import assets from '../../../assets.json'

import Command from '../../structures/Command'
import Users from '../../structures/database/entities/User'

export default class DeathmatchStatus extends Command {
  constructor(client: Client) {
    super(client, {
      name: 'map',
      description: 'Get all map stats for a Valorant user',
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
      const mapStats = userInfo.maps

      const mapInfo = []
      for (let i = 0; i < mapStats.length; i++) {
        if (i != 4) {
          mapInfo.push([
            mapStats[i].metadata.name,
            mapStats[i].stats.timePlayed.displayValue,
            mapStats[i].stats.matchesWon.value,
            mapStats[i].stats.matchesWon.displayValue,
            mapStats[i].stats.matchesLost.value,
            mapStats[i].stats.matchesLost.displayValue,
            mapStats[i].stats.matchesWinPct.value,
            mapStats[i].stats.matchesWinPct.displayValue
          ])
        }
      }

      const author = {
        name: userInfo.name,
        iconURL: userInfo.avatar,
        url: `https://tracker.gg/valorant/profile/riot/${encodeURI(
          userInfo.name
        )}/overview`
      }

      const mapEmbed = new MessageEmbed()
        .setColor('#11806A')
        .setAuthor(author)
        .setThumbnail(author.iconURL)
        .setDescription('```grey\n      ' + '      Map Stats' + '\n```')

      const availableEmojis = [
        'Ascent',
        'Bind',
        'Breeze',
        'Haven',
        'Icebox',
        'Split',
        'Fracture'
      ]

      for (let i = 0; i < mapInfo.length; i++) {
        const greenSquare = (mapInfo[i][6] / 100) * 16
        const redSquare = 16 - greenSquare
        const winRateVisualized =
          '<:greenline:839562756930797598>'.repeat(greenSquare) +
          '<:redline:839562438760071298>'.repeat(redSquare)

        const mapName = mapInfo[i][0]
        const timePlayed = mapInfo[i][1]
        const winRate = mapInfo[i][7]

        let mapEmoji = '▫️'
        if (availableEmojis.includes(mapName))
          mapEmoji = this.client.utils.getEmoji(assets.mapEmojis, mapName)

        mapEmbed.addFields({
          name:
            mapName +
            ' ' +
            mapEmoji +
            '    |    ' +
            timePlayed +
            '    |    Win Rate: ' +
            parseInt(winRate).toFixed(0) +
            '%',
          value: winRateVisualized,
          inline: false
        })
      }

      return await interaction.reply({ embeds: [mapEmbed] })
    } catch (error) {
      await this.client.utils.quickError(
        interaction,
        'Jogador não encontrado no banco de dados.'
      )
    }
  }
}
