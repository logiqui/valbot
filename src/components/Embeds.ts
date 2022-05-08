import { MessageEmbed } from 'discord.js'

const LinkEmbed = (riotId: string) => {
  return new MessageEmbed()
    .setColor('GREEN')
    .setDescription(`Riot ID **${riotId}** vinculado com sucesso!`)
}

const UnlinkEmbed = new MessageEmbed()
  .setColor('GREEN')
  .setDescription(`Riot ID desvinculado com sucesso!`)

const ErrorEmbed = new MessageEmbed()
  .setColor('RED')
  .setDescription(
    'Por favor linke sua conta do valorant com seu Discord usando o comando /link, para ver suas estatísticas.'
  )

export { LinkEmbed, UnlinkEmbed, ErrorEmbed }
