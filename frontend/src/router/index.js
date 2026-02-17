import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../view/HomeView.vue'
import PerfilView from '../view/PerfilView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', name: 'home', component: HomeView },
        { path: '/login', name: 'login', component: () => import('../view/LoginView.vue') },
        { path: '/perfil', name: 'perfil', component: PerfilView }
    ]
})

export default router