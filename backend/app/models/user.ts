import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import {BaseModel, column, hasMany} from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import UserProgress from "#models/user_progress";

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['username'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @hasMany(() => UserProgress)
  public userProgress!  : HasMany<typeof UserProgress>

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
