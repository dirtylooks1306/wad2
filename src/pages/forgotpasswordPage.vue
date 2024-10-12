<template>
    <NavBar />
    <div class="reset-container">
      <h1>Reset Your Password</h1>
      <p>Enter your email address below, and we'll send you instructions to reset your password.</p>
      <form @submit.prevent="handleResetPassword">
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
        <button type="submit" class="btn btn-primary">Send Reset Email</button>
      </form>
      <p class="error" v-if="error">{{ error }}</p>
      <p class="success" v-if="successMessage">{{ successMessage }}</p>
      <br>
      <p>Remembered your password? <router-link to="/login">Login here</router-link>.</p>
    </div>
  </template>
  
  <script setup>
  import NavBar from "../components/navBar.vue";
  import { auth, sendPasswordResetEmail } from "../firebaseConfig.js";
  import { ref, onMounted } from "vue";
  import { useRouter } from 'vue-router';
  import { onAuthStateChanged } from 'firebase/auth';
  
  // Create a router instance to programmatically navigate
  const router = useRouter();
  
  // Form input state
  const email = ref("");
  const error = ref("");
  const successMessage = ref("");
  
  // Redirect if the user is already logged in
  onMounted(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/"); // Redirect to the home page if the user is logged in
      }
    });
  });
  
  // Function to handle password reset
  const handleResetPassword = async () => {
    error.value = "";
    successMessage.value = "";
  
    if (!email.value) {
      error.value = "Please enter your email.";
      return;
    }
  
    try {
      await sendPasswordResetEmail(auth, email.value);
      successMessage.value = "Password reset email sent! Please check your inbox.";
      
      // Redirect to the login page after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      error.value = "Failed to send password reset email. " + err.message;
    }
  };
  </script>
  
  <style scoped>
  .reset-container {
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
  </style>
  