<template>
    <div class="thread-post-container">
      <h2>{{ thread.title }}</h2>
      <div class="thread-details">
        <p class="thread-desc">{{ thread.desc }}</p>
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

    <CommentSection :postId="postId" />
  </div>
</template>

<script setup>
import NavBar from "../components/navBar.vue";
import ForumSidebar from '../components/forumsideBar.vue';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db, doc, getDoc, auth, updateDoc  } from '../firebaseConfig.js';
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
    // Add postId into recentlyViewed array if it's not already there. Ensure that the array is not more than 10 items.
    if (userDoc.data().recentlyViewed) {
      let recentlyViewed = [...userDoc.data().recentlyViewed]; // Make a copy of the array
      if (!recentlyViewed.includes(postId)) {
        // Limit array to 10 items
        if (recentlyViewed.length >= 10) {
          recentlyViewed.pop(); // Remove the oldest item
        }
        recentlyViewed.unshift(postId); // Add new item to the front
        await updateDoc(userDocRef, { recentlyViewed }); // Update Firestore
      }
    } else {
      await updateDoc(userDocRef, { recentlyViewed: [postId] }); // Initialize recentlyViewed array
    }

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
