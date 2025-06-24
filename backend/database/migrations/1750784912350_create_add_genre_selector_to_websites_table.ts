import { BaseSchema } from '@adonisjs/lucid/schema'

export default class UpdateGenreSelectorInWebsites extends BaseSchema {
  protected tableName = 'websites'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      // On supprime la mauvaise colonne si elle existe
      table.dropColumn('genres_se')
      // Et on ajoute la bonne
      table.string('genre_selector').nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('genre_selector')
    })
  }
}
