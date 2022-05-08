import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export default class Users {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  username: string

  @Column({ name: 'discord_id', nullable: false })
  discordId: string

  @Column({ name: 'riot_id', nullable: false, default: '?' })
  riotId: string
}
