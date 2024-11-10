<template>
  <div>
    <!-- Toggle Button -->
    <button @click="toggleSidebar" class="toggle-sidebar-btn">
      {{ isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar' }}
    </button>

    <!-- Right Sidebar (conditionally rendered) -->
    <div v-if="isSidebarVisible" class="right-sidebar">
      <!-- Popular Topics -->
      <div class="widget popular-topics">
        <h3>Popular Topics</h3>
        <ul>
          <li><a href="#">How to Start with Vue.js</a></li>
          <li><a href="#">Firebase Authentication Tips</a></li>
          <li><a href="#">Top 10 CSS Tricks</a></li>
          <li><a href="#">Using Composition API</a></li>
          <li><a href="#">Web Development Roadmap 2024</a></li>
        </ul>
      </div>

      <!-- Top Contributors -->
      <div class="widget top-contributors">
        <h3>Top Contributors</h3>
        <ul>
          <li><a href="#">@JohnDoe</a> - 120 Posts</li>
          <li><a href="#">@JaneSmith</a> - 95 Posts</li>
          <li><a href="#">@DevGuru</a> - 80 Posts</li>
          <li><a href="#">@Coder123</a> - 75 Posts</li>
        </ul>
      </div>

      <!-- Suggested Tags -->
      <div class="widget suggested-tags">
        <h3>Suggested Tags</h3>
        <div class="tags">
          <a href="#" class="tag">#VueJS</a>
          <a href="#" class="tag">#Firebase</a>
          <a href="#" class="tag">#JavaScript</a>
          <a href="#" class="tag">#CSS</a>
          <a href="#" class="tag">#HTML</a>
          <a href="#" class="tag">#WebDev</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isSidebarVisible = ref(true);

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
};
</script>

<style scoped>
/* Button to toggle sidebar visibility */
.toggle-sidebar-btn {
  position: fixed;
  top: 75px;
  right: 0px;
  padding: 10px 15px;
  background-color: #FF9689;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  z-index: 1001; /* Ensure the button is on top */
}

.toggle-sidebar-btn:hover {
  background-color: #FF6E61;
}

/* Right Sidebar styling */
.right-sidebar {
  width: 250px;
  background-color: #EED4D4;
  color: #333;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: fixed;
  right: 10px;
  top: 75px;
  height: calc(100% - 85px);
  overflow-y: auto;
}

/* Widget styling */
.widget {
  margin-bottom: 20px;
}

.widget h3 {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 15px;
  color: #5A3A2D;
}

.widget ul {
  list-style: none;
  padding: 0;
}

.widget ul li {
  margin-bottom: 10px;
  font-size: 0.9em;
  color: #5A3A2D;
}

.widget ul li a {
  text-decoration: none;
  color: #5A3A2D;
}

.widget ul li a:hover {
  color: #FF9689;
}

/* Tags styling */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  background-color: #B89C89;
  color: #FFF;
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 0.8em;
  text-decoration: none;
}

.tag:hover {
  background-color: #FF9689;
  color: white;
}

/* Scrollbar styling */
.right-sidebar::-webkit-scrollbar {
  width: 8px;
}

.right-sidebar::-webkit-scrollbar-thumb {
  background-color: #B89C89;
  border-radius: 4px;
}

.right-sidebar::-webkit-scrollbar-track {
  background-color: #D9C5B2;
}
</style>
