import { CommandInteraction, MessageEmbed } from 'discord.js'

import Client from '../../Client'
import API from '../../components/API'
import { ErrorEmbed } from '../../components/Embeds'

import assets from '../../../assets.json'

import Command from '../../structures/Command'
import Users from '../../structures/database/entities/User'

export default class Playtime extends Command {
  constructor(client: Client) {
    super(client, {
      name: 'peak',
      description: 'Get the peak rating of a Valorant user',
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
      const rankName = compStats.peakRank.metadata.tierName
      const rankEmoji = this.client.utils.getEmoji(assets.rankEmojis, rankName)

      const author = {
        name: userInfo.name,
        iconURL: userInfo.avatar,
        url: `https://tracker.gg/valorant/profile/riot/${encodeURI(
          userInfo.name
        )}/overview`
      }

      const peakEmbed = new MessageEmbed()
        .setColor('#11806A')
        .setAuthor(author)
        .setThumbnail(compStats.peakRank.metadata.iconUrl)
        .addFields({
          name:
            compStats.peakRank.displayName +
            ' - ' +
            compStats.peakRank.metadata.actName +
            ' ' +
            rankEmoji,
          value: '```\n' + rankName + '\n```',
          inline: true
        })
        .setFooter({ text: 'According to Tracker.gg' })

      return await interaction.reply({ embeds: [peakEmbed] })
    } catch (error) {
      await this.client.utils.quickError(
        interaction,
        'Jogador não encontrado no banco de dados.'
      )
    }
  }
}
