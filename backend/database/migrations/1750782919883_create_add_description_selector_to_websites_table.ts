import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddDescriptionSelectorToWebsites extends BaseSchema {
  protected tableName = 'websites'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('description_selector').nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('description_selector')
    })
  }
}
