import { CommandInteraction, MessageEmbed } from 'discord.js'

import Client from '../../Client'
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
    const compStats = await this.client.tracker.playlist.getPlaylist(
      riotId,
      'Competitive'
    )

    const rankEmoji = this.client.utils.getEmoji(
      assets.rankEmojis,
      compStats.tierName
    )

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
      .setThumbnail(compStats.peakRank.icon)
      .addFields({
        name:
          compStats.peakRank.display +
          ' - ' +
          compStats.peakRank.actName +
          ' ' +
          rankEmoji,
        value: '```\n' + compStats.currentRank.display + '\n```',
        inline: true
      })
      .setFooter({ text: 'According to Tracker.gg' })

    return await interaction.reply({ embeds: [peakEmbed] })
  }
}
