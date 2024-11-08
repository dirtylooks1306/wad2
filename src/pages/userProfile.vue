<template>
  <NavBar />
  <ForumSidebar />
  <div class="user-profile-container">
    <div class="user-info">
      <img :src="user.profileimage" alt="User Avatar" class="user-avatar" />
      <div class="user-details">
        <h2>{{ user.username }}</h2>
        <p><strong>Bio:</strong> {{ user.bio }}</p>
        <p>Posts: {{ userPosts.length }}</p>
      </div>
    </div>

    <h3>Recent Posts</h3>
    <div v-if="loading" class="loading-message">Loading posts...</div>
    <div v-else-if="userPosts.length === 0" class="no-posts-message">This user has not posted anything yet.</div>
    <div v-else class="post-list">
      <div v-for="post in userPosts" :key="post.id" class="post-card">
        <h4>{{ post.title }}</h4>
        <p>{{ post.desc }}</p>
        <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
          <div v-for="(image, index) in post.media" :key="index" :class="['carousel-item', { active: index === 0 }]">
            <img :src="image" class="d-block w-100 carousel-image" :alt="'Image ' + (index + 1)" />
          </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
        <router-link :to="`/forum/thread/${post.id}`" class="read-more">Read More</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ForumSidebar from '../components/ForumSidebar.vue';
import NavBar from '../components/NavBar.vue';
import { db, collection, query, where, getDocs } from '../firebaseConfig.js';

const route = useRoute();
const username = route.params.username;

const user = ref({
  username: '',
  bio: '',
  profileimage: ''
});

const userPosts = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchUserData = async () => {
  try {
    // Retrieve the user data from the 'users' collection where 'username' matches the route parameter
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      user.value = querySnapshot.docs[0].data(); // Get the first matching document
    } else {
      error.value = 'User not found';
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
    error.value = 'Failed to fetch user data';
  }
};

const fetchUserPosts = async () => {
  try {
    // Retrieve posts from the 'forum' collection where 'author' matches the username
    const q = query(collection(db, 'forum'), where('author', '==', username));
    const querySnapshot = await getDocs(q);

    userPosts.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error fetching user posts:", err);
    error.value = 'Failed to fetch user posts';
  } finally {
    loading.value = false;
  }
};

// Fetch data when the component is mounted
onMounted(async () => {
  await fetchUserData();
  await fetchUserPosts();
});
</script>

<style scoped>
.user-profile-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 25px;
  background-color: #D9C5B2; /* Soft pastel background */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2, h3 {
  color: #FF6E61; /* Match theme colors for headings */
  font-weight: bold;
}

.user-info {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.user-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 3px solid #FF9689; /* Use theme color for border */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.user-details p {
  margin: 5px 0;
  color: #555;
}

.loading-message,
.no-posts-message {
  text-align: center;
  font-size: 18px;
  color: #FF6E61; /* Theme color for messages */
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  padding: 15px;
  border: 1px solid #FF9689; /* Border matching theme */
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-card h4 {
  color: #FF6E61;
  margin: 0 0 10px;
}

.post-card p {
  margin: 0 0 15px;
  color: #666;
}

.read-more {
  color: #FF6E61;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s;
}

.read-more:hover {
  color: #FF9689;
}

.user-details strong {
  color: #FF6E61;
}
</style>
