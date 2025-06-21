/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import {middleware} from "#start/kernel";

const AuthController = () => import('#controllers/auth_controller')
const WorksController = () => import('#controllers/works_controller')
router.post('/auth/register', [AuthController, 'register'])
router.post('/auth/login', [AuthController, 'login'])
router.get("/chapters-count", [WorksController, 'countChapters'])
router
  .group(() => {
    router.post('/auth/checkIsLogin', [AuthController, 'checkIsLogin'])
  })
  .use([
    middleware.auth({
      guards: ['api'],
    }),
  ])
