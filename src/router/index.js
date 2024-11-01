import { createRouter, createWebHistory } from 'vue-router';
import homePage from '../pages/homePage.vue';
import aboutPage from '../pages/aboutPage.vue';
import growthTrackerPage from '../pages/trackerPage.vue';
import articlesPage from '../pages/articlesPage.vue';
import diaryPage from '../pages/diaryPage.vue';
import emergencyPage from '../pages/emergencyPage.vue';
import forumPage from '../pages/forumPage.vue';
import loginPage from '../pages/loginPage.vue';
import registerPage from '../pages/registerPage.vue';
import forgotpasswordPage from '../pages/forgotpasswordPage.vue';
import profilePage from '../pages/profilePage.vue';
import vaccineTrackerPage from '../pages/vaccineTrackerPage.vue';
import createPost from '../components/createPost.vue';


const routes = [

    {   path: '/', 
        name: 'Home',
        component: homePage
    },

    {    path: '/about',
        name: 'About',
        component: aboutPage
    },

    {   path: '/growthtracker',
        name: 'GrowthTracker',
        component: growthTrackerPage
    },

    {   path: '/vaccinetracker',
        name: 'VaccineTracker',
        component: vaccineTrackerPage
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
        path: "/forum/:postId?",
        name: "Forum",
        component: forumPage,
        props: true
    },

    {
        path: '/emergency',
        name: 'Emergency',
        component: emergencyPage
    },

    {
        path: '/login',
        name: 'Login',
        component: loginPage
    },

    {
        path: '/register',
        name: 'Register',
        component: registerPage
    },

    {
        path: '/forgotpassword',
        name: 'ForgotPassword',
        component: forgotpasswordPage
    },

    {
        path: '/profile',
        name: 'Profile',
        component: profilePage
    },

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
