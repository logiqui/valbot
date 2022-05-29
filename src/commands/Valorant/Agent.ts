import { CommandInteraction, MessageEmbed } from 'discord.js'

import Client from '../../Client'
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

    const author = {
      name: userInfo.name,
      iconURL: userInfo.avatar,
      url: `https://tracker.gg/valorant/profile/riot/${encodeURI(
        userInfo.name
      )}/overview`
    }

    const agentEmbed = new MessageEmbed()
      .setColor('#11806A')
      .setAuthor(author)
      .setThumbnail(author.iconURL)
      .setDescription(
        '```grey\n      ' + '      Top ' + 5 + ' - Agents Played' + '\n```'
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

    const agents = await this.client.tracker.agents.getTopAgents(riotId)

    agents.forEach((agent) => {
      let agentEmoji = ''
      if (availableEmojis.includes(agent.name))
        agentEmoji = this.client.utils.getEmoji(assets.agentEmojis, agent.name)

      agentEmbed.addFields({
        name:
          agent.name +
          ' ' +
          agentEmoji +
          '     |     ' +
          agent.timePlayed.display +
          '     |     Win Rate: ' +
          parseInt(agent.winRate.display).toFixed(0) +
          '%',
        value:
          '```yaml\nK:' +
          agent.kills.display +
          ' / D:' +
          agent.deaths.display +
          ' / A:' +
          agent.assists.display +
          ' / R:' +
          parseFloat(agent.kdr.display).toFixed(2) +
          ' | DMG/R: ' +
          parseInt(agent.damage.display).toFixed(0) +
          '\n```',
        inline: false
      })
    })

    return await interaction.reply({ embeds: [agentEmbed] })
  }
}
