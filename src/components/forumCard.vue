<template>
  <div class="post-card" @click="navigateToPost">
    <div class="post-header" @click.stop>
      <img :src="post.profileimage" alt="Author profile" class="profile-image" @click="navigateToProfile"/>
      <div class="author-details">
        <p class="author-name" @click="navigateToProfile">{{ post.author }}</p>
        <p class="post-time">{{ timeElapsed(post.date) }}</p>
      </div>
    </div>

    <p class="post-title">{{ post.title }}</p>

    <div v-if="post.media && post.media.length > 0" class="carousel-container" @click.stop="openFullScreen">
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

    <!-- Interactive Bar with Action Buttons -->
    <div class="post-actions mt-3 d-flex align-items-center">
      <div class="action-buttons d-flex">
        <button @click.stop="likePost" :class="['interactive-buttons me-2', { active: liked }]">
          <i class="fa-solid fa-thumbs-up"></i> &nbsp;{{ post.likes || 0 }}
        </button>
        <button @click.stop="dislikePost" :class="['interactive-buttons me-2', { active: disliked }]">
          <i class="fa-solid fa-thumbs-down "></i> &nbsp;{{ post.dislikes || 0 }}
        </button>
        <button @click.stop="openComments" class="interactive-buttons me-2">
          <i class="fa-solid fa-comments"></i> &nbsp;{{ commentCount || 0 }}
        </button>
      </div>
      
      <!-- Bookmark button on the far right -->
      <button @click.stop="bookmarkPost" id="bookmark" :class="['interactive-buttons', { active: bookmarked }]">
        <i class="fa-solid fa-bookmark"></i>
      </button>
    </div>

    <!-- Comments Section -->
    <div v-if="showComments" class="comments-section">
      <div v-for="(comment, index) in comments" :key="index" class="comment">
        <p><strong>{{ comment.author }}:</strong> {{ comment.text }}</p>
      </div>
      <p v-if="comments.length === 0">No comments yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db, auth, doc, updateDoc, getDoc, arrayRemove, arrayUnion, collection, getDocs } from '../firebaseConfig.js';

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const showModal = ref(false);
const showComments = ref(false);
const comments = ref([]);
const commentCount = ref(0);
const user = ref(auth.currentUser);
const liked = ref(false);
const disliked = ref(false);
const bookmarked = ref(false);

onMounted(async () => {
  await adjustButtons();
  await fetchComments();
});

const fetchComments = async () => {
  try {
    const commentsCollection = collection(db, 'forum', props.post.id, 'comments');
    const commentsSnapshot = await getDocs(commentsCollection);
    
    comments.value = commentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        author: data.username,
        text: data.text || ''
      };
    });
    commentCount.value = comments.value.length;
  } catch (error) {
    console.error("Error fetching comments:", error);
  }
};


const adjustButtons = async () => {
  const userDocRef = doc(db, 'users', user.value.uid);
  const userDoc = await getDoc(userDocRef);
  const userData = userDoc.exists() ? userDoc.data() : {};

  liked.value = userData.liked?.includes(props.post.id) || false;
  disliked.value = userData.disliked?.includes(props.post.id) || false;
  bookmarked.value = userData.savedPosts?.includes(props.post.id) || false;

  if (!props.post.likes) props.post.likes = 0;
  if (!props.post.dislikes) props.post.dislikes = 0;
};

const navigateToPost = () => {
  router.push(`/forum/thread/${props.post.id}`);
};

const navigateToProfile = async () => {
  try {
    router.push(`/forum/user/${props.post.author}`);
  } catch (error) {
    console.error('Error navigating to profile:', error);
  }
};

const openFullScreen = () => {
  showModal.value = true;
};

const closeFullScreen = () => {
  showModal.value = false;
};

const openComments = () => {
  showComments.value = !showComments.value;
};

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

const truncateDesc = (text, maxLength) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + '...';
  }
  return text;
};

const bookmarkPost = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userDocRef = doc(db, 'users', user.uid);

  try {
    bookmarked.value = !bookmarked.value;
    if (bookmarked.value) {
      await updateDoc(userDocRef, {
        savedPosts: arrayUnion(props.post.id)
      });
    } else {
      await updateDoc(userDocRef, {
        savedPosts: arrayRemove(props.post.id)
      });
    }
  } catch (error) {
    console.error("Error updating bookmark status:", error);
  }
};

const likePost = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userDocRef = doc(db, 'users', user.uid);
  const postDocRef = doc(db, 'forum', props.post.id);

  try {
    liked.value = !liked.value;
    if (liked.value) {
      if (disliked.value) {
        disliked.value = false;
        props.post.dislikes -= 1;
        await updateDoc(postDocRef, { dislikes: props.post.dislikes });
      }
      props.post.likes += 1;
      await updateDoc(userDocRef, {
        liked: arrayUnion(props.post.id),
        disliked: arrayRemove(props.post.id),
      });
      await updateDoc(postDocRef, { likes: props.post.likes });
    } else {
      props.post.likes -= 1;
      await updateDoc(userDocRef, {
        liked: arrayRemove(props.post.id),
      });
      await updateDoc(postDocRef, { likes: props.post.likes });
    }
  } catch (error) {
    console.error("Error updating like status:", error);
  }
};

const dislikePost = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userDocRef = doc(db, 'users', user.uid);
  const postDocRef = doc(db, 'forum', props.post.id);

  try {
    disliked.value = !disliked.value;
    if (disliked.value) {
      if (liked.value) {
        liked.value = false;
        props.post.likes -= 1;
        await updateDoc(postDocRef, { likes: props.post.likes });
      }
      props.post.dislikes += 1;
      await updateDoc(userDocRef, {
        disliked: arrayUnion(props.post.id),
        liked: arrayRemove(props.post.id),
      });
      await updateDoc(postDocRef, { dislikes: props.post.dislikes });
    } else {
      props.post.dislikes -= 1;
      await updateDoc(userDocRef, {
        disliked: arrayRemove(props.post.id),
      });
      await updateDoc(postDocRef, { dislikes: props.post.dislikes });
    }
  } catch (error) {
    console.error("Error updating dislike status:", error);
  }
};
</script>

<style scoped>
.post-actions {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Space between left and right sections */
}

.action-buttons {
  display: flex;
  gap: 15px; /* Space between like, dislike, and comment buttons */
}

.interactive-buttons {
  background-color: transparent;
  border: 1px solid #ff6e61;
  color: black;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.interactive-buttons.active {
  background-color: #FF9689;
  color: white;
}

.interactive-buttons:hover {
  background-color: #FF9689;
  color: white;
}

.post-card {
  max-width: 650px;
  margin: 15px auto;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #EED4D4;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  cursor: pointer;
}

.carousel-container {
  max-height: 400px;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
}

.modal-content {
  max-width: 90%;
  max-height: 90%;
}

.modal-image {
  object-fit: contain;
  width: 100%;
  height: auto;
}

@media (max-width: 768px) {
  .post-card {
    max-width: 90%;
  }

  .carousel-container {
    max-height: 250px;
  }

  .modal-content {
    max-width: 100%;
    max-height: 100%;
  }
}
@media (max-width: 460px) {
  .post-actions {
    display: flex;
    flex-direction: row;
    justify-content: space-between; /* Equal spacing between buttons */
    align-items: center;
    width: 100%;
    gap: 0; /* Remove extra gaps between buttons */
  }

  .interactive-buttons {
    flex: 1; /* Makes each button take equal space */
    padding: 8px; /* Compact padding */
    font-size: 0.85rem; /* Adjust font size for mobile */
    text-align: center;
    white-space: nowrap; /* Prevent text wrapping */
    overflow: hidden; /* Hide overflow text */
    text-overflow: ellipsis; /* Truncate text with ellipses */
    max-width: 60px; /* Set max width to keep buttons compact */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* Hide text inside the buttons except the icons */
  .interactive-buttons span {
    display: none; /* Hide any text within the button */
  }

  .interactive-buttons i {
    font-size: 1.2em; /* Make icon slightly larger for better visibility */
    margin: 0; /* Remove margin around icon */
  }

  /* Adjust for the bookmark button specifically */
  .interactive-buttons.bookmark {
    max-width: 40px; /* Make the bookmark button smaller */
    padding: 8px; /* Match padding with other buttons */
  }
  #bookmark{
    width:42.21px;
    margin: 17px;
    padding: 11px 19px;
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
  max-width: 80%;
  max-height: 80%;
  background-color: black;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.modal-image {
  object-fit: contain;
  width: 100%;
  max-height: 70vh;
  border-radius: 8px;
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

@media (max-width: 768px) {
  .modal-content {
    max-width: 90%;
    max-height: 90%;
  }

  .modal-image {
    max-height: 60vh;
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

.comments-section {
  margin-top: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.comment {
  padding: 5px 0;
  border-bottom: 1px solid #ddd;
}
</style>
