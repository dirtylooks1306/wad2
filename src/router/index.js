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
import AdminUserPage from '../pages/adminUserPage.vue';
import AdminArticle from '../pages/adminArticle.vue';

import {auth, doc, db, getDoc } from '../firebaseConfig.js';
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
        meta: { requiresAuth: true, adminOnly: false, nonAdminOnly: true }
    },

    {   path: '/vaccinetracker',
        name: 'VaccineTracker',
        component: vaccineTrackerPage,
        meta: { requiresAuth: true, adminOnly: false, nonAdminOnly: true }
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
        meta: { requiresAuth: true, adminOnly: false, nonAdminOnly: true }
    },

    {
        path: '/forum/:category?',
        component: ForumHome,
        props: true,
        meta: { requiresAuth: true, adminOnly: false, nonAdminOnly: true }
    },

    {
        path: '/forum/thread/:id',
        component: ThreadPost,
        meta: { requiresAuth: true, adminOnly: false, nonAdminOnly: true }
    },

    {
        path: '/forum/create-post',
        component: CreatePost,
        meta: { requiresAuth: true, adminOnly: false, nonAdminOnly: true }
    },

    {
        path: '/forum/edit-post/:id',
        component: EditPost,
        meta: { requiresAuth: true, adminOnly: false, nonAdminOnly: true }
    },

    {
        path: '/forum/user/:id',
        component: UserProfile,
    },

    {
        path: '/emergency',
        name: 'Emergency',
        component: emergencyPage,
        meta: { requiresAuth: true, adminOnly: false, nonAdminOnly: true }
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
        component: profilePage,
        meta: { requiresAuth: true, nonAdminOnly: true }
    },
    {
        path: '/allUsers',
        name: 'AdminUserPage',
        component: AdminUserPage,
        meta: { requiresAuth: true, adminOnly: true, nonAdminOnly: false }
    },
    {
        path: '/adminArticle',
        name: 'AdminArticle',
        component: AdminArticle,
        meta: { requiresAuth: true, adminOnly: true, nonAdminOnly: false }
    },

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userRef = doc(db, 'users', user.uid); // Get user document
            const userData = await getDoc(userRef);
            const role = userData.data()?.role; // Assuming role is stored in the user document
            // Check if route requires authentication
            if (to.meta.requiresAuth) {
                if (to.meta.adminOnly && role !== 'admin') {
                    appState.loginMessage = 'Access restricted to admin users only.';
                    next({ name: 'Home' });
                }
                // Prevent admins from accessing non-admin-only routes
                else if (to.meta.nonAdminOnly && role === 'admin') {
                    appState.loginMessage = 'Admins cannot access this page.';
                    next({ name: 'AdminUserPage' }); // Redirect to an admin page or home
                } else {
                    appState.loginMessage = '';
                    next();
                }
            } else {
                appState.loginMessage = '';
                next();
            }
        } else {
            // Redirect unauthenticated users to login if required
            if (to.meta.requiresAuth) {
                appState.loginMessage = 'Please log in to access this page.';
                next({ name: 'Login' });
            } else {
                next();
            }
        }
    });
});


  

export default router;
