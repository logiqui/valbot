import { ClientEvents } from 'discord.js'
import ValBot from '../Client'

type EventOptions = {
  name: keyof ClientEvents
}

export default class Event {
  client: ValBot
  name: string
  run: Function

  constructor(client: ValBot, options: EventOptions) {
    this.client = client
    this.name = options.name

    this.run = async (client: ValBot, ...args: any[]) => {}
  }
}
