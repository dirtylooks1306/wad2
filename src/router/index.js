import { createRouter, createWebHistory } from 'vue-router';
import homePage from '../pages/homePage.vue';
import aboutPage from '../pages/aboutPage.vue';

const routes = [

    { path: '/', 
    name: 'Home',
    component: homePage
    },

    { path: '/about',
    name: 'About',
    component: aboutPage
    },

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
