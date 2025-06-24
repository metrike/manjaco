import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddDescriptionToWorks extends BaseSchema {
  protected tableName = 'works'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('description', 500).nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('description')
    })
  }
}
