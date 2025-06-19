import { DateTime } from 'luxon'

import {BaseModel, belongsTo, column} from "@adonisjs/lucid/orm";
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from "#models/user";
import Work from "#models/work";

export default class UserProgress extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare workId: string

  @column()
  declare chaptersRead: number

  @column()
  declare lastReadAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Work)
  declare work: BelongsTo<typeof Work>
}
