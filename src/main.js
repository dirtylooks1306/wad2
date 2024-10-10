import { createApp } from 'vue'
import './style.css'
import router from './router'; // Import the router
import App from './App.vue'
import { db } from './firebaseConfig.js'


console.log("test:" + db)
createApp(App)
    .use(router)
    .mount('#app')