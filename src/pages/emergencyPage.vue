<script setup>
import NavBar from "../components/navBar.vue";
import CustomHeader from "../components/CustomHeader.vue";
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
  <div class="map-block p-3 position-relative">
    <CustomHeader header="FIND YOUR NEAREST A&E" />
    <!-- Help prompt to guide users on how to use the map -->
    <div id="helpPrompt" class="position-absolute">
      <button type="button" class="btn btn-primary px-4" id="help"><span>Help</span></button>
    </div>
    <div id="map">
      <!-- Margin left and right set to auto to center map -->
      <GoogleMap 
        :api-key="apiKey" 
        style="width: 75%; height: 500px; margin-left: auto; margin-right: auto;"
        :center="{ lat: lat, lng: lng }" 
        :zoom="15">
        <div class="markers"> 
          <!-- Shows users their current location, change marker location to nearest hospital when one is found -->
          <Marker :options="{ position: { lat: lat, lng: lng }, title: 'Current Location' }" :clickable="true"/> 
        </div>
      </GoogleMap>
    </div>
    <!-- When users click the button, the web will find nearest A&E location -->
    <form id="searchLocation">
      <button type="button" class="btn btn-success m-2 p-1" @click="findNearest()"><span>Find nearest A&E</span></button> <!-- To add function for button -->
    </form>
    <span id="nearest">Nearest hospital: <strong>{{ nearest }}</strong></span>
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
      <thead>
        <tr>
          <th>SERVICE</th>
          <th>CONTACT NUMBER</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>AMBULANCE</td><td>995</td>
        </tr>
        <tr>
          <td>PARENT COUNSELLINGING HOTLINE</td><td>1800 222 0000</td>
        </tr>
      </tbody>
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
        { name: 'Alexandra Hospital', lat: 1.2874962987730814, lng: 103.80073267207732 },
        { name: 'Changi General Hospital', lat: 1.34404999352938, lng: 103.94960279625784 },
        { name: 'Gleneagles Hospital', lat: 1.30764521242119, lng: 103.8198628858667 },
        { name: 'Khoo Teck Puat Hospital', lat: 1.4243705790643706, lng: 103.8385962294709 },
        { name: "KK Women’s and Children’s Hospital", lat: 1.311177296639997, lng: 103.84681932461908 },
        { name: 'Mount Alvernia Hospital', lat: 1.3420612484696135, lng: 103.83770458957798 },
        { name: 'Mount Elizabeth Hospital', lat: 1.3055822026727748, lng: 103.83582102084704 },
        { name: 'Mount Elizabeth Novena Hospital', lat: 1.322267321333642, lng: 103.84404006861622 },
        { name: 'Sengkang General Hospital', lat: 1.3956941909342555, lng: 103.89332626317386 }, 
        { name: 'National University Hospital', lat: 1.2945680095759684, lng: 103.78301453136561 },
        { name: 'Ng Teng Fong General Hospital', lat: 1.3343167862509524, lng: 103.7452355572338 }, 
        { name: 'Parkway East Hospital', lat: 1.3152592115077777, lng: 103.9090328445181 },
        { name: 'Raffles Hospital', lat: 1.3011719940290543, lng: 103.85708979562519 },
        { name: 'SGH A&E', lat: 1.27887889121749, lng: 103.83490623940729 },
        { name: 'Tan Tock Seng Hospital', lat: 1.321445820283406, lng: 103.84583988689484 },
        { name: 'Woodlands Health Campus', lat: 1.430755656187611, lng: 103.79459742535192 },
        ],
        nearest: null,
      }
    },
    created() {
    this.$getLocation()
      .then((coordinates) => {
        //console.log(coordinates);
        // Whenever user loads the website, geolocation prompt captures coordinates of user's current location and updates lat and long values in instance
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
        var nearestHospital;
        let nearestDist = 99999999; // Default value of greatest distance
        let userLat = this.lat;
        let userLng = this.lng;
        for (let hospital of this.locations) {
          let dist;
          let hospitalName = hospital.name;
          dist = this.computeDist(userLat, hospital.lat, userLng, hospital.lng); 
          // This is distance over the Earth's surface (aka 'as-the-crow-flies' distance), actual difference slightly varies from formula 
          if (dist < nearestDist) {
            nearestHospital = hospital;
            nearestDist = dist;
          }
        }
        //console.log(nearestHospital, nearestDist); -> Successfully finds nearest hospital
        //Part 2: Add nearest hospital location as a marker
        /* 
        this.newMarkers.push(nearestHospital);
        console.log(`Marker successfully added! Nearest hospital: ${nearestHospital.name}`);
        console.log(this.newMarkers);
        */
        this.nearest = nearestHospital.name;
        this.lat = nearestHospital.lat;
        this.lng = nearestHospital.lng;
      }
    }
  };
  /*
  To Do: 
  - Start moving static storage of hospital locations into Firebase -> Figure out how to import Firebase data to use in functions (Do by Wed-Fri)

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

  button span {
    cursor: pointer;
    display: inline-block;
    position: relative;
    transition: 0.5s;
  }

  button span:after {
    content: '\00bb'; /* Double arrow */
    position: absolute;
    opacity: 0;
    top: 0;
    right: -20px;
    transition: 0.5s;
  }

  button:hover span {
    padding-right: 25px;
  }

  button:hover span:after {
    opacity: 1;
    right: 0;
  }

  .contacts-list, table, .enquiries, #nearest{
	  color: #efba1d;
    font-family: "Cherry Bomb", sans-serif;
    font-size: 30px;
  }
    
  .contact-link, th, strong{
    text-decoration: underline;
    text-decoration-color: #ff9689;
  }

  #help {
    transition: all 0.5s;
    cursor: pointer;
  }

  #helpPrompt {
    top: 10px;
    right: 50px;
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

  table {
    border: 1px solid #ff9689
  }

  tr:hover {
    background-color: #eed4d4;
  }

</style>
