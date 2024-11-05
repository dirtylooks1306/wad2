<template>
  <div class="post-card">
  <!-- <div class="post-card" @click="navigateToPost"> -->
    <div class="post-header">
      <img :src="post.profileimage" alt="Author profile" class="profile-image" />
      <div class="author-details">
        <p class="author-name">{{ post.author }}</p>
        <p class="post-time">{{ timeElapsed(post.date) }}</p>
      </div>
    </div>

    <p class="post-title">{{ post.title }}</p>

    <div
      v-if="post.media && post.media.length > 0"
      class="carousel-container"
      @click.stop="openFullScreen"
    >
      <!-- Carousel -->
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
    </div>

    <p v-else class="post-desc">{{ truncateDesc(post.desc, 400) }}</p>

    <!-- Modal for Full-Screen Image Browsing -->
    <div v-if="showModal" class="modal" @click.self="closeFullScreen">
      <div class="modal-content">
        <button class="close-button" @click="closeFullScreen">✕</button>
        <div id="modalCarousel" class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-inner">
            <div v-for="(image, index) in post.media" :key="index" :class="['carousel-item', { active: index === 0 }]">
              <img :src="image" class="d-block w-100 modal-image" :alt="'Image ' + (index + 1)" />
            </div>
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#modalCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#modalCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
          </button>
        </div>
      </div>
    </div>

    <div class="interactiveBar">
      <span class="like-count"><button @click="likePost"><i class="fa-solid fa-thumbs-up"></i></button>{{ post.likes }}<button @click="dislikePost"><i class="fa-solid fa-thumbs-down"></i></button></span>
    </div>

  </div>

</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const showModal = ref(false);

// Function to navigate to the individual forum post
const navigateToPost = () => {
  router.push(`/forum/thread/${props.post.id}`);
};

// Function to open the full-screen image modal
const openFullScreen = () => {
  showModal.value = true;
};

// Function to close the full-screen image modal
const closeFullScreen = () => {
  showModal.value = false;
};

// Function to calculate time elapsed since the post date
const timeElapsed = (date) => {
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

// Function to truncate the description to a specific length
const truncateDesc = (text, maxLength) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + '...';
  }
  return text;
};

const likePost = () => {
  // Implement like functionality (gets document from forum collection in firebase with post.id, increments likes by 1)

};

const dislikePost = () => {
  // Implement dislike functionality (gets document from forum collection in firebase wit)
};
</script>

<style scoped>
.interactiveBar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}
.post-card {
  max-width: 600px; /* Set a maximum width for the card */
  margin: 15px auto; /* Center the card horizontally */
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #D9C5B2;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  cursor: pointer;
}

.carousel-container {
  max-height: 400px; /* Limit the height of the carousel */
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
}

.modal-content {
  max-width: 90%; /* Limit the modal content to 90% of the viewport width */
  max-height: 90%; /* Limit the modal content to 90% of the viewport height */
}

.modal-image {
  object-fit: contain;
  width: 100%;
  height: auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .post-card {
    max-width: 90%; /* Reduce the max width for smaller screens */
  }

  .carousel-container {
    max-height: 250px; /* Reduce the max height of the carousel on smaller screens */
  }

  .modal-content {
    max-width: 100%;
    max-height: 100%;
  }
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
  margin-bottom: 10px;
  color: #333;
}

.carousel-item img {
  object-fit: contain;
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  max-width: 80%; /* Limit the modal content width to 80% of the viewport */
  max-height: 80%; /* Limit the modal content height to 80% of the viewport */
  background-color: black;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.modal-image {
  object-fit: contain; /* Ensure the image fits within its container */
  width: 100%; /* Take up the full width of the modal content */
  max-height: 70vh; /* Set a maximum height relative to the viewport */
  border-radius: 8px;
}

/* Adjust modal close button for better visibility */
.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: #000;
  font-size: 24px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 90%; /* Make modal content slightly larger on smaller screens */
    max-height: 90%; /* Adjust modal content height */
  }

  .modal-image {
    max-height: 60vh; /* Reduce image height for smaller screens */
  }
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
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
</style>