<template>
  <NavBar />
  <ForumSidebar />
  <div class="user-profile-container" v-if="!error">
    <div class="user-info">
      <img :src="user.profileimage" alt="User Avatar" class="user-avatar" />
      <div class="user-details">
        <h2>{{ user.username }}</h2>
        <p><strong>Bio:</strong> {{ user.bio || 'Too busy taking care of my child. No time to write a bio!' }}</p>
        <p>Posts: {{ userPosts.length }} | Likes: {{ totalLikes }} | Saves: {{ totalSaves }}</p>
      </div>
    </div>

    <h3>Recent Posts</h3>
    <div v-if="loading" class="loading-message">Loading posts...</div>
    <div v-else-if="userPosts.length === 0" class="no-posts-message">This user has not posted anything yet.</div>
    <div v-else class="post-list">
      <forumCard v-for="post in userPosts" :key="post.id" :post="post"/>
    </div>
  </div>
  
  <!-- Display "User not found" if there is an error -->
  <div v-else class="error-message">
    <p>User not found</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ForumSidebar from '../components/forumsideBar.vue';
import NavBar from "../components/navBar.vue";
import ForumCard from '../components/forumCard.vue';
import { db, collection, query, where, getDocs } from '../firebaseConfig.js';

const route = useRoute();
const username = route.params.username;

const user = ref({
  username: '',
  bio: '',
  profileimage: '',
});

const userPosts = ref([]);
const loading = ref(true);
const error = ref(null);
const totalLikes = ref(0);
const totalSaves = ref(0);

const fetchUserData = async () => {
  try {
    console.log("Fetching user data for:", username);

    // Retrieve the user data from the 'users' collection where 'username' matches the route parameter
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      user.value = querySnapshot.docs[0].data();
      console.log("User data found:", user.value);
    } else {
      error.value = 'User not found';
      console.error("User not found for username:", username);
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
    error.value = 'Failed to fetch user data';
  }
};

const fetchUserPosts = async () => {
  try {
    console.log("Fetching posts for author:", username);

    // Retrieve posts from the 'forum' collection where 'author' matches the username
    const q = query(collection(db, 'forum'), where('author', '==', username));
    const querySnapshot = await getDocs(q);

    userPosts.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
    // Calculate total likes and saves
    totalLikes.value = userPosts.value.reduce((sum, post) => sum + (post.likes || 0), 0);
    totalSaves.value = userPosts.value.reduce((sum, post) => sum + (post.saves || 0), 0);

    console.log("Total likes:", totalLikes.value, "Total saves:", totalSaves.value);
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
  if (!error.value) {
    await fetchUserPosts();
  }
});
</script>

<style scoped>
.user-profile-container {
  max-width: min(calc(100% - 75px), 800px);
  margin: 20px auto;
  padding: 25px;
  background-color: white; /* Soft pastel background */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Media query for smaller screens */
@media (max-width: 768px) {
  .user-profile-container {
    padding: 0px;
    padding-bottom: 5px;
    margin-left: 75px;
  }
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
  border: 3px solid white; /* Use theme color for border */
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

.error-message {
  text-align: center;
  font-size: 18px;
  color: #FF6E61;
  margin-top: 20px;
}

.user-details strong {
  color: #FF6E61;
}
</style>
