<template>
    <nav class="navbar">
      <div class="container">
        <div class="navbar-header">
          <!-- Hamburger menu for mobile view -->
          <button
            type="button"
            class="navbar-toggle"
            @click="toggleMenu"
            aria-label="Toggle navigation"
          >
            <img src="@/assets/icons/menu.png" alt="Menu" class="nav-icon" />
          </button>
  
          <!-- Logo with link to home page -->
          <router-link to="/" class="navbar-brand">
            <p class="navbar-logo">
              <img src="@/assets/logo/ccLogo.png" alt="Logo" class="nav-logo" />
              <img src="@/assets/logo/OutingSG_black.png" alt="OutingSG" class="nav-text-logo" />
            </p>
          </router-link>
        </div>
  
        <!-- Right side of the navbar -->
        <div class="navbar-collapse" :class="{ show: menuOpen }">
          <ul class="nav navbar-nav">
            <li>
              <router-link to="/explore">
                <img src="@/assets/icons/explore.png" class="nav-icon" alt="Explore" />
                Explore outings
              </router-link>
            </li>
            <li>
              <router-link to="/create">
                <img src="@/assets/icons/create.png" class="nav-icon" alt="Create" />
                Create outings
              </router-link>
            </li>
            <li>
              <router-link to="/saved">
                <img src="@/assets/icons/bookmark.png" class="nav-icon" alt="Saved" />
                Saved outings
              </router-link>
            </li>
            <li v-if="userIsLoggedIn">
              <router-link to="/profile">
                <img src="@/assets/icons/profile.png" class="nav-icon" alt="Profile" />
                Profile
              </router-link>
            </li>
            <li v-else>
              <router-link to="/login">
                <img src="@/assets/icons/login.png" class="nav-icon" alt="Login" />
                Login
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
</template>
  
  <script>
  import { getAuth } from "firebase/auth";
  import { ref } from 'vue';
  
  export default {
    name: 'NavBar',
    data() {
      return {
        userIsLoggedIn: false,
        searchQuery: '',
        menuOpen: false,
      };
    },
    methods: {
      checkUser() {
        const auth = getAuth();
        auth.onAuthStateChanged((user) => {
          this.userIsLoggedIn = !!user;
        });
      },
      toggleMenu() {
        this.menuOpen = !this.menuOpen;
      },
    },
    created() {
      this.checkUser();
    },
  };
  </script>
  
  <style scoped>
  .navbar {
    background-color: var(--primary);
    border: 0;
    border-radius: 0;
    margin: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 99;
  }
  
  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px;
  }
  
  .navbar-logo {
    display: flex;
    align-items: center;
  }
  
  .navbar-form {
    display: flex;
    margin: 0;
  }
  
  .input-group {
    display: flex;
  }
  
  .form-control {
    border: 0;
    border-radius: 4px;
    padding: 0.5em;
  }
  
  .navbar-toggle {
    background: none;
    border: none;
  }
  
  .nav-icon {
    width: 25px;
  }
  
  .nav-logo {
    width: 45px;
  }
  
  .navbar-collapse {
    display: none;
  }
  
  .navbar-collapse.show {
    display: block;
  }
  
  .navbar-nav {
    list-style: none;
    display: flex;
    gap: 10px;
  }
  
  .navbar-nav li {
    margin: 0;
  }
  
  .navbar-brand {
    text-decoration: none;
  }
  
  @media (max-width: 768px) {
    .navbar-collapse {
      display: block;
    }
  }
  </style>
  