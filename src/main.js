import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { db } from './firebaseConfig.js'

console.log("test:" + db)
createApp(App).mount('#app')
