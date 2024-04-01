import { def } from '@vue/shared';
import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Login from '../components/Login.vue'

const routes = [
  {
    name: 'home',
    path: '/home',
    component: Home,
  },
  {
    name: 'login',
    path: '/login',
    component: Login
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router