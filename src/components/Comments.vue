<!-- Comments.vue -->
<template>
    <div class="comments-container">
      <h3>Comments</h3>
      <ul class="list-group mb-4">
        <li v-for="comment in comments" :key="comment.id" class="list-group-item">
          <p>{{ comment.text }}</p>
          <small>— {{ comment.author }}</small>
          <button @click="editComment(comment.id)">Edit</button>
          <button @click="deleteComment(comment.id)">Delete</button>
        </li>
      </ul>
  
      <div v-if="user" class="add-comment-section">
        <form @submit.prevent="addComment" class="form-group">
          <textarea
            v-model="newComment"
            placeholder="Add a comment..."
            required
            class="form-control mb-2"
          ></textarea>
          <button type="submit" style="background-color:#FF6E61;">Submit Comment</button>
        </form>
      </div>
      <p v-else class="text-muted">You must be logged in to comment.</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import { collection, addDoc, getDocs, onSnapshot } from 'firebase/firestore';
  import { db, auth } from '../firebaseConfig.js';
  
  const props = defineProps(['docId']);
  
  const comments = ref([]);
  const newComment = ref('');
  const user = ref(auth.currentUser);
  
  // Fetch comments initially and listen for new comments in real-time
  const fetchComments = async () => {
    const commentsRef = collection(db, 'forum', props.docId, 'comments');
    const querySnapshot = await getDocs(commentsRef);
    comments.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };
  
  // Watch for changes in the authentication state to update the `user`
  watch(() => auth.currentUser, (newUser) => {
    user.value = newUser;
  });
  
  onMounted(fetchComments);
  
  // Function to add a new comment
  const addComment = async () => {
    if (!user.value) {
      alert('You must be logged in to comment.');
      return;
    }
  
    // Comment structure
    const commentData = {
      text: newComment.value,
      author: user.value.username || 'Anonymous',
      profileimage: user.value.profileimage || 'https://firebasestorage.googleapis.com/v0/b/cradlecare-5870f.appspot.com/o/ProfileImages%2FRosenSG.png?alt=media&token=7b56b776-850e-4ab3-b022-54a9286d540f',
      date: new Date()
    };
  
    // Add the comment to the `comments` subcollection
    const commentsRef = collection(db, 'forum', props.docId, 'comments');
    await addDoc(commentsRef, commentData);
  
    // Clear the comment input after successful submission
    newComment.value = '';
  };

    // Function to delete a comment
    // const commentsRef = collection(db, 'forum', props.docId, 'comments');
    // const querySnapshot = await getDocs(commentsRef);

    

    // Function to edit a comment
  </script>
  
  <style scoped>
  .comments-container {
    max-width: 700px;
    margin: 0 auto;
    padding: 20px;
    background-color: #EED4D4;
    border: 1px solid #ddd;
    border-radius: 8px;
  }
  
  .comments-container h3 {
    margin-bottom: 15px;
  }
  
  .list-group-item {
    padding: 10px 15px;
  }
  
  .add-comment-section {
    margin-top: 20px;
  }
  
  .form-group textarea {
    min-height: 100px;
    resize: vertical;
  }
  </style>  