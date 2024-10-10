<script setup>
import NavBar from "../components/navBar.vue";
import GoogleMapsLoader from 'google-maps';
</script>

<template>
	<NavBar />
    <div>
      <h1>Emergency Page</h1>
      <p>Emergency services here</p>
    </div>

    <div id="map">

    </div>
</template>
  
<script>
  /*
  export default {
    name: 'emergencyPage',
    mounted: function() {
      GoogleMapsLoader.load(function(google) {
        let map = new google.maps.Map(document.getElementById('map'), {
          zoom: 4,
          center: {lat: 1.297538, lng: 103.849558}
        })
      }) 
    }
  };
  */
</script> 
<!--
<style scoped>
  #map {
    width: 50%;
  }
</style>
-->