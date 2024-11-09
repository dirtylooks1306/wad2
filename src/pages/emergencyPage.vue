<script setup>
import NavBar from "../components/navBar.vue";
import CustomHeader from "../components/CustomHeader.vue";
import { GoogleMap, AdvancedMarker } from 'vue3-google-map';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { onMounted, ref, watch, nextTick } from 'vue';
import { collection, query, getDocs } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';  // Correct Firestore imports
import { db } from "../firebaseConfig.js";  // Import the Firestore instance (db)
// Log the Firestore instance to ensure it's properly initialized

//Segment to retrieve hospital locations from Firebase
const route = useRoute();
const locationList = ref([]);
const fetchLocations = async() => {
  try {
    const locations = collection(db, "locations");
    const q = query(locations);
    const querySnapshot = await getDocs(q);
    locationList.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch(error) {
    console.error("Error fetching locations:", error.message);
  }
}
onMounted(fetchLocations);
//console.log(locationList); -> Successfully retrieved hospital locations from Firebase
//Segment end

//Segment to help users find nearest distance to hospital
//Part 1: Declaration of variables
const mapID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const userLat = ref(0);
const userLng = ref(0);
const locationReady = ref(false);
const steps = ref([]); //To show users the route to take
//References for modals
const reminderModal = ref(null);
const isFirstInitialised = ref(false);
const firstModal = ref(null);
const pageInitialised = ref(false);
//Modal references end
var markerLat;
var markerLng;
var nearest;
window.onload = getCurrentLocation;
//Part 1 End

//Part 2: Functions for geolocation prompt and location finding (If users allow location access)
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      userLat.value = position.coords.latitude
      userLng.value = position.coords.longitude
      markerLat = userLat;
      markerLng = userLng;
      locationReady.value = true;
      //Ensures that DOM updates before showing the modal
      nextTick(() => {
        isFirstInitialised.value = true;
        const modalElement = reminderModal.value;
        const bootstrapModal = new window.bootstrap.Modal(modalElement);
        bootstrapModal.show()
      })
    })
  } else {
    document.getElementById("errorMsg").innerText = "Error retrieving your location!"
  }
};

watch([userLat, userLng],([newLat, newLng]) => {
  if (newLat && newLng) {
    userLat.value = newLat;
    userLng.value = newLng;
  }
})

function computeDist(lat1, lat2, lon1, lon2) {
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
};
function findNearest() {
  //Part 1: Compute distance between user and each hospital, then find nearest location
  let nearestHospital;
  let nearestDist = 99999999; // Default value of greatest distance
  for (let hospital of locationList["_value"]) {
    let dist;
    dist = computeDist(userLat["_value"], hospital.lat, userLng["_value"], hospital.lng); 
    // This is distance over the Earth's surface (aka 'as-the-crow-flies' distance), actual difference slightly varies from formula 
    if (dist < nearestDist) {
      nearestHospital = hospital;
      nearestDist = dist;
    }
  }
  nearest = nearestHospital.name;
  //Test directionsRenderer service
  var directionsService = new google.maps.DirectionsService();
  var request = {
    origin: { lat: userLat.value, lng: userLng.value },
    destination: { lat: nearestHospital.lat, lng: nearestHospital.lng },
    travelMode: google.maps.TravelMode.DRIVING,
  };
  directionsService.route(request, (response, status) => {
    if (status === "OK") {
      //console.log(response);
      const legs = response.routes[0].legs[0]; //Assuming a single route with one leg
      legs.steps.forEach((step) => {
        steps.value.push({
          instruction: step.instructions,
          distance: step.distance.text,
          duration: step.duration.text,
        })
      })
    } else {
      console.error("Failed to set directions");
    }
  })
  //Change the marker coordinates after directions are set?
  markerLat.value = nearestHospital.lat;
  markerLng.value = nearestHospital.lng;
};
//Part 2 End
//Segment end

//Function for popup prompt
function showPopUp() {
	var popup = document.getElementById("helpPopUp");
	popup.classList.toggle("show");
}

//Function to set user location
function setLocation() {
  nearest = null;
  var location = document.getElementById("userLocation").value
  axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
    params: {
      address: location,
      key: apiKey
    }
  })
  .then(response => {
    //console.log(response.data)
    //console.log(response.data.results[0].geometry.location);
    steps.value = []; // Reset the steps reference each time the user sets the location
    let coordinates = response.data.results[0].geometry.location;
    userLat.value = coordinates.lat;
    userLng.value = coordinates.lng;
    locationReady.value = true;
    markerLat = userLat;
    markerLng = userLng;
    document.getElementById("errorMsg").innerText = "Location set successfully!";
    setTimeout(() => {
      document.getElementById("errorMsg").innerText = "";
    }, 3000);
    //Ensures that DOM updates before showing the modal and only show if users are setting their location for the first time
    nextTick(() => {
      if (!isFirstInitialised.value) {
        const modalElement = reminderModal.value;
        const bootstrapModal = new window.bootstrap.Modal(modalElement);
        isFirstInitialised.value = true;
        bootstrapModal.show();
      }
    });
  })
  .catch(error => {
    //console.log(error.message);
    document.getElementById("errorMsg").innerText = "Please enter a valid location.";
    setTimeout(() => {
      document.getElementById("errorMsg").innerText = "";
    }, 3000);
  })
  clear()
}

function clear() {
  document.getElementById("userLocation").value = "";
}
//Function to update user location when marker is dragged
function updateLocation(event) {
  nearest = null;
  steps.value = []; // Reset the steps reference each time the user sets the location
  const newPosition = event.latLng;
  markerLat.value = newPosition.lat();
  markerLng.value = newPosition.lng();
  userLat.value = markerLat.value;
  userLng.value = markerLng.value;
  document.getElementById("errorMsg").innerText = "Location set successfully!";
  setTimeout(() => {
    document.getElementById("errorMsg").innerText = "";
  }, 3000);
}

//Modal to initialise when emergency page is loaded
onMounted(() => {
  if (!pageInitialised.value) {
    pageInitialised.value = true;
    const modalElement = firstModal.value;
    const bootstrapModal = new window.bootstrap.Modal(modalElement);
    bootstrapModal.show();
  }
})
</script>

<template>
	<NavBar />
	<!-- Image overlay divider -->
	<div class="container-fluid p-0 position-relative">
		<!-- Remove padding from side of image -->
		<div class="row no-gutters">
			<div class="col-12">
				<img
					src="../assets/hospital.jpg"
					class="img-fluid"
					id="background-image"
					alt=""
				/>
				<!-- To change image, refer to Pinterest -->
				<h5 class="img-overlay-center position-absolute">
					EMERGENCY RESOURCES
				</h5>
			</div>
		</div>
	</div>

  <!-- Map block divider -->
  <div class="map-block p-3 position-relative" >
    <CustomHeader header="FIND YOUR NEAREST A&E" />
    <!-- Help prompt to guide users on how to use the map -->
    <div id="helpPrompt" class="position-absolute popup" v-if="locationReady">
      <button type="button" class="btn btn-primary px-4" id="help" @click="showPopUp"><span>Help</span></button>
      <span class="popuptext p-2" id="helpPopUp">
        1. Click on the "Find Nearest A&E" button to locate your nearest hospital.<br>
        2. If you are still unsure of the directions provided, you can click 'View on Google Maps' to get a better visualisation of the directions.<br>
        3. If the location marker cannot be seen, feel free to zoom in the map to get a clearer view!
      </span>
    </div>
    <!-- Modal that shows when webpage gets the user's location -->
    <div class="modal fade" tabindex="-1" ref="reminderModal" aria-hidden="true" v-if="locationReady">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reminder</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="close"></button>
          </div>
          <div class="modal-body">
            <p>The map marker can also be dragged to set your location.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    <div id="map" v-if="locationReady">
      <!-- Margin left and right set to auto to center map -->
      <GoogleMap 
        :api-key="apiKey"
        :mapId="mapID"
        style="width: 75%; height: 500px; margin-left: auto; margin-right: auto;"
        :center="{ lat: userLat, lng: userLng }" 
        :zoom="16">
        <!-- Shows users their current location, change marker location to nearest hospital when one is found -->
        <AdvancedMarker :options="{ position: { lat: markerLat, lng: markerLng }, title: 'Current Location', gmpDraggable: true }"
        @dragend="updateLocation"/> 
      </GoogleMap>
    </div>
    <div v-else class="centered-container">
      <div id="setUserLocation" class="d-flex justify-content-center align-items-center">
        <input id="userLocation" type="text" class="rounded-2 p-1" placeholder="Enter location" @keyup.enter="setLocation">
        <button type="button" class="btn btn-primary m-2 p-1" @click="setLocation"><span>Set Current Location</span></button>
      </div>
      <button type="button" class="btn btn-success m-2 p-1" @click="getCurrentLocation"><span>Initialise Map</span></button>
	    <br>
      <div class="modal fade" tabindex="-1" aria-hidden="true" ref="firstModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">NOTE</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="close"></button>
            </div>
            <div class="modal-body">
              <p class="text-start">If location access is blocked, feel free to set your location manually. Otherwise, just click 'Initialise Map' and you're good to go!</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
      <span id="errorMsg" class="blinking-text"></span>
    </div>
    <div v-if="locationReady" class="centered-container">
      <!-- When users click the button, the web will find nearest A&E location -->
      <form id="searchLocation">
        <button type="button" class="btn btn-success m-2 p-1" @click="findNearest()"><span>Find nearest A&E</span></button>
      </form>
      <span id="nearest" v-if="nearest">Nearest hospital: <strong>{{ nearest }}</strong></span>
      <div id="changeLocation" class="d-flex align-items-center justify-content-center">
        <input id="userLocation" type="text" class="rounded-2 p-1" placeholder="Change location" @keyup.enter="setLocation">
        <button type="button" class="btn btn-primary m-2 p-1" @click="setLocation"><span>Change Location</span></button>
      </div>
      <span id="errorMsg" class="blinking-text"></span>
      <div class="directions container-fluid w-100 rounded-2" v-if="steps.length !== 0">
        <h3 id="direction-header">Directions:</h3>
        <ol>
          <li class="text-start direction-item" v-for="(step, index) in steps" :key="index">
            <p class="step-number">{{ index + 1 }}. </p>
            <p v-html="step.instruction" class="step-instruction"></p>
            <p class="step-info">
              <span class="icon-distance">📏</span> {{ step.distance }} 
              <span class="icon-duration">⏱️</span> {{ step.duration }}
            </p>
          </li>
        </ol>
      </div>
    </div>
  </div>

  <!-- Contact list divider -->
  <div class="contacts p-3">
    <CustomHeader header="CONTACTS" />
    <table class="w-75 mx-auto table-bordered text-center">
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
          <td>PARENT COUNSELLING HOTLINE</td><td>1800 222 0000</td>
        </tr>
      </tbody>
    </table>
  </div>

</template>

<style scoped>
#background-image {
  width: 100%;
  height: 400px;
}

.blinking-text {
  font-size: 20px;
  font-family: "Cherry Bomb", sans-serif;
  color: black;
  animation: blink 1s infinite;
}

button, #direction-header {
	font-family: "Cherry Bomb", sans-serif;
}

button span {
	cursor: pointer;
	display: inline-block;
	position: relative;
	transition: 0.5s;
}

button span:after {
	content: "\00bb"; /* Double arrow */
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
/* Directions Section */
.directions {
  background-color: #FBF4EB;
  animation: fadeIn 1s ease-in-out;
}

@keyframes fadeIn {
  from {opacity: 0;}
  to {opacity: 1;}
}

.step-number {
  font-weight: bold;
}
/* Directions Section end */
#nearest{
  color: #efba1d;
  font-family: "Cherry Bomb", sans-serif;
  font-size: 30px;
}
    
strong{
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
	-webkit-text-stroke: 1px #555;
}

.map-block {
	background-color: #eed4d4;
}

.centered-container {
	width: fit-content;
	margin: 0 auto;
	text-align: center;
}

.popup {
	position: relative;
	display: inline-block;
	cursor: pointer;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
}

.popup .popuptext {
	visibility: hidden;
	width: 160px;
	background-color: #555;
	color: #fff;
	text-align: center;
	border-radius: 6px;
	padding: 8% 0;
	position: absolute;
	z-index: 1;
	top: 125%;
	left: 50%;
	margin-left: -80px;
}

/* Popup arrow */
.popup .popuptext::after {
	content: "";
	position: absolute;
	bottom: 100%;
	left: 50%;
	margin-left: -5px;
	border-width: 5px;
	border-style: solid;
	border-color: transparent transparent #555 transparent;
}

/* Toggle this class - hide and show the popup */
.popup .show {
	visibility: visible;
	-webkit-animation: fadeIn 1s;
	animation: fadeIn 1s;
}

table {
	border: 1px solid #ff9689;
  font-family: sans-serif;
}

tr:hover {
	background-color: #eed4d4;
  transition: all 1s;
}

/* Add animation (fade in the popup) */
@-webkit-keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
      opacity: 0;
  }
  100% {
      opacity: 1;
  }
}
</style>
