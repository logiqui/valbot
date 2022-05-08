import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'

const count: any = {}
const timeout = 1000 * 30

const getRow = (
  id: number,
  pages: [],
  embeds: MessageEmbed[],
  randomID: number
) => {
  const row = new MessageActionRow()

  row.addComponents(
    new MessageButton()
      .setLabel('<')
      .setStyle('SUCCESS')
      .setCustomId('previous' + randomID)
      .setDisabled(pages[id] === 0)
  )

  row.addComponents(
    new MessageButton()
      .setLabel('>')
      .setStyle('SUCCESS')
      .setCustomId('next' + randomID)
      .setDisabled(pages[id] === embeds.length - 1)
  )

  if (count[id]) {
    const timeLeft = Math.round(
      timeout / 1000 - (new Date().getTime() - count[id]) / 1000
    )

    return timeLeft
  }

  count[id] = new Date().getTime()

  setTimeout(() => (count[id] = null), timeout)

  return row
}

const editGetRow = (
  id: number,
  pages: [],
  embeds: MessageEmbed[],
  randomID: number
) => {
  const row = new MessageActionRow()

  row.addComponents(
    new MessageButton()
      .setLabel('<')
      .setStyle('SUCCESS')
      .setCustomId('previous' + randomID)
      .setDisabled(pages[id] === 0)
  )

  row.addComponents(
    new MessageButton()
      .setLabel('>')
      .setStyle('SUCCESS')
      .setCustomId('next' + randomID)
      .setDisabled(pages[id] === embeds.length - 1)
  )

  return row
}

export { getRow, editGetRow, timeout }
