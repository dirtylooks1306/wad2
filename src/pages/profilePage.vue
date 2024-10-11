<script setup>
import NavBar from "../components/navBar.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth, signOut } from "../firebaseConfig.js";

// State for user information (for demonstration, using a placeholder)
const user = ref(auth.currentUser);
const router = useRouter();

// Function to handle logout
const handleLogout = async () => {
  try {
    await signOut(auth);
    user.value = null; // Clear the user data
    // Redirect to the login page after logging out
    router.push('/login');
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
</script>

<template>
  <NavBar />
  <div class="profile-container">
    <h1>Welcome, {{ user?.email || 'User' }}!</h1>
    <p>Your email: {{ user?.email }}</p>
    <p>You are currently logged in to CradleCare.</p>
    <button @click="handleLogout" class="btn btn-danger">Logout</button>
  </div>
</template>

<script>
export default {
  name: 'profilePage',
};
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 100px auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.btn {
  background-color: #FF9689;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

.btn-danger:hover {
  background-color: #e57e74;
}
</style>