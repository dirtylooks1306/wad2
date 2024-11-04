<template>
  <div class="create-post-container">
    <h2>Create a New Post</h2>
    <form @submit.prevent="submitPost">
      <div class="form-group">
        <label for="title">Title</label>
        <input
          type="text"
          id="title"
          v-model="post.title"
          required
          placeholder="Enter the post title"
        />
      </div>
      <div class="form-group">
        <label for="content">Content</label>
        <textarea
          id="content"
          v-model="post.content"
          required
          placeholder="Write your content here"
        ></textarea>
      </div>
      <div class="form-group">
        <label for="tags">Tags</label>
        <input
          type="text"
          id="tags"
          v-model="post.tags"
          placeholder="Enter tags separated by commas"
        />
      </div>
      <button type="submit" class="submit-button">Submit Post</button>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Reactive post object for form data
const post = reactive({
  title: '',
  content: '',
  tags: ''
});

// Function to handle form submission
const submitPost = () => {
  // Basic validation (you can enhance this with more checks)
  if (!post.title || !post.content) {
    alert('Title and content are required!');
    return;
  }

  // Mock submission (replace this with an actual API call or logic)
  console.log('Post submitted:', post);

  // Reset the form after submission
  post.title = '';
  post.content = '';
  post.tags = '';

  // Redirect to the main forum page or any other desired route
  router.push('/forum');
};
</script>

<style scoped>
.create-post-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
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
  min-height: 100px;
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
</style>