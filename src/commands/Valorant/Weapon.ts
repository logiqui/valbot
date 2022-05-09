import { CommandInteraction, MessageEmbed } from 'discord.js'

import Client from '../../Client'
import API from '../../structures/API'
import { ErrorEmbed } from '../../components/Embeds'
import Command from '../../structures/Command'
import Users from '../../structures/database/entities/User'

export default class DeathmatchStatus extends Command {
  constructor(client: Client) {
    super(client, {
      name: 'weapon',
      description: 'Get top 5 weapon stats for a Valorant user',
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
      const weaponStats = userInfo.weapons

      const author = {
        name: userInfo.name,
        iconURL: userInfo.avatar,
        url: `https://tracker.gg/valorant/profile/riot/${encodeURI(
          userInfo.name
        )}/overview`
      }

      const topWeapons = []

      for (let i = 0; i < weaponStats.length; i++) {
        const weaponName = weaponStats[i].metadata.name
        const weaponKills = weaponStats[i].stats.kills.displayValue
        const weaponKillsValue = weaponStats[i].stats.kills.value
        const weaponDeathsBy = weaponStats[i].stats.deaths.displayValue
        const weaponHeadshotPct =
          weaponStats[i].stats.headshotsPercentage.displayValue
        const weaponDamageRound =
          weaponStats[i].stats.damagePerRound.displayValue
        const weaponFirstBloodCount =
          weaponStats[i].stats.firstBloods.displayValue
        const weaponLongestKillDistance =
          weaponStats[i].stats.longestKillDistance.value

        topWeapons.push([
          weaponName,
          weaponKills,
          weaponKillsValue,
          weaponDeathsBy,
          weaponHeadshotPct,
          weaponDamageRound,
          weaponFirstBloodCount,
          weaponLongestKillDistance
        ])
      }

      topWeapons.sort((a, b) => {
        return b[2] - a[2]
      })

      let weaponLength = topWeapons.length
      if (weaponLength > 5) weaponLength = 5

      const weaponEmbed = new MessageEmbed()
        .setColor('#11806A')
        .setAuthor(author)
        .setThumbnail(author.iconURL)
        .setDescription(
          '```grey\n      ' +
            '      Top ' +
            weaponLength +
            ' - Weapon Stats' +
            '\n```'
        )

      for (let i = 0; i < weaponLength; i++) {
        const weaponName = topWeapons[i][0]
        const weaponKills = topWeapons[i][1]
        const weaponDeathsBy = topWeapons[i][3]
        const weaponHeadshot = topWeapons[i][4]
        const weaponDamage = topWeapons[i][5]
        const weaponFirstBlood = topWeapons[i][6]
        const weaponKillDistance = topWeapons[i][7]

        weaponEmbed.addFields({
          name:
            weaponName +
            '     |     First Bloods: ' +
            weaponFirstBlood +
            '     |     ' +
            'Longest Kill Dist: ' +
            weaponKillDistance / 100 +
            ' m',
          value:
            '```yaml\nK:' +
            weaponKills +
            ' / D:' +
            weaponDeathsBy +
            ' | HS: ' +
            weaponHeadshot +
            ' | DMG/R: ' +
            weaponDamage +
            '\n```',
          inline: false
        })
      }

      return await interaction.reply({ embeds: [weaponEmbed] })
    } catch (error) {
      await this.client.utils.quickError(
        interaction,
        'Jogador não encontrado no banco de dados.'
      )
    }
  }
}
