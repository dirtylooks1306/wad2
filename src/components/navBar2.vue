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
              <a class="nav-link active" aria-current="page" href="#">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Link</a>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Dropdown
              </a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#">Action</a></li>
                <li><a class="dropdown-item" href="#">Another action</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#">Something else here</a></li>
              </ul>
            </li>
            <li class="nav-item">
              <a class="nav-link disabled" aria-disabled="true">Disabled</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </template>
  
  
  <script>
  export default {
    name: 'NavBar',
  };
  </script>
  
<style scoped>
    .navbar {
  background-color: #FF9689 !important; /* Add !important to override any other styles */
    }

    .text-logo {
  display: block; /* Default display */
}

  .nav-logo {
    max-height: 50px; /* Adjust to fit within your navbar */
    height: auto;
    width: auto;
    display: block;
  }
  
  .logo-container {
    display: flex;
    align-items: center; /* Center vertically */
    justify-content: center; /* Center horizontally */
    height: 100%; /* Use full height of the navbar */
  }
  
  .navbar-brand {
    display: flex;
    align-items: center;
  }
  
  .navbar-toggler {
    border: none;
  }
  
  @media (max-width: 768px) {
    .navbar-collapse {
      text-align: center;
    }
  }
  @media (max-width: 440px) {
  .text-logo {
    display: none; /* Hide the text logo on smaller screens */
  }
}
  </style>
