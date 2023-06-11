const routesBasic = [
  {
    path: '/',
    component: () => import(/* webpackChunkName: 'view-home' */ '../components/views/ViewHome.vue'),
  },
  {
    path: '/basic',
    component: () => import(/* webpackChunkName: 'view-basic' */ '../components/views/view-basic/ViewBasic.vue'),
  },
  {
    path: '/video',
    component: () => import(/* webpackChunkName: 'view-video' */ '../components/views/ViewVideo.vue'),
  },
  {
    path: '/memory-test',
    component: () => import(/* webpackChunkName: 'view-memory-test' */ '../components/views/ViewMemoryTest.vue'),
  },
  {
    path: '/simple-sphere',
    component: () => import(/* webpackChunkName: 'view-simple-sphere' */ '../components/views/view-simple-sphere/ViewSimpleSphere.vue'),
  },
  {
    path: '/image-control',
    component: () => import(/* webpackChunkName: 'view-image-control' */ '../components/views/view-image-control/ViewImageControl.vue'),
  },
  {
    path: '/change-map-color',
    component: () => import(/* webpackChunkName: 'view-change-map-color' */ '../components/views/view-change-map-color/ViewChangeMapColor.vue'),
  },
  {
    path: '/change-model',
    component: () => import(/* webpackChunkName: 'view-change-model' */ '../components/views/view-change-model/ViewChangeModel.vue'),
  },
  {
    path: '/preview-image',
    component: () => import(/* webpackChunkName: 'view-preview-image' */ '../components/views/view-preview-image/ViewPreviewImage.vue'),
  },
  {
    path: '/game-test',
    component: () => import(/* webpackChunkName: 'view-game-test' */ '../components/views/view-game-test/ViewGameTest.vue'),
  },
]

const routesAsync = [...routesBasic].map((o) => o)

export default routesAsync
