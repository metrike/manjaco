import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'works'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('cover_url', 600).alter()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('cover_url', 255).alter() // ou l’ancienne valeur si connue
    })
  }
}
