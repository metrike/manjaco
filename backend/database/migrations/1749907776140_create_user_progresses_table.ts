import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_progresses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').references('users.id').onDelete('CASCADE')
      table.integer('work_id').references('works.id').onDelete('CASCADE')
      table.integer('chapters_read').notNullable()
      table.timestamp('last_read_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
