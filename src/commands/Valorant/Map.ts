import { CommandInteraction, MessageEmbed } from 'discord.js'

import Client from '../../Client'
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
      const mapStats = await this.client.tracker.maps.getMaps(riotId)

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

      mapStats.forEach((map) => {
        const greenSquare = (map.winRate.value / 100) * 16
        const redSquare = 16 - greenSquare
        const winRateVisualized =
          '<:greenline:839562756930797598>'.repeat(greenSquare) +
          '<:redline:839562438760071298>'.repeat(redSquare)

        let mapEmoji = ''
        if (availableEmojis.includes(map.name))
          mapEmoji = this.client.utils.getEmoji(assets.mapEmojis, map.name)

        mapEmbed.addFields({
          name:
            map.name +
            ' ' +
            mapEmoji +
            '    |    ' +
            map.timePlayed.display +
            '    |    Win Rate: ' +
            parseInt(map.winRate.display).toFixed(0) +
            '%',
          value: winRateVisualized,
          inline: false
        })
      })

      return await interaction.reply({ embeds: [mapEmbed] })
    } catch (error) {
      await this.client.utils.quickError(
        interaction,
        'Jogador não encontrado no banco de dados.'
      )
    }
  }
}
