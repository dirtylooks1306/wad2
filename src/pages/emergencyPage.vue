<script setup>
import NavBar from "../components/navBar.vue";
import CustomHeader from "../components/CustomHeader.vue";
//import GoogleMapsLoader from 'google-maps';
</script>

<template>
	<NavBar />
  <!-- Image overlay divider -->
  <div class="container-fluid p-0 position-relative"> <!-- Remove padding from side of image -->
    <div class="row no-gutters">
      <div class="col-12">
        <img src="../assets/AnE.jpg" class="img-fluid" id="background-image" alt=""> <!-- To change image -->
        <h5 class="img-overlay-center position-absolute">Emergency Resources</h5> 
      </div>
    </div>
  </div>

  <!-- Map block divider -->
  <div class="map-block p-3">
    <CustomHeader header="FIND YOUR NEAREST A&E"></CustomHeader>
    <h1>Insert map here</h1>
    <!-- May not need form -->
    <form id="searchLocation">
      Enter your location (region): <input type="text" class="bg-light rounded-3" id="locationName">
      <button type="button" class="btn btn-success m-2 p-1" onsubmit="">Submit</button>
      <br>Nearest A&E: <span id="nearestLocations"></span> <!-- Change text content when region has nearby A&Es -->
    </form>
  </div>

  <!-- Contact list divider -->
  <div class="contacts p-3">
    <CustomHeader header="CONTACTS"></CustomHeader>
    <!-- Contact numbers displayed inline in same row as respective services, each service type separated into newlines -->
    <div class="contacts-list">
      <span class="service-type">AMBULANCE SERVICES:</span><p class="contact d-inline"> 995</p><br>
      <span class="service-type">PARENT COUNSELLING HOTLINE:</span><p class="contact d-inline"> 1800 222 0000</p><br>
      Other problems? Feel free to contact us <a class="contact-link" href="diary">here</a>.
    </div>
  </div>

</template>
  
<script>
  export default {
    name: 'emergencyPage'
  };
  /*
  To Do: Figure out how to generate map using search.html and display as a mini map block
  - Get user current location and pin it on their maps
  - Pin nearest A&Es, as well as display it 
  - If nearest A&Es are calculated based on user location (lat & long), may not need form

  Plans for locating nearest A&E:
  1) Gather all A&E locations and group all locations in object based on region -> locations = {LocA: [], LocB: [], ...}
  2) If region exists, gather all locations in region and show to users in 'Nearest A&E' span
  3) If region does not exist, show error message in 'Nearest A&E' span
  */
</script> 

<style scoped>
  #background-image {
    object-fit: cover;
    width: 100%;
    height: 400px;
  }

  .contacts-list {
    color: #efba1d;
	  font-family: "Cherry Bomb", sans-serif;
    font-size: 30px;
  }
  
  .img-overlay-center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #ff9689;
	  font-family: "Cherry Bomb", sans-serif;
    font-size: 50px;
  }

  .map-block {
    background-color: #eed4d4;
  }

  .service-type, .contact-link {
    text-decoration: underline;
    text-decoration-color: #ff9689;
  }
</style>
