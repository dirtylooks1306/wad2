<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">
        <div class="logo-container">
          <img src="../assets/icons/ccLogo.png" class="nav-logo" alt="Logo" />
          <img src="../assets/icons/cctextLogo.png" class="nav-logo text-logo" alt="CradleCare" />
        </div>
      </router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link to="/diary" class="nav-link" :class="{ 'active-item': route.path === '/diary' }">Diary</router-link>
          </li>
          <li class="nav-item dropdown" :class="{ 'active': isExploreActive }">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Explore articles
            </a>
            <ul class="dropdown-menu">
              <li>
                <router-link class="dropdown-item" :class="{ 'active-item': activeCategory === 'new' }" to="/articles/new">New!</router-link>
              </li>
              <li>
                <router-link class="dropdown-item" :class="{ 'active-item': activeCategory === 'activities' }" to="/articles/activities">Activities</router-link>
              </li>
              <li>
                <router-link class="dropdown-item" :class="{ 'active-item': activeCategory === 'education' }" to="/articles/education">Education</router-link>
              </li>
              <li>
                <router-link class="dropdown-item" :class="{ 'active-item': activeCategory === 'nutrition' }" to="/articles/nutrition">Nutrition</router-link>
              </li>

              <!-- Clear, visible partition line -->
              <li><div class="custom-divider"></div></li>

              <!-- Updated 'Favourite' to 'Saved' -->
              <li>
                <router-link class="dropdown-item" :class="{ 'active-item': activeCategory === 'saved' }" to="/articles/saved">
                  Saved
                </router-link>
              </li>
            </ul>
          </li>
          <li class="nav-item">
            <router-link to="/forum" class="nav-link" :class="{ 'active-item': route.path === '/forum' }">Forum</router-link>
          </li>
          <li class="nav-item dropdown" :class="{ 'active': isTrackerActive }">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Explore trackers
            </a>
            <ul class="dropdown-menu">
              <li>
                <router-link to="/growthtracker" class="nav-link" :class="{ 'active-item': route.path === '/growthtracker' }">GrowthTracker</router-link>
              </li>
              <li>
                <router-link to="/vaccinetracker" class="nav-link" :class="{ 'active-item': route.path === '/vaccinetracker' }">Vaccine Tracker</router-link>
              </li>
            </ul>
          </li>
          <li class="nav-item">
            <router-link to="/emergency" class="nav-link" :class="{ 'active-item': route.path === '/emergency' }">Emergency</router-link>
          </li>
          <li class="nav-item d-lg-none" v-if="!user">
            <router-link to="/login" class="nav-link login-register">Login/Register</router-link>
          </li>
          <li class="nav-item d-lg-none" v-else>
            <router-link to="/profile" class="nav-link">
              <img src="../assets/icons/profile.png" class="profile-icon">
            </router-link>
          </li>
        </ul>
      </div>

      <div class="d-none d-lg-flex ms-auto">
        <router-link v-if="!user" to="/login" class="nav-link login-register" :class="{ 'active-item': route.path === '/login' || route.path === '/register' }">
          Login/Register
        </router-link>
        
        <div v-else class="d-flex align-items-center position-relative">
          <div class="dropdown">
            <router-link to="/profile" class="nav-link" id="profileDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <img :src="profileImage" class="profile-icon">
            </router-link>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
              <li>
                <router-link to="/profile" class="dropdown-item">Profile</router-link>
              </li>
              <li>
                <button class="dropdown-item" @click="handleLogout">Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  </nav>

  <div id="belownavBar"></div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { computed, ref, onMounted } from 'vue';
import { useRouter } from "vue-router";
import { auth, signOut, doc, getDoc, db } from '../firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';

const route = useRoute();
const router = useRouter();

const profileImage = ref("../assets/icons/profile.png");
const user = ref(null);
const isExploreActive = computed(() => route.path.startsWith('/articles') || route.path === '/saved');
const isTrackerActive = computed(() => route.path.startsWith('/growthtracker') || route.path.startsWith('/vaccinetracker'));
const activeCategory = computed(() => route.params.category || '');

const handleLogout = async () => {
  try {
    await signOut(auth);
    user.value = null; // Clear the user data
    router.push('/login'); // Redirect to the login page after logging out
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
const fetchUserData = async () => {
  onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      // Get the user's document reference
      const userDocRef = doc(db, "users", currentUser.uid);

      // Fetch the user document
      const userSnapshot = await getDoc(userDocRef);
      
      if (userSnapshot.exists()) {
        // Retrieve the profile image URL from the user document
        profileImage.value = userSnapshot.data().profileimage; 
      } else {
        console.log("No user document found");
      }
    
    }
  });
};

onMounted(() => {
  fetchUserData();
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser;
  });
});
</script>

<style scoped>
#belownavBar {
  height: 80px;
}

.navbar {
  background-color: #FF9689 !important;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

.nav-logo {
  max-height: 50px;
  height: auto;
  width: auto;
}

.profile-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff; 
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); 
}


.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.navbar-toggler {
  border: none;
}

.dropdown-menu {
  background-color: #FBF4EB !important;
}

.active-item {
  font-weight: bold;
  text-decoration: underline;
}

.active > .nav-link {
  text-decoration: underline;
  font-weight: bold;
}

.login-register {
  text-decoration: none;
  color: #000;
  margin-left: 10px;
  transition: color 0.3s;
}

.login-register:hover {
  color: #555;
}

@media (max-width: 768px) {
  .navbar-collapse {
    text-align: center;
  }
}

@media (max-width: 440px) {
  .text-logo {
    display: none;
  }
}

.custom-divider {
  height: 1px;
  background-color: #000;
  width: 100%;
  margin: 0;
}
</style>
