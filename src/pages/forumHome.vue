<template>
  <NavBar />
  <ForumSidebar />
  <div class="forum-home-container">
    <div class="forum-layout">
      <div class="forum-content">
        <div class="forum-cards-container">
          <div v-for="forumPost in forumPosts" :key="forumPost.id" class="forum-card-wrapper">
            <ForumCard :post="forumPost" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <ToTop />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { db, collection, getDocs } from '../firebaseConfig.js';
import NavBar from '../components/NavBar.vue';
import ForumSidebar from '../components/ForumSidebar.vue';
import ForumCard from '../components/forumCard.vue';
import ToTop from '../components/ToTop.vue';

const route = useRoute();
const forumPosts = ref([]);

// Function to query posts from Firebase based on category
const fetchPostsByCategory = async (category) => {
  try {
    const forumCollection = collection(db, 'forum');
    const querySnapshot = await getDocs(forumCollection);
    forumPosts.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
};

// Watch the route for changes and fetch posts accordingly
watch(
  () => route.path,
  () => {
    const categories = ['trending', 'new', 'saved', 'recently-viewed'];
    const currentCategory = categories.find(category => route.path.includes(category)) || 'trending';
    fetchPostsByCategory(currentCategory);
  },
  { immediate: true }
);

onMounted(() => {
  const categories = ['trending', 'new', 'saved', 'recently-viewed'];
  const currentCategory = categories.find(category => route.path.includes(category)) || 'trending';
  fetchPostsByCategory(currentCategory);
});
</script>

<style scoped>
.forum-home-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center align everything on small screens */
}

.forum-layout {
  display: flex;
  width: 100%; /* Ensure it takes full width */
  max-width: 1200px; /* Add max-width for larger screens */
  margin: 0 auto; /* Center align the layout on larger screens */
}

.forum-content {
  flex-grow: 1;
  padding: 20px;
  border-radius: 8px;
  max-width: 800px;
}

/* Adjustments for the left sidebar */
.forum-content {
  margin-left: 280px; /* Leave space for left sidebar on larger screens */
}

@media (max-width: 1024px) {
  .forum-content {
    margin-left: 0; /* Remove left margin on medium screens */
  }

  .right-sidebar {
    display: none; /* Hide right sidebar on smaller screens */
  }
}

/* Make adjustments for screens smaller than 767px */
@media (max-width: 767px) {
  .forum-layout {
    flex-direction: column; /* Stack elements vertically */
  }

  /* Hide the left sidebar on smaller screens */
  .ForumSidebar {
    display: none; /* Hide sidebar */
  }

  /* Adjust the main content area for mobile */
  .forum-content {
    margin-left: 0;
    padding: 10px;
    width: 100%; /* Take full width */
  }

  /* Adjust forum cards */
  .forum-cards-container {
    width: 100%;
    padding: 10px;
  }

  /* Stack interactive buttons vertically on mobile */
  .interactiveBar {
    flex-direction: column;
    gap: 5px; /* Reduce gap for mobile */
  }

  .interactive-buttons {
    font-size: 0.9rem; /* Smaller font for mobile */
    padding: 8px 12px; /* Smaller padding for mobile */
    width: 100%; /* Make buttons full width */
    max-width: 200px; /* Limit max width */
  }
}
</style>
