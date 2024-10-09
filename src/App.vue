<script setup>
import HelloWorld from './components/helloWorld.vue'
import test from './components/test.vue'
import HomePage from './pages/homePage.vue';

</script>
<link
href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css"
rel="stylesheet"
integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1hpDhaFf68bxtd"
crossorigin="anonymous"></link>
<link href="style.css" rel="stylesheet"></link>
<template>
  <!-- <HelloWorld msg="Vite + Vue" /> -->
   <HomePage/>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
