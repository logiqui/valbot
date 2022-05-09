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
      name: 'agent',
      description: 'Get top 5 agent stats for a VALORANT user',
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
      const profileStats = userInfo.segments
      const compStats = userInfo.ranked

      const author = {
        name: userInfo.name,
        iconURL: userInfo.avatar,
        url: `https://tracker.gg/valorant/profile/riot/${encodeURI(
          userInfo.name
        )}/overview`
      }

      const agentInfo = []
      for (let i = 0; i < profileStats.length; i++) {
        if (profileStats[i].type === 'agent') {
          agentInfo.push([
            profileStats[i].metadata.name,
            profileStats[i].stats.timePlayed.value,
            profileStats[i].stats.timePlayed.displayValue,
            profileStats[i].stats.kills.displayValue,
            profileStats[i].stats.deaths.displayValue,
            profileStats[i].stats.assists.displayValue,
            profileStats[i].stats.kDRatio.displayValue,
            profileStats[i].stats.damagePerRound.displayValue,
            profileStats[i].stats.matchesWinPct.displayValue
          ])
        }
      }

      agentInfo.sort((a, b) => {
        return b[1] - a[1]
      })

      let agentLength = agentInfo.length
      if (agentLength > 5) agentLength = 5

      const agentEmbed = new MessageEmbed()
        .setColor('#11806A')
        .setAuthor(author)
        .setThumbnail(author.iconURL)
        .setDescription(
          '```grey\n      ' +
            '      Top ' +
            agentLength +
            ' - Agents Played' +
            '\n```'
        )

      const availableEmojis = [
        'Astra',
        'Breach',
        'Brimstone',
        'Cypher',
        'Jett',
        'Killjoy',
        'Omen',
        'Phoenix',
        'Raze',
        'Reyna',
        'Sage',
        'Skye',
        'Sova',
        'Viper',
        'Yoru',
        'KAY/O',
        'Chamber',
        'Neon'
      ]

      for (let i = 0; i < agentLength; i++) {
        const agentName = agentInfo[i][0]
        const timePlayed = agentInfo[i][2]
        const kills = agentInfo[i][3]
        const deaths = agentInfo[i][4]
        const assists = agentInfo[i][5]
        const kdr = agentInfo[i][6]
        const dmg = agentInfo[i][7]
        const winRate = agentInfo[i][8]

        let agentEmoji = ':white_small_square:'
        if (availableEmojis.includes(agentName))
          agentEmoji = this.client.utils.getEmoji(assets.agentEmojis, agentName)

        agentEmbed.addFields({
          name:
            agentName +
            ' ' +
            agentEmoji +
            '     |     ' +
            timePlayed +
            '     |     Win Rate: ' +
            parseInt(winRate).toFixed(0) +
            '%',
          value:
            '```yaml\nK:' +
            kills +
            ' / D:' +
            deaths +
            ' / A:' +
            assists +
            ' / R:' +
            parseFloat(kdr).toFixed(2) +
            ' | DMG/R: ' +
            parseInt(dmg).toFixed(0) +
            '\n```',
          inline: false
        })
      }

      return await interaction.reply({ embeds: [agentEmbed] })
    } catch (error) {
      await this.client.utils.quickError(
        interaction,
        'Jogador não encontrado no banco de dados.'
      )
    }
  }
}
