<script setup>
import NavBar from "../components/navBar.vue";
import {
  auth,
  signInWithEmailAndPassword,
} from "../firebaseConfig.js";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { onAuthStateChanged } from 'firebase/auth';
import { appState } from '../router';
// Form input state
const email = ref("");
const password = ref("");
const error = ref("");
const successMessage = ref("");

// Router instance for navigation
const router = useRouter();

// Redirect if the user is already logged in
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      router.push("/"); // Redirect to the home page if the user is logged in
    }
  });
});



// Function to handle login
const handleLogin = async () => {
  error.value = "";
  successMessage.value = "";

  if (!email.value || !password.value) {
    error.value = "Please enter both email and password.";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    successMessage.value = "Login successful! Redirecting...";
    // Redirect to the home page or dashboard after login
    setTimeout(() => {
      router.push("/");
    }, 2000); // Adjust the delay as needed
  } catch (err) {
    error.value = "Failed to login. Please check your credentials.";
  }
};
</script>

<template>
  <NavBar />
  <div class="login-container">
    <p v-if="appState.loginMessage" class="login-message">{{ appState.loginMessage }}</p>
    <h1>Login to CradleCare</h1>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email:</label>
        <input
          v-model="email"
          type="email"
          id="email"
          class="form-control"
          placeholder="Enter your email"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input
          v-model="password"
          type="password"
          id="password"
          class="form-control"
          placeholder="Enter your password"
          required
        />
      </div>
      <button type="submit" class="btn btn-primary">Login</button>
    </form>
    <br>
    <p class="error" v-if="error">{{ error }}</p>
    <p class="success" v-if="successMessage">{{ successMessage }}</p>
    <p>Forgot password? <router-link to="/forgotpassword">Reset here</router-link>.</p>
    <p>Don't have an account? <router-link to="/register">Register here</router-link>.</p>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-control {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.btn {
  width: 100%;
  padding: 10px;
  background-color: #FF9689;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #e57e74;
}

.error {
  color: red;
  margin-top: 10px;
}

.success {
  color: green;
  margin-top: 10px;
}

.login-message {
  color: red;
  margin-bottom: 10px;
}
</style>
