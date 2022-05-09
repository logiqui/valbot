import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js'

import moment from 'moment'
import chalk from 'chalk'
import Command from './Command'

export default class Utils {
  async quickError(interaction: CommandInteraction, message: string) {
    try {
      const embed = new MessageEmbed().setColor('RED').setDescription(message)
      await interaction.reply({ embeds: [embed], ephemeral: true })
    } catch (e) {
      await interaction
        .followUp({ content: `${message}`, ephemeral: true })
        .catch()
    }
  }

  async quickSuccess(interaction: CommandInteraction, message: string) {
    try {
      const embed = new MessageEmbed().setColor('GREEN').setDescription(message)
      await interaction.reply({ embeds: [embed], ephemeral: true })
    } catch (e) {
      await interaction.followUp({ content: `${message}` }).catch()
    }
  }

  log(types: 'SUCESS' | 'ERROR' | 'WARNING' | 'INFO', message: string) {
    if (types === 'SUCESS') {
      console.log(
        `${chalk.gray(`[` + moment().format('HH:mm:ss') + `]`)} ${chalk.green(
          types
        )}: ${message}`
      )
    }

    if (types === 'ERROR') {
      console.log(
        `${chalk.gray(`[` + moment().format('HH:mm:ss') + `]`)} ${chalk.red(
          types
        )}: ${message}`
      )
    }

    if (types === 'WARNING') {
      console.log(
        `${chalk.gray(`[` + moment().format('HH:mm:ss') + `]`)} ${chalk.yellow(
          types
        )}: ${message}`
      )
    }

    if (types === 'INFO') {
      console.log(
        `${chalk.gray(`[` + moment().format('HH:mm:ss') + `]`)} ${chalk.blue(
          types
        )}: ${message}`
      )
    }
  }

  verifyRole(command: Command, member: GuildMember) {
    return !command!.roles!.some((role) =>
      member?.roles.cache.find((roleName) => roleName.name == role)
    )
  }

  getCommandArgs(interaction: any) {
    const args = []

    for (const option of interaction.options.data) {
      if (option.type === 'SUB_COMMAND') {
        if (option.name) args.push(option.name)

        option.options?.forEach((x: any) => {
          if (x.value) args.push(x.value)
        })
      } else if (option.value) args.push(option.value)
    }

    return args.join(' ')
  }

  getEmoji(obj: any, value: string) {
    const index = Object.keys(obj).find((key: any) => key === value)
    return obj[index!].emoji
  }
}
