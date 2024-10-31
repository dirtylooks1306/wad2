<script setup>
import NavBar from "../components/navBar.vue";
import CalendarComponent from "../components/Calendar.vue";
import CustomHeader from "../components/CustomHeader.vue";
import VaccineCheckList from "../components/VaccineCheckList.vue";
</script>

<template>
	<NavBar />
    <div class="row">
      <div class="col-md-4 col-12">
        <VaccineCheckList/>
      </div>
      <div class="col-md-8 col-12 calender">
        <CustomHeader header="Vaccine Tracker" />
        <div class="calender-size pb-2">
          <CalendarComponent/>
        </div>
      </div>
    </div>

  </template>

<style scoped>

.calender {
  background-color: rgba(173, 183, 146, 0.337);
}

.calender-size {
  width: 100%;
  height: 100%;
}
</style>