<script setup>
import NavBar from "../components/navBar.vue";
import CustomHeader from "../components/CustomHeader.vue";
import { ref } from 'vue';
import { GoogleMap, Marker } from 'vue3-google-map'
</script>

<template>
	<NavBar />
  <!-- Image overlay divider -->
  <div class="container-fluid p-0 position-relative"> <!-- Remove padding from side of image -->
    <div class="row no-gutters">
      <div class="col-12">
        <img src="../assets/A&E test.png" class="img-fluid" id="background-image" alt=""> <!-- To change image -->
        <h5 class="img-overlay-center position-absolute">Emergency Resources</h5> 
      </div>
    </div>
  </div>

  <!-- Map block divider -->
  <div class="map-block p-3">
    <CustomHeader header="FIND YOUR NEAREST A&E" />
    <div id="map">
      <!-- Margin left and right set to auto to center map -->
      <GoogleMap 
        :api-key="apiKey" 
        style="width: 75%; height: 500px; margin-left: auto; margin-right: auto;"
        :center="{ lat: lat, lng: lng }" 
        :zoom="15">
        <div class="markers"> 
          <!-- To add marker here -->
          <Marker :options="{ position: { lat: lat, lng: lng }, title: 'Current Location' }" :clickable="true"/> <!-- Shows users their current location -->
          <!-- Add nearest location marker; add option to redirect users to Google Maps for users to calibrate their navigation route -->
          <Marker v-for="marker of newMarkers" :options="{ postition: { lat: marker.lat, lng: marker.lng } }"/>
        </div>
      </GoogleMap>
    </div>
    <!-- When users click the button, the web will find nearest A&E location -->
    <form id="searchLocation">
      <button type="button" class="btn btn-success m-2 p-1" @click="findNearest()">Find nearest A&E</button> <!-- To add function for button -->
    </form>
  </div>

  <!-- Contact list divider -->
  <div class="contacts p-3">
    <CustomHeader header="CONTACTS" />
    <!-- Contact numbers displayed inline in same row as respective services, each service type separated into newlines (To display as table) -->
    <!--
    <span class="service-type">AMBULANCE SERVICES:</span><p class="contact d-inline"> 995</p><br>
    <span class="service-type">PARENT COUNSELLING HOTLINE:</span><p class="contact d-inline"> 1800 222 0000</p><br>
    -->
    <table class="contacts-list w-100 mx-auto table-bordered">
      <tr>
        <th>SERVICE</th>
        <th>CONTACT NUMBER</th>
      </tr>
      <tr>
        <td>AMBULANCE</td><td>995</td>
      </tr>
      <tr>
        <td>PARENT COUNSELLINGING HOTLINE</td><td>1800 222 0000</td>
      </tr>
    </table>
    <p class="enquiries">Other problems? Feel free to contact us <a class="contact-link" href="diary">here</a>.</p> <!-- href link is temporary, to change later if contact page is present -->
  </div>

</template>

<script>
  export default {
    name: 'emergencyPage',
    components: {
		  CustomHeader,
      GoogleMap,
      Marker,
	  },
    data() {
      return {
        apiKey: "AIzaSyATGD0drDahbJeZQOPtXkzm2Qid75e4Mww",
        lat: null,
        lng: null,
        // Static storage of hospitals
        locations: [
        { name: 'Sengkang General Hospital', lat: 1.3956941909342555, lng: 103.89332626317386 }, 
        { name: 'Mount Elizabeth Hospital', lat: 1.3055822026727748, lng: 103.83582102084704 },
        { name: 'Raffles24 Acute & Critical Care', lat: 1.3064570380276461, lng: 103.85783013568981 },
        { name: 'Ng Teng Fong General Hospital', lat: 1.3343167862509524, lng: 103.7452355572338 }, 
        ],
        newMarkers: []
      }
    },
    created() {
    this.$getLocation()
      .then((coordinates) => {
        //console.log(coordinates);
        this.lat = coordinates.lat;
        this.lng = coordinates.lng;
      })
      .catch((error) => {
        console.log(error);
      });
    },
    //Functions to compute distance between user's location and various hospitals
    methods: {
      computeDist(lat1, lat2, lon1, lon2) {
        const R = 6371e3; // metres
        const latRad1 = lat1 * Math.PI/180; // φ, λ in radians
        const latRad2 = lat2 * Math.PI/180;
        const latRadDiff = (lat2-lat1) * Math.PI/180;
        const lonRadDiff = (lon2-lon1) * Math.PI/180;
        const a = Math.sin(latRadDiff/2) * Math.sin(latRadDiff/2) +
          Math.cos(latRad1) * Math.cos(latRad2) *
          Math.sin(lonRadDiff/2) * Math.sin(lonRadDiff/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c; // in metres
        return d;
      },
      findNearest() {
        //Part 1: Compute distance between user and each hospital, then find nearest location
        let nearestHospital;
        let nearestDist = 99999999; // Default value of greatest distance
        let userLat = this.lat;
        let userLng = this.lng;
        for (let hospital of this.locations) {
          let dist;
          let hospitalName = hospital.name;
          dist = this.computeDist(userLat, hospital.lat, userLng, hospital.lng);
          if (dist < nearestDist) {
            nearestHospital = hospital;
            nearestDist = dist;
          }
        }
        //console.log(nearestHospital, nearestDist); -> Successfully finds nearest hospital
        //Part 2: Add nearest hospital location as a marker
        this.newMarkers.push(nearestHospital);
        console.log(`Marker successfully added! Nearest hospital: ${nearestHospital.name}`)
      }
    }
  };
  /*
  To Do: 
  - Figure out how to generate map using search.html and display as a mini map block (Settled)
  - Get user current location and pin it on their maps (Settled) 
  - If nearest A&Es are calculated based on user location (lat & long), may not need form (Settled -> Changed to only
  include one button that will find nearest A&E by finding min diff in lat and long between user location and A&E location)
  - Place pin on nearest A&E location

  Plans for locating nearest A&E:
  1) Gather all A&E locations and group all locations in object based on region -> locations = {LocA: [], LocB: [], ...}
  2) Using latitude and longitude, calculate nearest A&E (min diff in lat and long)
  3) Store a few A&E locations as static storage first; if it works, start storing dynamically (Do by next Wed)
  */
</script> 

<style scoped>
  #background-image {
    /*object-fit: cover; */
    width: 100%;
    height: 400px;
  }

  button {
    font-family: "Cherry Bomb", sans-serif;
  }

  .contacts-list, table, .enquiries{
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

  .contact-link, th{
    text-decoration: underline;
    text-decoration-color: #ff9689;
  }

  table {
    border: 1px solid #ff9689
  }

  tr:hover {
    background-color: #eed4d4;
  }
</style>
