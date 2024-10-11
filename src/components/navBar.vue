<script setup>
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

// Computed property to determine if the current route is under /articles
const isExploreActive = computed(() => route.path.startsWith('/articles'));

// Computed property for highlighting the specific category
const activeCategory = computed(() => route.params.category || '');
</script>

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

      <!-- Collapsible navigation content -->
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
              <li>
                <hr class="dropdown-divider">
              </li>
              <li>
                <router-link class="dropdown-item" :class="{ 'active-item': activeCategory === 'recent' }" to="/articles/recent">Most recently visited</router-link>
              </li>
            </ul>
          </li>
          <li class="nav-item">
            <router-link to="/forum" class="nav-link" :class="{ 'active-item': route.path === '/forum' }">Forum</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/tracker" class="nav-link" :class="{ 'active-item': route.path === '/tracker' }">GrowthTracker</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/emergency" class="nav-link" :class="{ 'active-item': route.path === '/emergency' }">Emergency</router-link>
          </li>
          <!-- Login/Register link inside collapsible menu for small screens -->
          <li class="nav-item d-lg-none">
            <router-link to="/login" class="nav-link login-register">Login/Register</router-link>
          </li>
        </ul>
      </div>

      <!-- Right-aligned Login/Register link for larger screens -->
      <div class="d-none d-lg-flex ms-auto">
        <router-link to="/login" class="nav-link login-register" :class="{ 'active-item': route.path === '/login' || route.path === '/register' }" >Login/Register</router-link>
      </div>
    </div>
  </nav>

  <div id="belownavBar"></div>
</template>

<style scoped>
#belownavBar {
  height: 80px;
}

.navbar {
  background-color: #FF9689 !important;
  position: fixed; /* Makes the navbar fixed */
  top: 0; /* Sticks the navbar to the top */
  left: 0;
  width: 100%; /* Ensures the navbar spans the full width */
  z-index: 1000; /* Keeps the navbar above other content */
}

.nav-logo {
  max-height: 50px;
  height: auto;
  width: auto;
  display: block;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
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

/* Highlight the active dropdown link */
.active-item {
  font-weight: bold;
  text-decoration: underline;
}

/* Highlight Explore articles link when active */
.active > .nav-link {
  text-decoration: underline;
  font-weight: bold;
}

/* Styles for login/register link */
.login-register {
  text-decoration: none;
  color: #000;
  margin-left: 10px; /* Add some space between the links */
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
</style>