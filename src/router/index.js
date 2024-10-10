import { createRouter, createWebHistory } from 'vue-router';
import homePage from '../pages/homePage.vue';
import aboutPage from '../pages/aboutPage.vue';
import trackerPage from '../pages/trackerPage.vue';
import articlesPage from '../pages/articlesPage.vue';
import diaryPage from '../pages/diaryPage.vue';
import emergencyPage from '../pages/emergencyPage.vue';
import forumPage from '../pages/forumPage.vue';

const routes = [

    {   path: '/', 
        name: 'Home',
        component: homePage
    },

    {    path: '/about',
        name: 'About',
        component: aboutPage
    },

    {   path: '/tracker',
        name: 'GrowthTracker',
        component: trackerPage
    },

    {
        path: '/articles/:category?',
        name: 'Articles',
        component: articlesPage,
        props: true, // Pass the route parameters as props to the component
    },

    {
        path: '/diary',
        name: 'Diary',
        component: diaryPage
    },

    {
        path: "/forum",
        name: "Forum",
        component: forumPage
    },

    {
        path: '/emergency',
        name: 'Emergency',
        component: emergencyPage
    },

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;