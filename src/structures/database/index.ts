import { DataSource } from 'typeorm'

export default new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'valbot',
  synchronize: true,
  logging: false,
  entities: [__dirname + '/entities/*.{js,ts}']
})
