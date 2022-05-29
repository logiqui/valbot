import { CommandInteraction, MessageEmbed } from 'discord.js'

import Client from '../../Client'
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
    const weaponStats = await this.client.tracker.weapons.getTopWeapons(riotId)

    const author = {
      name: userInfo.name,
      iconURL: userInfo.avatar,
      url: `https://tracker.gg/valorant/profile/riot/${encodeURI(
        userInfo.name
      )}/overview`
    }

    const weaponEmbed = new MessageEmbed()
      .setColor('#11806A')
      .setAuthor(author)
      .setThumbnail(author.iconURL)
      .setDescription(
        '```grey\n      ' +
          '      Top ' +
          weaponStats.length +
          ' - Weapon Stats' +
          '\n```'
      )

    weaponStats.forEach((weapon) => {
      weaponEmbed.addFields({
        name:
          weapon.name +
          '     |     First Bloods: ' +
          weapon.firstBloods.display +
          '     |     ' +
          'Longest Kill Dist: ' +
          weapon.longestKill.value / 100 +
          ' m',
        value:
          '```yaml\nK:' +
          weapon.kills.display +
          ' / D:' +
          weapon.deathsBy.display +
          ' | HS: ' +
          weapon.headshot.display +
          ' | DMG/R: ' +
          weapon.damagePerRound.display +
          '\n```',
        inline: false
      })
    })

    return await interaction.reply({ embeds: [weaponEmbed] })
  }
}
