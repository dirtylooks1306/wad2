<script setup>
import NavBar from "../components/navBar.vue";
//import GoogleMapsLoader from 'google-maps';
</script>

<template>
	<NavBar />
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <img src="../assets/AnE.jpg" class="img-fluid" id="background-image" alt=""> 
        <h5 class="img-overlay-center position-absolute">Emergency Resources</h5> 
      </div>
    </div>
  </div>
  <div class="map-block">
    <h1>hi</h1>
  </div>
  <div>
    <h1>bye</h1>
  </div>

</template>
  
<script>
  export default {
    name: 'emergencyPage',
  /*mounted: function() {
      GoogleMapsLoader.load(function(google) {
        let map = new google.maps.Map(document.getElementById('map'), {
          zoom: 4,
          center: {lat: 1.297538, lng: 103.849558}
        })
      }) 
    }
  */
  };
</script> 

<style scoped>
  #background-image {
    object-fit: cover;
    width: 100%;
    height: 400px;
  }
  
  .img-overlay-center {
    /*text-align: center;*/
    top: 50%;
    left: 50%;
    color: #ff9689;
	  font-family: "Cherry Bomb", sans-serif;
    font-size: 40px;
  }

  .map-block {
    background-color: #eed4d4;
  }
</style>
