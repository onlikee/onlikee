import type { RouteRecordRaw } from 'vue-router'
import { indexRoutes } from '../modules/index/router'
import { applicationRoutes } from '../modules/application/router/application'
import { componentRoutes } from '../modules/components/router/component'
import { namecardRoutes } from '../modules/namecard/router/namecard'
import { userRoutes } from '../modules/user/router/user'
import { authRoutes } from '../modules/auth/router/auth'
import { errorRoutes } from '../modules/error/router/error'

export const routes: Array<RouteRecordRaw> = [
  ...indexRoutes,
  ...applicationRoutes,
  ...componentRoutes,
  ...namecardRoutes,
  ...authRoutes,
  ...userRoutes,
  ...errorRoutes,
]
