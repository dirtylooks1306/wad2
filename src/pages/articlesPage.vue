<script setup>
import { computed } from 'vue';
import NavBar from "../components/navBar.vue";
import { useRoute } from 'vue-router';

const route = useRoute();

// Extract the category from the route parameters (or props)
const category = computed(() => route.params.category || '');

// Function to capitalize the category name
const capitalizeCategory = (cat) => {
  if (!cat) return '';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};
</script>

<template>
  <NavBar />
  <div class="articles-container">
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

<style scoped>
.articles-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

p {
  font-size: 16px;
  margin-bottom: 10px;
}
</style>