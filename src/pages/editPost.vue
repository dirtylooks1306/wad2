<template>
    <div class="edit-thread-container">
      <h2>Edit Thread</h2>
      <form @submit.prevent="updateThread">
        <div class="form-group">
          <label for="title">Title</label>
          <input
            type="text"
            id="title"
            v-model="thread.title"
            required
            placeholder="Enter the title"
          />
        </div>
        <div class="form-group">
          <label for="content">Content</label>
          <textarea
            id="content"
            v-model="thread.content"
            required
            placeholder="Edit your post content here"
          ></textarea>
        </div>
        <button type="submit" class="submit-button">Update Thread</button>
      </form>
      <p v-if="updateMessage" class="update-message">{{ updateMessage }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  
  const route = useRoute();
  const router = useRouter();
  const threadId = route.params.id;
  
  const thread = ref({
    id: threadId,
    title: '',
    content: ''
  });
  const updateMessage = ref('');
  const loading = ref(true);
  
  // Mock function to load thread data (replace with API call)
  const fetchThread = async () => {
    // Simulate API call with delay
    setTimeout(() => {
      // Replace with data from your API
      thread.value = {
        id: threadId,
        title: 'Sample Thread Title',
        content: 'This is the existing content of the thread that you can edit.'
      };
      loading.value = false;
    }, 1000);
  };
  
  // Function to handle thread update submission
  const updateThread = () => {
    if (!thread.value.title || !thread.value.content) {
      updateMessage.value = 'Title and content are required!';
      return;
    }
  
    // Simulate thread update (replace with actual API call)
    console.log('Thread updated:', thread.value);
    updateMessage.value = 'Your thread has been updated successfully!';
  
    // Redirect to the thread page after update
    setTimeout(() => {
      updateMessage.value = '';
      router.push(`/forum/thread/${threadId}`);
    }, 2000);
  };
  
  // Load the thread data when the component is mounted
  onMounted(() => {
    fetchThread();
  });
  </script>
  
  <style scoped>
  .edit-thread-container {
    max-width: 700px;
    margin: 30px auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  
  h2 {
    text-align: center;
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
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
  }
  
  textarea {
    min-height: 150px;
  }
  
  .submit-button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  
  .submit-button:hover {
    background-color: #0056b3;
  }
  
  .update-message {
    text-align: center;
    color: #28a745;
    margin-top: 15px;
  }
  </style>