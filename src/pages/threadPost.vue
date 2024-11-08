<template>
  <navBar/>
  <ForumSidebar/>
  <div class="post-thread-container container">
    <div class="post-content p-4 rounded shadow-sm">
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
import navBar from '../components/navBar.vue';
import ForumSidebar from '../components/ForumSidebar.vue';
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { db, doc, getDoc, auth } from '../firebaseConfig.js';
import CommentSection from '../components/Comments.vue';

const route = useRoute();
const postId = route.params.id;

const post = ref({ title: '', desc: '', author: '', media: [], date: '', likes: 1 });

const formattedDate = computed(() => {
  const date = post.value.date ? new Date(post.value.date.seconds * 1000) : null;
  return date ? date.toLocaleDateString() : '';
});

const fetchPost = async () => {
  const docRef = doc(db, 'forum', postId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    post.value = docSnap.data();
  } else {
    console.error('Post not found!');
  }
};

const likePost = () => {
  post.value.likes += 1;
};

const bookmarkPost = () => {
  // Logic for bookmarking
};

const updateHistory = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.error('User is not logged in');
    return;
  }

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const history = userDoc.data().recentlyViewed || [];
    const updatedHistory = [postId, ...history].slice(0, 10);
    await userRef.update({ recentlyViewed: updatedHistory });
  } else {
    console.error('User document not found');
  }
};

onMounted(() => {
  fetchPost();
  updateHistory();
});
</script>

<style scoped>
.post-thread-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.post-content {
  background-color: #D9C5B2;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
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
  color: #FF9689;
}

.post-actions .btn-outline-primary:hover {
  background-color: #FF9689;
  color: #fff;
}

.post-actions .btn-outline-secondary {
  border-color: #FF9689;
  color: #FF9689;
}

.post-actions .btn-outline-secondary:hover {
  background-color: #FF9689;
  color: #fff;
}
</style>
