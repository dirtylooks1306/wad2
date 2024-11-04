<template>
    <div class="thread-post-container">
      <h2>{{ thread.title }}</h2>
      <div class="thread-details">
        <p class="thread-content">{{ thread.content }}</p>
        <p class="thread-meta">Posted by {{ thread.author }} on {{ thread.date }}</p>
      </div>
  
      <h3>Comments</h3>
      <div v-if="loading" class="loading-message">Loading comments...</div>
      <div v-else-if="comments.length === 0" class="no-comments-message">No comments yet. Be the first to comment!</div>
      <div v-else class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-card">
          <p><strong>{{ comment.author }}</strong>:</p>
          <p>{{ comment.text }}</p>
          <p class="comment-meta">{{ comment.date }}</p>
        </div>
      </div>
  
      <div class="add-comment">
        <h4>Add a Comment</h4>
        <form @submit.prevent="submitComment">
          <textarea
            v-model="newComment"
            placeholder="Write your comment here"
            required
          ></textarea>
          <button type="submit" class="submit-button">Submit Comment</button>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  
  const route = useRoute();
  const threadId = route.params.id;
  
  const thread = ref({
    id: threadId,
    title: 'Sample Thread Title',
    content: 'This is the main content of the thread. It provides details and invites discussion.',
    author: 'John Doe',
    date: '2024-11-05'
  });
  
  const comments = ref([]);
  const newComment = ref('');
  const loading = ref(true);
  
  // Mock data-fetching function (replace with actual API call)
  const fetchComments = async () => {
    setTimeout(() => {
      comments.value = [
        { id: 1, author: 'Jane Smith', text: 'This is a very insightful post!', date: '2024-11-04' },
        { id: 2, author: 'Alex Johnson', text: 'I completely agree with the points made here.', date: '2024-11-05' }
      ];
      loading.value = false;
    }, 1000);
  };
  
  // Fetch comments when the component is mounted
  onMounted(() => {
    fetchComments();
  });
  
  // Function to handle comment submission
  const submitComment = () => {
    if (!newComment.value.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
  
    // Simulate adding a new comment (replace with API call)
    comments.value.push({
      id: comments.value.length + 1,
      author: 'Current User',
      text: newComment.value,
      date: new Date().toISOString().split('T')[0]
    });
  
    newComment.value = ''; // Clear the input after submission
  };
  </script>
  
  <style scoped>
  .thread-post-container {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  
  .thread-details {
    margin-bottom: 20px;
  }
  
  .thread-meta {
    font-size: 14px;
    color: #666;
  }
  
  h3 {
    margin-top: 30px;
  }
  
  .loading-message,
  .no-comments-message {
    text-align: center;
    font-size: 18px;
    color: #555;
  }
  
  .comments-list {
    margin-bottom: 20px;
  }
  
  .comment-card {
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }
  
  .comment-meta {
    font-size: 12px;
    color: #777;
    margin-top: 5px;
  }
  
  .add-comment {
    margin-top: 20px;
  }
  
  textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
    min-height: 100px;
  }
  
  .submit-button {
    padding: 10px;
    background-color: #28a745;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 10px;
  }
  
  .submit-button:hover {
    background-color: #218838;
  }
  </style>