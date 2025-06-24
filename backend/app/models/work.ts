import { DateTime } from 'luxon'
import {BaseModel, column, hasMany} from "@adonisjs/lucid/orm";
import type { HasMany } from '@adonisjs/lucid/types/relations'
import UserProgress from "#models/user_progress";

export default class Work extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare type:string

  @column()
  declare sourceUrl: string

  @column()
  declare coverUrl: string

  @column()
  declare totalChapters: number

  @column()
  declare lastScrapedAt: DateTime

  @column()
  declare description: string | null

  @hasMany(() => UserProgress)
  declare userprogresses: HasMany<typeof UserProgress>

  @column()
  declare genres: string[] | null

}
