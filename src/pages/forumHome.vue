<template>
  <NavBar />
  <ForumSidebar />
  <div class="forum-home-container">
    <div class="forum-layout">
      <div class="forum-content">
        <div v-for="forumPost in forumPosts" :key="forumPost.id">
          <ForumCard :post="forumPost" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { db, collection, getDocs, query, where } from '../firebaseConfig.js'; // Ensure you import your Firebase config
import NavBar from '../components/NavBar.vue';
import ForumSidebar from '../components/ForumSidebar.vue';
import ForumCard from '../components/forumCard.vue';

const route = useRoute();
const forumPosts = ref([]);

// Function to query posts from Firebase based on category
const fetchPostsByCategory = async (category) => {
  try {
    const forumCollection = collection(db, 'forum');
    // const q = query(forumCollection, where('category', '==', category));
    // const querySnapshot = await getDocs(q);
    const querySnapshot = await getDocs(forumCollection);

    // Transform Firebase documents into post objects
    forumPosts.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
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
  // Initial check if the page loads without a route change
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
  margin-left: 280px; /* Default margin */
  transition: margin-left 0.3s ease-in-out; /* Smooth transition */
}

@media (max-width: 768px) {
  .forum-content {
    margin-left: 90px; /* Reduced margin for smaller screens */
    padding: 10px;
  }
}
</style>