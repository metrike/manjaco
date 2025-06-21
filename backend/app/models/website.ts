// app/models/Website.ts
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Website extends BaseModel {
  public static table = 'websites'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare root: string

  @column()
  declare listPath: string

  @column()
  declare selectors: Record<string, any>

  @column()
  declare chapterSelectors: Record<string, any>

  @column()
  declare limit: number

  @column()
  declare parallelChunks: number

  @column()
  declare coverInPage: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
