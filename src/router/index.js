import { createRouter, createWebHistory } from 'vue-router';
import homePage from '../pages/homePage.vue';
import aboutPage from '../pages/aboutPage.vue';
import growthTrackerPage from '../pages/trackerPage.vue';
import articlesPage from '../pages/articlesPage.vue';
import articleDetailsPage from '../pages/articleDetailsPage.vue';
import diaryPage from '../pages/diaryPage.vue';
import emergencyPage from '../pages/emergencyPage.vue';
import loginPage from '../pages/loginPage.vue';
import registerPage from '../pages/registerPage.vue';
import forgotpasswordPage from '../pages/forgotpasswordPage.vue';
import profilePage from '../pages/profilePage.vue';
import vaccineTrackerPage from '../pages/vaccineTrackerPage.vue';
import ForumHome from '../pages/forumHome.vue';
import CreatePost from '../pages/createPost.vue';
import UserProfile from '../pages/userProfile.vue';
import ThreadPost from '../pages/threadPost.vue';
import EditPost from '../pages/editPost.vue';


import {auth } from '../firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';
import { reactive } from 'vue';

export const appState = reactive({
  loginMessage: '',
});

const routes = [

    {   path: '/', 
        name: 'Home',
        component: homePage
    },

    {   path: '/about',
        name: 'About',
        component: aboutPage
    },

    {   path: '/growthtracker',
        name: 'GrowthTracker',
        component: growthTrackerPage,
        meta: { requiresAuth: true }
    },

    {   path: '/vaccinetracker',
        name: 'VaccineTracker',
        component: vaccineTrackerPage,
        meta: { requiresAuth: true }
    },

    {
        path: '/articles/:category?',
        name: 'Articles',
        component: articlesPage,
        props: true,
    },

    {   path: '/article/:id',
        name: 'ArticleDetails',
        component: articleDetailsPage, 
        props: true 
    },

    {
        path: '/diary',
        name: 'Diary',
        component: diaryPage,
        meta: { requiresAuth: true }
    },

    {
        path: '/forum/:category?',
        component: ForumHome,
        props: true,
    },

    {
        path: '/forum/thread/:id',
        component: ThreadPost,
    },

    {
        path: '/forum/create-post',
        component: CreatePost,
        meta: { requiresAuth: true }
    },

    {
        path: '/forum/edit-post/:id',
        component: EditPost,
        meta: { requiresAuth: true }
    },

    {
        path: '/forum/user/:id',
        component: UserProfile,
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

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          appState.loginMessage = ''; 
          next();
        } else {
          if (to.name !== 'Login') {
            appState.loginMessage = 'Please log in to access this page.'; 
          } else {
            appState.loginMessage = ''; 
          }
          next({ name: 'Login' });
        }
      });
    } else {
      appState.loginMessage = ''; 
      next();
    }
  });
  

export default router;
