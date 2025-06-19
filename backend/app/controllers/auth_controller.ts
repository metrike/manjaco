import type {HttpContext} from '@adonisjs/core/http'
import User from "#models/user";


export default class AuthController {
  async register({request, response}: HttpContext) {
    const {email, password, username} = request.all()
    console.log('Registering user:', {email, password, username})

    const USER_VERIFY = await User.findBy('email', email)
    if (USER_VERIFY) {
      return response.status(201).json({message: 'User already exists'})
    }
    await User.create({
      email,
      password,
      username
    })

    return response.json({message: true})
  }

  public async login({ request, auth, response }: HttpContext) {
    const { username, password } = request.only(['username', 'password'])

    try {
      const user = await User.verifyCredentials(username, password)

      const token = await auth.use('api').createToken(user, ['*'])
      return response.ok({
        user,
        token,
      })
    } catch (error) {
      return response.unauthorized({
        message: 'Identifiants invalides',
      })
    }
  }
}
