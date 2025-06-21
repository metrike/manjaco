import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  // évite d’exécuter en prod par mégarde
  public static developmentOnly = true

  async run () {
    await User.updateOrCreateMany('id', [
      {
        id: 1,
        email: 'anthonymathieu21@live.fr',
        username: 'anthonymathieu21',
        password: 'azeAZE123&',
      },
      {
        id: 2,
        email: 'kevinmetri.pro@gmail.com',
        username: 'kevinmetri.pro@gmail.com',
        password: 'azeAZE123&',
      },
      {
        id: 3,
        email: 'yassine.haffoud.sio@gmail.com',
        username: 'yassine',
        password: 'azeAZE123&',
      },
      {
        id: 4,
        email: 'john.doe@example.com',
        username: 'john.doe',
        password: 'fakePass123',
      },
    ])
  }
}
