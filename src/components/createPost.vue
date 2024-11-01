<template>
    <div class="create-post">
      <h2>Create a New Post</h2>
      <form @submit.prevent="submitPost">
        <div class="form-group">
          <label for="title">Title:</label>
          <input v-model="title" type="text" id="title" placeholder="Enter post title" required />
        </div>
  
        <div class="form-group">
          <label for="content">Content:</label>
          <textarea v-model="content" id="content" placeholder="Write your content here..." required></textarea>
        </div>
  
        <button type="submit">Submit</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  // Create reactive variables for form data
  const title = ref('');
  const content = ref('');
  
  // Function to handle post submission
  const submitPost = () => {
    if (title.value && content.value) {
      const newPost = {
        title: title.value,
        content: content.value,
        date: new Date().toLocaleString()
      };
  
      // Simulate sending the new post to an API or updating state
      console.log('New post created:', newPost);
  
      // Reset form fields
      title.value = '';
      content.value = '';
  
      alert('Post created successfully!');
    } else {
      alert('Please fill in all fields before submitting.');
    }
  };
  </script>
  
  <style scoped>
  .create-post {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #FBF4EB;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .create-post h2 {
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  input[type="text"],
  textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #EED4D4;
    border-radius: 4px;
    font-size: 14px;
  }
  
  textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  button {
    background-color: #FF9689;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  
  button:hover {
    background-color: #EED4D4;
  }
  </style>
  