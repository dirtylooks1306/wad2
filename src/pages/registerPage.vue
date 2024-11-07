<script setup>
import NavBar from "../components/navBar.vue";
import {
  auth,
  createUserWithEmailAndPassword,
  db,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "../firebaseConfig.js";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { onAuthStateChanged } from 'firebase/auth';

// Router instance for navigation
const router = useRouter();

// Form input state
const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
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

// Function to check if the username exists in Firestore
const checkUsername = async () => {
  try {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("username", "==", username.value));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Return true if the username exists
  } catch (error) {
    console.error("Error checking username: ", error);
    return false;
  }
};

// Function to handle registration
const handleRegister = async () => {
  error.value = "";
  successMessage.value = "";

  // Validate form inputs
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = "Please fill in all fields.";
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match.";
    return;
  }

  // Check if the username is already taken
  const usernameExists = await checkUsername();
  if (usernameExists) {
    error.value = "Username is already taken. Please choose a different one.";
    return;
  }

  try {
    // Create the user with email and password
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    const isFirstUser = usersSnapshot.empty;
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);


    const role = isFirstUser ? "admin" : "user";
    // Create a user document in the "users" collection with the username as the field
    await setDoc(doc(db, "users", userCredential.user.uid), {
      username: username.value,
      email: email.value, // Optionally store the email in the document as well
      role: role,
    });

    successMessage.value = "Registration successful! Redirecting...";
    
    // Redirect to the login page after successful registration
    setTimeout(() => {
      router.push("/login");
    }, 2000); // Adjust the delay as needed
  } catch (err) {
    error.value = "Failed to register. " + err.message;
  }
};
</script>

<template>
  <NavBar />
  <div class="register-container">
    <h1>Register for CradleCare</h1>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="username">Username:</label>
        <input
          v-model="username"
          type="text"
          id="username"
          class="form-control"
          placeholder="Enter your username"
          minlength="3"
          required
        />
      </div>
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
      <div class="form-group">
        <label for="confirmPassword">Confirm Password:</label>
        <input
          v-model="confirmPassword"
          type="password"
          id="confirmPassword"
          class="form-control"
          placeholder="Confirm your password"
          required
        />
      </div>
      <button type="submit" class="btn btn-primary">Register</button>
    </form>
    <p class="error" v-if="error">{{ error }}</p>
    <p class="success" v-if="successMessage">{{ successMessage }}</p>
    <br>
    <p>Already have an account? <router-link to="/login">Login here</router-link>.</p>
  </div>
</template>

<style scoped>
.register-container {
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