import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'works'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('title').notNullable()
      table.enu('type', ['MANGA', 'MANHWA', 'NOVEL']).notNullable()
      table.string('source_url').notNullable()
      table.string('cover_url')
      table.integer('total_chapters').defaultTo(0)
      table.timestamp('last_scraped_at', { useTz: true })
      table.string('description', 500).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
