<template>
  <div class="post-card">
    <div class="post-header">
      <img :src="post.profileimage" alt="Author profile" class="profile-image" />
      <div class="author-details">
        <p class="author-name">{{ post.author }}</p>
        <p class="post-time">{{ timeElapsed(post.date) }}</p>
      </div>
    </div>

    <p class="post-title">{{ post.title }}</p>

    <!-- Custom Carousel -->
    <div v-if="post.media && post.media.length > 0" class="carousel-container">
      <div class="carousel">
        <div
          v-for="(image, index) in post.media"
          :key="index"
          class="carousel-item"
          :class="{ active: index === activeIndex }"
        >
          <img :src="image" alt="Post media" class="carousel-image" />
        </div>
      </div>
      <div class="carousel-indicators">
        <span
          v-for="(image, index) in post.media"
          :key="index"
          :class="{ 'indicator-active': index === activeIndex }"
          @click="activeIndex = index"
        ></span>
      </div>
    </div>

    <router-link :to="`/forum/thread/${post.id}`" class="read-more">Read More</router-link>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
});

const activeIndex = ref(0);

// Function to calculate time elapsed since the post date
const timeElapsed = (date) => {
  // Check if the date is a Firestore Timestamp and convert it
  const postDate = date.toDate ? date.toDate() : new Date(date);

  if (isNaN(postDate)) {
    console.error('Invalid date format:', date);
    return 'Invalid date';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - postDate) / 1000);

  if (diffInSeconds < 60) {
    return 'Less than a min ago';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
};
</script>

<style scoped>
.post-card {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #D9C5B2; /* Updated background color */
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 1em;
  font-weight: 600;
  margin: 0;
}

.post-time {
  font-size: 0.8em;
  color: #777;
  margin: 0;
}

.post-title {
  margin-bottom: 15px;
  color: #333;
}

.carousel-container {
  position: relative;
  margin-bottom: 15px;
  max-height: 200px;
  overflow: hidden;
  border-radius: 8px;
}

.carousel {
  display: flex;
  overflow: hidden;
  border-radius: 8px;
}

.carousel-item {
  flex: 0 0 100%;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.carousel-item.active {
  opacity: 1;
}

.carousel-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  margin-top: 5px;
}

.carousel-indicators span {
  width: 8px;
  height: 8px;
  margin: 0 3px;
  background-color: #ccc;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s;
}

.carousel-indicators .indicator-active {
  background-color: #007bff;
}

.read-more {
  display: inline-block;
  margin-top: 10px;
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
}

.read-more:hover {
  text-decoration: underline;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .post-card {
    margin-bottom: 10px;
    padding: 10px;
  }

  .profile-image {
    width: 35px;
    height: 35px;
  }

  .author-name {
    font-size: 0.9em;
  }

  .post-time {
    font-size: 0.75em;
  }

  .carousel-container {
    max-height: 150px;
  }

  .carousel-image {
    height: 150px;
  }

  /* Adjust sidebar and main content for smaller screens */
  .forum-layout {
    flex-direction: column;
  }

  .forum-sidebar {
    position: absolute;
    top: 0;
    left: 0;
    width: 250px;
    height: 100%;
    background-color: #D9C5B2;
    z-index: 1000;
    transform: translateX(-250px); /* Hidden by default */
    transition: transform 0.3s ease-in-out;
  }

  .forum-sidebar.active {
    transform: translateX(0); /* Show sidebar */
  }

  .forum-content {
    margin-left: 0;
    padding: 10px;
  }

  .toggle-sidebar-btn {
    display: block;
    background-color: #D9C5B2;
    border: none;
    cursor: pointer;
    margin-bottom: 10px;
    padding: 10px;
    font-size: 1.2em;
  }
}
</style>