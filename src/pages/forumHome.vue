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
}

.forum-layout {
  display: flex;
}

.forum-content {
  flex-grow: 1;
  padding: 20px;
  border-radius: 8px;
  margin-left: 280px;
  transition: margin-left 0.3s ease-in-out;
  display: flex;
  justify-content: center;
}

.forum-cards-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px; /* Adjust max-width to fit your design */
}

.forum-card-wrapper {
  width: 100%;
  margin-bottom: 20px; /* Add space between cards */
}

@media (max-width: 768px) {
  .forum-content {
    margin-left: 90px;
    padding: 10px;
  }
}
</style>
