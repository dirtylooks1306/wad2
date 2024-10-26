import { createApp } from 'vue'
import './style.css'
import router from './router'; // Import the router
import App from './App.vue'
import { db } from './firebaseConfig.js'
import Vue3Geolocation from 'vue3-geolocation';


createApp(App)
    .use(router)
    .use(Vue3Geolocation)
    .mount('#app')