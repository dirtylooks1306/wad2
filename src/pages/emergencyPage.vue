<script setup>
import NavBar from "../components/navBar.vue";
import CustomHeader from "../components/CustomHeader.vue";
import { ref } from 'vue';

//Current function to get user's current location, to add more functions later once Vue3 geolocation library is updated
const lat = ref(0);
const long = ref(0);
window.onload = getCurrentLocation;

function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      lat.value = position.coords.latitude
      long.value = position.coords.longitude
      //initMap(latitude, longitude);
    })
  } else {
    alert("Error!")
  }
}
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
    <CustomHeader header="FIND YOUR NEAREST A&E" />
    <div id="map">
      <img src="../assets/AnE.jpg" class="w-75"> <!-- Placeholder for map, rough gauge of map dimensions -->
    </div>
    <!-- When users click the button, the web will find nearest A&E location -->
    <form id="searchLocation">
      <button type="button" class="btn btn-success m-2 p-1">Find nearest A&E</button>
    </form>
  </div>

  <!-- Contact list divider -->
  <div class="contacts p-3">
    <CustomHeader header="CONTACTS" />
    <!-- Contact numbers displayed inline in same row as respective services, each service type separated into newlines -->
    <div class="contacts-list">
      <span class="service-type">AMBULANCE SERVICES:</span><p class="contact d-inline"> 995</p><br>
      <span class="service-type">PARENT COUNSELLING HOTLINE:</span><p class="contact d-inline"> 1800 222 0000</p><br>
      Other problems? Feel free to contact us <a class="contact-link" href="diary">here</a>. <!-- href link is temporary, to change later if contact page is present -->
    </div>
  </div>

</template>

<script>
  export default {
    name: 'emergencyPage',
    components: {
		  CustomHeader
	  },
    data() {
      return {
        apiKey: "AIzaSyATGD0drDahbJeZQOPtXkzm2Qid75e4Mww"
      }
    }
  };
  /*
  To Do: Figure out how to generate map using search.html and display as a mini map block
  - Get user current location and pin it on their maps
  - Pin nearest A&Es, as well as display it 
  - If nearest A&Es are calculated based on user location (lat & long), may not need form (Settled -> Changed to only
  include one button that will find nearest A&E by finding min diff in lat and long between user location and A&E location)
  - Place pin on nearest A&E location

  Plans for locating nearest A&E:
  1) Gather all A&E locations and group all locations in object based on region -> locations = {LocA: [], LocB: [], ...}
  2) Using latitude and longitude, calculate nearest A&E (min diff in lat and long)
  */
</script> 

<style scoped>
  #background-image {
    object-fit: cover;
    width: 100%;
    height: 400px;
  }

  button {
    font-family: "Cherry Bomb", sans-serif;
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
