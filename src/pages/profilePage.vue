<script setup>
import NavBar from "../components/navBar.vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { auth, signOut, db, collection, query, where, getDocs } from "../firebaseConfig.js";

// State for user information
const user = ref(null);
const username = ref("");
const router = useRouter();

// Function to fetch the user's username from Firestore
const fetchUserData = async () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const userCollection = collection(db, "users");
      const q = query(userCollection, where("email", "==", currentUser.email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        username.value = doc.data().username;
      });
      user.value = currentUser;
    } catch (error) {
      console.error("Error getting user data:", error);
    }
  } else {
    router.push('/login'); // Redirect to login if no user is found
  }
};

// Fetch user data when the component is mounted
onMounted(() => {
  fetchUserData();
});

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
  <div class="profile-container" v-if="user">
    <h1>Welcome, {{ username || 'User' }}!</h1>
    <p>Your email: {{ user.email }}</p>
    <p>You are currently logged in to CradleCare.</p>
    <button @click="handleLogout" class="btn btn-danger">Logout</button>
  </div>
</template>

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