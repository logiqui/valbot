import Client from '../Client'
import Event from '../structures/Event'

import chalk from 'chalk'
import box from 'box-console'

export default class ReadyEvent extends Event {
  constructor(client: Client) {
    super(client, {
      name: 'ready'
    })
  }

  run = async (client: Client, ...args: any[]) => {
    box([
      `Eu sou ${chalk.yellow(
        `${this.client.user!.tag}`
      )} e fui iniciado com o ID: ${chalk.yellow(this.client.user!.id)}`,
      `O Bot foi iniciado com ${chalk.yellow(
        `${this.client.users.cache.size}`
      )} usuarios em ${chalk.yellow(
        `${this.client.guilds.cache.size}`
      )} servidores`,
      `Foram carregados um total de ${chalk.yellow(
        `${this.client.commands.size}`
      )} comandos.`
    ])

    this.client.registryCommands()
  }
}
