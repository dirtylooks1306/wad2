<template>
    <div class="user-profile-container">
      <h2>User Profile: {{ user.username }}</h2>
      <div class="user-info">
        <img :src="user.avatar" alt="User Avatar" class="user-avatar" />
        <div class="user-details">
          <p><strong>Name:</strong> {{ user.name }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Bio:</strong> {{ user.bio }}</p>
        </div>
      </div>
  
      <h3>Recent Posts</h3>
      <div v-if="loading" class="loading-message">Loading posts...</div>
      <div v-else-if="userPosts.length === 0" class="no-posts-message">This user has not posted anything yet.</div>
      <div v-else class="post-list">
        <div v-for="post in userPosts" :key="post.id" class="post-card">
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt }}</p>
          <router-link :to="`/forum/thread/${post.id}`" class="read-more">Read More</router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  
  const route = useRoute();
  const userId = route.params.username; // Use `username` or `id` depending on your route setup
  
  const user = ref({
    username: 'johndoe',
    name: 'John Doe',
    email: 'johndoe@example.com',
    bio: 'A passionate forum contributor.',
    avatar: 'https://via.placeholder.com/150'
  });
  
  const userPosts = ref([]);
  const loading = ref(true);
  
  // Mock data-fetching function (replace with actual API call)
  const fetchUserPosts = async () => {
    // Simulate an API call with a delay
    setTimeout(() => {
      userPosts.value = [
        { id: 1, title: 'Understanding Vue 3 Composition API', excerpt: 'A guide to help you master the Composition API in Vue 3...' },
        { id: 2, title: 'Tips for Effective JavaScript Debugging', excerpt: 'Learn how to debug your JavaScript code efficiently...' }
      ];
      loading.value = false;
    }, 1000);
  };
  
  // Fetch user posts when the component is mounted
  onMounted(() => {
    fetchUserPosts();
  });
  </script>
  
  <style scoped>
  .user-profile-container {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
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
    border: 2px solid #ddd;
  }
  
  .user-details {
    display: flex;
    flex-direction: column;
  }
  
  .loading-message,
  .no-posts-message {
    text-align: center;
    font-size: 18px;
    color: #555;
  }
  
  .post-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .post-card {
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background-color: #fff;
  }
  
  .post-card h4 {
    margin: 0 0 10px;
  }
  
  .post-card p {
    margin: 0 0 15px;
    color: #666;
  }
  
  .read-more {
    color: #007bff;
    text-decoration: none;
    font-weight: bold;
  }
  
  .read-more:hover {
    text-decoration: underline;
  }
  </style>