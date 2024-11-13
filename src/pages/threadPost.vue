<template>
  <navBar />
  <ForumSidebar />
  <div class="post-thread-container container">
    <div class="post-content p-4 rounded shadow-sm position-relative">
      <button v-if="isAuthor" @click="goToEditPage" class="edit-button position-absolute top-0 end-0 m-2">
        <i class="fa-solid fa-edit"></i> Edit
      </button>
      
      <div class="author-info d-flex align-items-center mb-3">
        <img :src="post.profileimage" alt="Author profile" class="author-avatar" />
        <div class="author-details ms-3">
          <h5 class="author-name mb-0">{{ post.author }}</h5>
          <small class="text-muted">{{ formattedDate }}</small>
        </div>
      </div>

      <h2 class="post-title">{{ post.title }}</h2>
      <p class="post-description">{{ post.desc }}</p>

      <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel" v-if="post.media && post.media.length" @click="openFullScreen">
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

    <!-- Full Screen Modal -->
    <div v-if="showModal" class="modal" @click.stop>
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

      <div class="post-actions mt-3 d-flex align-items-center">
        <div class="action-buttons d-flex">
          <button @click="likePost" :class="['interactive-buttons me-2', { active: liked }]">
            <i class="fa-solid fa-thumbs-up"></i> {{ post.likes || 0 }}
          </button>
          <button @click="dislikePost" :class="['interactive-buttons me-2', { active: disliked }]">
            <i class="fa-solid fa-thumbs-down"></i> {{ post.dislikes || 0 }}
          </button>
          <button @click="toggleComments" class="interactive-buttons me-2">
            <i class="fa-solid fa-comments"></i> {{ comments.length }}
          </button>
        </div>
        
        <button @click="bookmarkPost" :class="['interactive-buttons', { active: bookmarked }]">
          <i class="fa-solid fa-bookmark"></i>
        </button>
      </div>

      <!-- <div v-if="showComments" class="comments-section mt-4">
        <h5>Comments</h5>
        <div v-for="(comment, index) in comments" :key="index" class="comment mb-2">
          <strong>{{ comment.username }}</strong>: {{ comment.text }}
          <div class="btn-container">
          <button class="btn btn-sm btn-primary ms-2">Edit</button>
          <button class="btn btn-sm btn-danger ms-2">Delete</button>
          </div>
        </div>
        <div v-if="!comments.length" class="text-muted">No comments yet.</div>
      </div> -->

        
    <div v-if="showComments" class="comments-section mt-4">
    <h5>Comments</h5>
    <div v-for="(comment, index) in comments" :key="index" class="comment d-flex mb-2">
      <strong>{{ comment.username }}:</strong>&nbsp;
      
      <span v-if="editIndex !== index">{{ comment.text }}</span>
      
      <input
        v-if="editIndex === index"
        v-model="editedText"
        type="text"
        class="form-control"
      />
      
      <div class="btn-container">
        <button
        v-if="IsCommentedByUser(comment) && editIndex !== index"
        @click="startEdit(index, comment.text)"
        class="btn btn-sm btn-primary ms-2 btn-container"
      >
        Edit
      </button>

      <button
        v-if="IsCommentedByUser(comment) && editIndex !== index"
        @click="openDeleteModal(comment.id)"
        class="btn btn-sm btn-danger ms-2 btn-container"
      >
        Delete
      </button>

        <button
          v-if="editIndex === index"
          @click="updateComment(comment.id)"
          class="btn btn-sm btn-success ms-2"
        >
          Update
        </button>
        
        <button
          v-if="editIndex === index"
          @click="cancelEdit"
          class="btn btn-sm btn-secondary ms-2"
        >
          Cancel
        </button>
      </div>
    </div>
    <div v-if="!comments.length" class="text-muted">No comments yet.</div>

    <div v-if="showDeleteModal" class="dmodal-overlay">
    <div class="dmodal-content">
      <h5>Confirm Deletion</h5>
      <p>Are you sure you want to delete this comment?</p>
      <div class="dmodal-buttons">
        <button @click="confirmDelete" class="btn btn-danger">Confirm</button>
        <button @click="closeDeleteModal" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
  </div>

        <div class="mt-3">
          <textarea v-model="newComment" class="form-control" placeholder="Write a comment..."></textarea>
          <button @click="publishComment" class="btn btn-primary mt-2">Publish Comment</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import NavBar from "../components/navBar.vue";
import ForumSidebar from '../components/forumsideBar.vue';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db, doc, getDoc, auth, updateDoc, arrayUnion, arrayRemove, collection, addDoc, getDocs, Timestamp, deleteDoc } from '../firebaseConfig.js';

const route = useRoute();
const router = useRouter();
const postId = route.params.id;

const post = ref({ title: '', desc: '', author: '', media: [], date: '', likes: 0, dislikes: 0 });
const currentUser = ref(null);
const currentUsername = ref('');
const liked = ref(false);
const disliked = ref(false);
const bookmarked = ref(false);
const showComments = ref(false);
const comments = ref([]);
const newComment = ref("");
const showModal = ref(false);
const editIndex = ref(null);
const editedText = ref("");
const showDeleteModal = ref(false);
const selectedCommentId = ref(null);

const openDeleteModal = (commentId) => {
  selectedCommentId.value = commentId;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  selectedCommentId.value = null;
};

const confirmDelete = async () => {
  if (selectedCommentId.value) {
    await deleteComment(selectedCommentId.value);
    closeDeleteModal();
  }
};


const logError = (error, location) => {
  console.error(`Error in ${location}:`, error);
};

if (!postId) {
  console.error("postId is not defined in the route.");
}

const formattedDate = computed(() => {
  const date = post.value.date ? new Date(post.value.date.seconds * 1000) : null;
  return date ? date.toLocaleDateString() : '';
});

const IsCommentedByUser = (comment) => {
  return comment.username === currentUsername.value;
};

const startEdit = (index, text) => {
  editIndex.value = index;
  editedText.value = text;
};

const cancelEdit = () => {
  editIndex.value = null;
  editedText.value = '';
};

const updateComment = async (commentId) => {
  try {
    const commentRef = doc(db, 'forum', postId, 'comments', commentId);
    await updateDoc(commentRef, { text: editedText.value });

    // Find and update the specific comment in the comments array
    const comment = comments.value.find((c) => c.id === commentId);
    if (comment) {
      comment.text = editedText.value;
    }

    cancelEdit();
  } catch (error) {
    console.error('Error updating comment:', error);
  }
};


const deleteComment = async (commentId) => {
  try {
    const commentRef = doc(db, 'forum', postId, 'comments', commentId);
    await deleteDoc(commentRef);

    // Find the index of the comment to remove from the comments array
    const index = comments.value.findIndex((comment) => comment.id === commentId);
    if (index !== -1) {
      comments.value.splice(index, 1); // Use splice to remove it reactively
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
};
const fetchPost = async () => {
  if (!postId) {
    console.error("postId is undefined or null in fetchPost.");
    return;
  }

  try {
    const docRef = doc(db, 'forum', postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      post.value = docSnap.data();
    } else {
      console.error('Post not found!');
    }
  } catch (error) {
    logError(error, "fetchPost");
  }
};

const openFullScreen = () => {
  showModal.value = true;
};

const closeFullScreen = () => {
  showModal.value = false;
};

const loadCurrentUser = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        currentUser.value = user;
        currentUsername.value = userDoc.data().username;

        // Update button states based on user data
        liked.value = userDoc.data().liked?.includes(postId) || false;
        disliked.value = userDoc.data().disliked?.includes(postId) || false;
        bookmarked.value = userDoc.data().savedPosts?.includes(postId) || false;

        // Add post id to recently viewed list, ensuring max length of 10
        const recentlyViewed = userDoc.data().recentlyViewed || [];
        if (!recentlyViewed.includes(postId)) {
          recentlyViewed.unshift(postId);
          if (recentlyViewed.length > 10) {
            recentlyViewed.pop();
          }
          await updateDoc(userDocRef, { recentlyViewed });
        }
        
      } else {
        console.error("User document not found.");
      }
    } catch (error) {
      logError(error, "loadCurrentUser");
    }
  }
};

const fetchComments = async () => {
  const commentsRef = collection(db, 'forum', postId, 'comments');
  const commentsSnap = await getDocs(commentsRef);
  comments.value = commentsSnap.docs.map(doc => ({
    ...doc.data(),
    id: doc.id, // Add the unique document ID to each comment
  }));
};

const publishComment = async () => {
  if (!newComment.value.trim()) return;

  const commentsRef = collection(db, 'forum', postId, 'comments');
  try {
    const docRef = await addDoc(commentsRef, {
      text: newComment.value,
      username: currentUsername.value,
      timestamp: Timestamp.now()
    });

    // Add the new comment with its ID to the comments array for reactivity
    comments.value.push({ text: newComment.value, username: currentUsername.value, id: docRef.id });
    newComment.value = "";
  } catch (error) {
    logError(error, "publishComment");
  }
};
const isAuthor = computed(() => {
  return currentUsername.value === post.value.author;
});

const goToEditPage = () => {
  router.push(`/forum/edit-post/${postId}`);
};

const likePost = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userDocRef = doc(db, 'users', user.uid);
  const postDocRef = doc(db, 'forum', postId);

  try {
    liked.value = !liked.value;
    if (liked.value) {
      if (disliked.value) {
        disliked.value = false;
        post.value.dislikes -= 1;
        await updateDoc(postDocRef, { dislikes: post.value.dislikes });
      }
      post.value.likes += 1;
      await updateDoc(userDocRef, { liked: arrayUnion(postId), disliked: arrayRemove(postId) });
      await updateDoc(postDocRef, { likes: post.value.likes });
    } else {
      post.value.likes -= 1;
      await updateDoc(userDocRef, { liked: arrayRemove(postId) });
      await updateDoc(postDocRef, { likes: post.value.likes });
    }
  } catch (error) {
    logError(error, "likePost");
  }
};

const dislikePost = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userDocRef = doc(db, 'users', user.uid);
  const postDocRef = doc(db, 'forum', postId);

  try {
    disliked.value = !disliked.value;
    if (disliked.value) {
      if (liked.value) {
        liked.value = false;
        post.value.likes -= 1;
        await updateDoc(postDocRef, { likes: post.value.likes });
      }
      post.value.dislikes += 1;
      await updateDoc(userDocRef, { disliked: arrayUnion(postId), liked: arrayRemove(postId) });
      await updateDoc(postDocRef, { dislikes: post.value.dislikes });
    } else {
      post.value.dislikes -= 1;
      await updateDoc(userDocRef, { disliked: arrayRemove(postId) });
      await updateDoc(postDocRef, { dislikes: post.value.dislikes });
    }
  } catch (error) {
    logError(error, "dislikePost");
  }
};

const bookmarkPost = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userDocRef = doc(db, 'users', user.uid);

  try {
    bookmarked.value = !bookmarked.value;
    if (bookmarked.value) {
      await updateDoc(userDocRef, { savedPosts: arrayUnion(postId) });
    } else {
      await updateDoc(userDocRef, { savedPosts: arrayRemove(postId) });
    }
  } catch (error) {
    logError(error, "bookmarkPost");
  }
};

const toggleComments = () => {
  showComments.value = !showComments.value;
  if (showComments.value) {
    fetchComments();
  }
};

onMounted(async () => {
  await loadCurrentUser();
  await fetchPost();
  await fetchComments();
});
</script>

<style scoped>
.post-thread-container {
  margin: 0 auto; /* Center the container horizontally */
  padding: 20px;
  max-width: min(calc(100% - 75px), 800px);
  transform: translateX(37.5px); /* Shift it to the center */
}


.post-content {
  background-color: #EED4D4;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

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

#carouselExampleIndicators {
  margin-top: 20px;
  max-height: 400px;
}

.carousel-image {
  object-fit: cover;
  max-height: 400px;
  border-radius: 8px;
}

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

.post-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}

.action-buttons {
  display: flex;
  gap: 15px;
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

/* Comments Section */
.comments-section {
  margin-top: 20px;
}

.comment {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  justify-content: space-between;
}

textarea.form-control {
  resize: none;
  min-height: 80px;
}

button.btn-primary {
  background-color: #ff6e61;
  border: none;
}

button.btn-primary:hover {
  background-color: #e65b4e;
}

/* Full Screen Modal */
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
  z-index: 1001;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
}

.btn-container{
  display: inline-block;
  margin-left: auto; 
  margin-right: 0;
}

/* .dmodal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
} */

.dmodal-content {
  background-color: white;
  padding: 20px;
  /* border-radius: 8px;
  width: 300px; */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.dmodal-buttons {
  display: flex;
  justify-content: space-around;
  margin-top: 15px;
}

.dmodal-buttons .btn {
  width: 80px;
}

</style>
