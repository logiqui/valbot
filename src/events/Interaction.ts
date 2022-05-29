import chalk from 'chalk'
import { Interaction, MessageEmbed } from 'discord.js'

import Client from '../Client'
import Event from '../structures/Event'

export default class InteractionEvent extends Event {
  constructor(client: Client) {
    super(client, {
      name: 'interactionCreate'
    })
  }

  run = async (interaction: Interaction) => {
    if (interaction.isCommand()) {
      const command = this.client.commands.get(interaction.commandName)
      const member = await interaction.guild!.members.fetch(interaction.user.id)

      if (!interaction.inGuild()) return

      if (command?.roles && this.client.utils.verifyRole(command, member)) {
        this.client.utils.log(
          'INFO',
          `${interaction.user.tag} utilizou o comando ${chalk.blue(
            `/${interaction.commandName}`
          )}, sem permissão!`
        )

        return await this.client.utils.quickError(
          interaction,
          `Você não tem permissão para executar este comando.`
        )
      }

      if (command?.owner && interaction.guild?.ownerId != member.id) {
        return await this.client.utils.quickError(
          interaction,
          `Este comando foi feito para pessoas especiais.`
        )
      }

      this.client.utils.log(
        'INFO',
        `${interaction.user.tag} utilizou o comando ${chalk.blue(
          `/${interaction.commandName} ${this.client.utils.getCommandArgs(
            interaction
          )}`
        )}`
      )

      try {
        if (command) await command.run(interaction)
      } catch (error: any) {
        this.client.utils.log('WARNING', error.message)

        await this.client.utils.quickError(interaction, error.message)
      }
    }
  }
}
