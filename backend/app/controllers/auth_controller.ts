// app/controllers/auth_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import User from '#models/user'

// Scrapers
import { scrapeChapterCount } from '#services/scrapeChapterCount'
import { scrapeAllWorks   } from '#services/scrapeAllWorks'

/* -------------------------------------------------------------------------- */
/* Config Phenix – à sortir dans un fichier dédié si tu veux en ajouter d’autres */
/* -------------------------------------------------------------------------- */






/* ========================================================================== */
/* Controller                                                                 */
/* ========================================================================== */
export default class AuthController {
  /* ----------------------------- INSCRIPTION ----------------------------- */
  public async register ({ request, response }: HttpContext) {
    const { email, password, username } = request.all()

    if (await User.findBy('email', email)) {
      return response.status(409).json({ message: 'User already exists' })
    }

    await User.create({ email, password, username })
    return response.status(201).json({ message: true })
  }

  /* ------------------------------- LOGIN --------------------------------- */
  public async login ({ request, auth, response }: HttpContext) {
    const { username, password } = request.only(['username', 'password'])

    try {
      const user  = await User.verifyCredentials(username, password)
      const token = await auth.use('api').createToken(user, ['*'])

      return response.ok({ user, token })
    } catch {
      return response.unauthorized({ message: 'Identifiants invalides' })
    }
  }

  /* --------------------------- TOKEN CHECK ------------------------------- */
  public async checkIsLogin ({ auth, response }: HttpContext) {
    return response.ok({ message: !!auth.use('api').user })
  }


}


