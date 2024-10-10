<script setup>
import NavBar from "../components/navBar.vue";
</script>

<template>
	<NavBar />
    <div>
      <h1>{{ category ? capitalizeCategory(category) : 'All Articles' }}</h1>
      <!-- Content rendering based on category -->
      <div v-if="category === 'new'">
        <!-- Display New articles -->
      </div>
      <div v-else-if="category === 'activities'">
        <!-- Display Activities articles -->
      </div>
      <div v-else-if="category === 'education'">
        <!-- Display Education articles -->
      </div>
      <div v-else-if="category === 'nutrition'">
        <!-- Display Nutrition articles -->
      </div>
      <div v-else-if="category === 'recent'">
        <!-- Display Recently visited articles -->
      </div>
      <div v-else>
        <!-- Display default content or all articles -->
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'articlesPage',
    props: ['category'],
    computed: {
      category() {
        return this.$route.query.category || null;
      },
    },
    methods: {
      capitalizeCategory(cat) {
        return cat.charAt(0).toUpperCase() + cat.slice(1);
      },
    },
  };
  </script>
  