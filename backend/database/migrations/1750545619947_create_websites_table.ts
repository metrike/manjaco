import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'websites'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.string('name').notNullable().unique()
      table.string('root').notNullable()
      table.string('list_path').notNullable()

      // Stockage JSON des sélecteurs (listSelectors + chapterSelectors)
      table.jsonb('selectors').notNullable()
      table.jsonb('chapter_selectors').notNullable()

      // Options supplémentaires
      table.integer('limit').defaultTo(10)
      table.integer('parallel_chunks').defaultTo(5)
      table.boolean('cover_in_page').defaultTo(false)

      table.timestamps(true)
      table.string('description_selector').nullable() // Ajout du sélecteur pour la description

    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
