<template>
  <navBar />
  <ForumSidebar />
  <div class="post-thread-container container">
    <div class="post-content p-4 rounded shadow-sm position-relative">
      <!-- Edit Button (Visible only to the author) -->
      <button v-if="isAuthor" @click="goToEditPage" class="edit-button position-absolute top-0 end-0 m-2">
        <i class="fa-solid fa-edit"></i> Edit
      </button>
      
      <!-- Author Section -->
      <div class="author-info d-flex align-items-center mb-3">
        <img :src="post.profileimage" alt="Author profile" class="author-avatar" />
        <div class="author-details ms-3">
          <h5 class="author-name mb-0">{{ post.author }}</h5>
          <small class="text-muted">{{ formattedDate }}</small>
        </div>
      </div>

      <!-- Post Content -->
      <h2 class="post-title">{{ post.title }}</h2>
      <p class="post-description">{{ post.desc }}</p>

      <!-- Carousel for Media -->
      <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel" v-if="post.media && post.media.length">
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

      <!-- Post Actions -->
      <div class="post-actions mt-3 d-flex align-items-center">
        <button class="btn btn-outline-primary me-2" @click="likePost">👍 Like ({{ post.likes }})</button>
        <button class="btn btn-outline-secondary" @click="bookmarkPost">🔖 Bookmark</button>
      </div>
    </div>

    <CommentSection :postId="postId" />
  </div>
</template>

<script setup>
import NavBar from "../components/navBar.vue";
import ForumSidebar from '../components/forumsideBar.vue';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db, doc, getDoc, auth } from '../firebaseConfig.js';
import CommentSection from '../components/Comments.vue';

const route = useRoute();
const router = useRouter();
const postId = route.params.id;

const post = ref({ title: '', desc: '', author: '', media: [], date: '', likes: 1 });
const currentUser = ref(null);
const currentUsername = ref('');

// Debugging helper
const logError = (error, location) => {
  console.error(`Error in ${location}:`, error);
};

// Ensure postId is defined before using it in Firestore calls
if (!postId) {
  console.error("postId is not defined in the route.");
}

// Computed property for formatted date
const formattedDate = computed(() => {
  const date = post.value.date ? new Date(post.value.date.seconds * 1000) : null;
  return date ? date.toLocaleDateString() : '';
});

// Fetch the post data
const fetchPost = async () => {
  if (!postId) {
    console.error("postId is undefined or null in fetchPost.");
    return;
  }

  try {
    console.log(`Fetching post with ID: ${postId}`);
    const docRef = doc(db, 'forum', postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      post.value = docSnap.data();
      console.log("Post data:", post.value);
    } else {
      console.error('Post not found!');
    }
  } catch (error) {
    logError(error, "fetchPost");
  }
};

// Load current user information
const loadCurrentUser = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        currentUser.value = user;
        currentUsername.value = userDoc.data().username;
        console.log("Current user data:", currentUser.value);
      } else {
        console.error("User document not found.");
      }
    } catch (error) {
      logError(error, "loadCurrentUser");
    }
  } else {
    console.log("No user is logged in.");
  }
};

// Computed property to check if the current user is the author
const isAuthor = computed(() => {
  return currentUsername.value === post.value.author;
});

// Function to navigate to the edit page
const goToEditPage = () => {
  router.push(`/forum/edit-post/${postId}`);
};

// Lifecycle hook to load the data when the component mounts
onMounted(async () => {
  await loadCurrentUser();
  await fetchPost();
});
</script>

<style scoped>
.post-thread-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.post-content {
  background-color: #EED4D4;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

/* Edit Button */
.edit-button {
  background-color: #FF6E61;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}
.edit-button:hover {
  background-color: #E65B4E;
}

.edit-button i {
  margin-right: 6px;
}

/* Author Section */
.author-info {
  display: flex;
  align-items: center;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #FF9689;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: bold;
  font-size: 18px;
  color: #333;
}

.text-muted {
  color: #666;
  font-size: 14px;
}

/* Carousel */
#carouselExampleIndicators {
  margin-top: 20px;
  max-height: 400px;
}

.carousel-image {
  object-fit: cover;
  max-height: 400px;
  border-radius: 8px;
}

/* Post Title and Description */
.post-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.post-description {
  font-size: 16px;
  color: #555;
  margin: 10px 0;
}

/* Post Actions */
.post-actions button {
  font-size: 14px;
}

.post-actions .btn-outline-primary {
  border-color: #FF9689;
  color: black;
}

.post-actions .btn-outline-primary:hover {
  background-color: #FF9689;
  color: white;
}

.post-actions .btn-outline-secondary {
  border-color: #FF9689;
  color: black;
}

.post-actions .btn-outline-secondary:hover {
  background-color: #FF9689;
  color: #fff;
}
</style>
