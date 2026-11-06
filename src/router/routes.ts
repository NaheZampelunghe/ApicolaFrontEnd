import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      // requiresAuth: el guard del router (router/index.ts) exige sesion iniciada
      {
        path: '/alimentos',
        component: () => import('pages/Alimento/AlimentosPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/colmenares',
        component: () => import('pages/Colmenar/colmenaresPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/ciudades',
        component: () => import('pages/Ciudad/ciudadPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/colmenas',
        component: () => import('pages/Colmena/colmenaPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/historialColmenar',
        component: () => import('pages/HistorialColmenar/historialColmenarPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/dueño',
        component: () => import('pages/Duenio/duenioPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/localidad',
        component: () => import('pages/Localidad/localidadPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/medicamento',
        component: () => import('pages/Medicamento/medicamentoPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/provincia',
        component: () => import('pages/Provincia/provinciaPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/ubicacion',
        component: () => import('pages/Ubicacion/ubicacionPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
