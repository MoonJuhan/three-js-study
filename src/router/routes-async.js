const routesBasic = [
  {
    path: '/',
    component: () => import(/* webpackChunkName: 'view-home' */ '../components/views/ViewHome.vue'),
  },
  {
    path: '/basic',
    component: () => import(/* webpackChunkName: 'view-basic' */ '../components/views/ViewBasic.vue'),
  },
  {
    path: '/video',
    component: () => import(/* webpackChunkName: 'view-video' */ '../components/views/ViewVideo.vue'),
  },
]

const routesAsync = [...routesBasic].map((o) => o)

export default routesAsync
