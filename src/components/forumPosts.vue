<template>
    <div class="posts">
      <h2>All Posts</h2>
      <div v-if="loading" class="loading">Loading posts...</div>
      <div v-else-if="posts.length === 0" class="no-posts">No posts found.</div>
      <div v-else class="post" v-for="post in posts" :key="post.id">
        <h3>{{ post.title }}</h3>
        <p>{{ post.content }}</p>
        <small>Posted on: {{ post.date }}</small>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { db } from '../firebaseConfig'; // Adjust the import path as needed
  import { collection, getDocs } from 'firebase/firestore';
  
  const posts = ref([]);
  const loading = ref(true);
  
  // Fetch posts from the Firestore collection "forum"
  const fetchPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'forum'));
      posts.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching posts:', error);
      alert('Failed to load posts.');
    } finally {
      loading.value = false;
    }
  };
  
  // Fetch the posts when the component is mounted
  onMounted(() => {
    fetchPosts();
  });
  </script>
  
  <style scoped>
  .posts {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background-color: #FBF4EB;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    margin-bottom: 20px;
    color: #FF9689;
  }
  
  .post {
    margin-bottom: 20px;
    padding: 15px;
    border-bottom: 1px solid #EED4D4;
  }
  
  .post h3 {
    margin: 0 0 10px;
    color: #213547;
  }
  
  .post p {
    margin: 0 0 10px;
    color: #242424;
  }
  
  .post small {
    display: block;
    margin-top: 5px;
    color: #8392a5;
  }
  
  .loading,
  .no-posts {
    text-align: center;
    color: #8392a5;
  }
  </style>