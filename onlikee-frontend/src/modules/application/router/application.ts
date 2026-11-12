import type { RouteRecordRaw } from 'vue-router'

export const applicationRoutes: Array<RouteRecordRaw> = [
  {
    path: '/application/create',
    name: 'ApplicationCreateMethod',
    component: () => import('../views/application/Create.vue'),
  },
  {
    path: '/application/create/new',
    name: 'ApplicationCreateNew',
    component: () => import('../views/application/create/New.vue'),
  },
  {
    path: '/application/create/success',
    name: 'ApplicationCreateSuccess',
    component: () => import('../views/application/create/Success.vue'),
  },
  {
    path: '/application/create/connect',
    name: 'ApplicationCreateConnect',
    component: () => import('../views/application/create/Connect.vue'),
  },
  {
    path: '/application/create/collect',
    name: 'ApplicationCreateCollect',
    component: () => import('../views/application/create/Collect.vue'),
  },
  {
    path: '/application',
    name: 'Application',
    component: () => import('../views/Application.vue'),
  },
]
