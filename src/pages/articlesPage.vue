<script setup>
import NavBar from "../components/navBar.vue";
</script>

<template>
	<NavBar />
    <div>
      <h1>{{ capitalizeCategory(category) }} Articles</h1>
      <div v-if="category === 'new'">
        <!-- Display new articles here -->
        <p>Showing new articles...</p>
      </div>
      <div v-else-if="category === 'activities'">
        <!-- Display activities articles here -->
        <p>Showing activities articles...</p>
      </div>
      <div v-else-if="category === 'education'">
        <!-- Display education articles here -->
        <p>Showing education articles...</p>
      </div>
      <div v-else-if="category === 'nutrition'">
        <!-- Display nutrition articles here -->
        <p>Showing nutrition articles...</p>
      </div>
      <div v-else-if="category === 'recent'">
        <!-- Display most recently visited articles here -->
        <p>Showing most recently visited articles...</p>
      </div>
      <div v-else>
        <p>Please select an article category.</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'articlesPage',
    props: ['category'],
    methods: {
      capitalizeCategory(cat) {
        return cat.charAt(0).toUpperCase() + cat.slice(1);
      },
    },
  };
  </script>
  