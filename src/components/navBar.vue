<template>
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
      <div class="container-fluid">
        <!-- Logo with container for alignment -->
        <router-link to="/" class="navbar-brand">
          <div class="logo-container">
            <img src="../assets/icons/ccLogo.png" class="nav-logo" alt="Logo" />
            <img src="../assets/icons/cctextLogo.png" class="nav-logo text-logo" alt="CradleCare" />
          </div>
        </router-link>
        <!-- Toggler button for mobile view -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <!-- Collapsible navigation content -->
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link to="/diary" class="nav-link" aria-current="page">Diary</router-link>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Explore articles
              </a>
              <ul class="dropdown-menu">
                <li>
                  <router-link class="dropdown-item" to="/articles/new">New!</router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/articles/activities">Activities</router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/articles/education">Education</router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/articles/nutrition">Nutrition</router-link>
                </li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li>
                  <router-link class="dropdown-item" to="/articles/recent">Most recently visited</router-link>
                </li>
              </ul>
            </li>
            <li class="nav-item">
              <router-link to="/forum" class="nav-link">Forum</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/tracker" class="nav-link">GrowthTracker</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/emergency" class="nav-link">Emergency</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <div id="belownavBar">
    </div>
  </template>
  
  <script>
  export default {
    name: 'NavBar',
  };
  </script>
  
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
  
  /* Highlight the active link */
  .router-link-active {
    text-decoration: underline; /* Underline the active link */
    color: #000; /* Change the color for better visibility */
  }
  
  /* Specific styling for the active dropdown */
  .router-link-exact-active {
    font-weight: bold; /* Make the active link bold */
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