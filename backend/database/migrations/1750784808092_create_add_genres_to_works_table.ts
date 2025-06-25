import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'works'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.jsonb('genres').alter()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.specificType('genres', 'text').alter() // ou l'ancien type si différent
    })
  }
}
