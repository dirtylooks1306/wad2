<template>
  <NavBar/>
  <div class="container my-5 new-post-container">
    <h2 class="text-center mb-4">Create a New Post</h2>
    <form @submit.prevent="submitPost" class="post-form">
      <div class="form-group mb-3">
        <label for="title">Title</label>
        <input
          type="text"
          id="title"
          v-model="newPost.title"
          required
          placeholder="Enter the title"
          maxlength="200"
          class="form-control"
        />
      </div>
      <div class="form-group mb-3">
        <label for="desc">Description</label>
        <textarea
          id="desc"
          v-model="newPost.desc"
          required
          placeholder="Write your post content here"
          class="form-control"
        ></textarea>
      </div>
      <div class="form-group mb-3">
        <label for="media">Upload Media</label>
        <input type="file" id="media" multiple @change="handleFileUpload" class="form-control" />
        <div v-if="mediaPreviews.length" class="preview-container mt-3">
          <h3>Media Preview</h3>
          <div class="preview-grid row row-cols-auto g-2">
            <div v-for="(src, index) in mediaPreviews" :key="index" class="col position-relative">
              <img :src="src" alt="Uploaded media preview" class="img-thumbnail" />
              <button @click.prevent="removeFile(index)" class="btn-close remove-button" aria-label="Close"></button>
            </div>
          </div>
        </div>
      </div>
      <button type="submit" class="btn btn-primary w-100 submit-button">Submit Post</button>
    </form>
    <p v-if="submissionMessage" class="submission-message text-center mt-3">{{ submissionMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { 
  auth, 
  db, 
  storage,
  addDoc,
  collection,
  doc,
  updateDoc,
  getDoc,
  ref as storageRef,
  uploadBytes,
  getDownloadURL } from '../firebaseConfig.js';
import NavBar from '../components/navBar.vue';

const newPost = ref({
  title: '',
  desc: '',
  mediaFiles: []
});

const mediaPreviews = ref([]);
const selectedFiles = ref([]);
const submissionMessage = ref('');

// Function to handle file uploads and generate previews
const handleFileUpload = (event) => {
  selectedFiles.value = Array.from(event.target.files);
  mediaPreviews.value = selectedFiles.value.map((file) => URL.createObjectURL(file));
};

// Function to remove a specific file and its preview
const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
  mediaPreviews.value.splice(index, 1);
};

// Function to get the current username and profile image
const getCurrentUsername = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return {
        username: userDoc.data().username,
        profileimage: userDoc.data().profileimage
      };
    } else {
      console.error('User document not found');
      return {
        username: 'Unknown User',
        profileimage: null
      };
    }
  } catch (error) {
    console.error('Error fetching user document:', error);
    return {
      username: 'Unknown User',
      profileimage: null
    };
  }
};

// Function to submit the post to Firestore
const submitPost = async () => {
  const user = auth.currentUser;

  if (user) {
    try {
      const authorDetails = await getCurrentUsername(user.uid);

      // Step 1: Create a new document in the forum collection with basic fields
      const newDocRef = await addDoc(collection(db, 'forum'), {
        author: authorDetails.username,
        date: new Date(),
        desc: newPost.value.desc,
        likes: 1,
        title: newPost.value.title,
        profileimage: authorDetails.profileimage
      });

      const documentId = newDocRef.id;

      // Step 2: Upload media files to Firebase Storage if any are selected
      const mediaUrls = [];
      for (const file of selectedFiles.value) {
        const fileRef = storageRef(storage, `Forum/${documentId}/${file.name}`);
        await uploadBytes(fileRef, file);
        const fileUrl = await getDownloadURL(fileRef);
        mediaUrls.push(fileUrl);
      }

      // Step 3: Update the document with media URLs if any files were uploaded
      if (mediaUrls.length > 0) {
        await updateDoc(newDocRef, {
          media: mediaUrls
        });
      }

      submissionMessage.value = 'Your post has been submitted successfully!';
      newPost.value.title = '';
      newPost.value.desc = '';
      selectedFiles.value = [];
      mediaPreviews.value = [];

      //add docid into user's document under field array createdPosts
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const createdPosts = userDoc.data().createdPosts || [];
        createdPosts.push(documentId);
        await updateDoc(userDocRef, {
          createdPosts: createdPosts
        });
      } else {
        console.error('User document not found');
      }

    } catch (error) {
      console.error('Error submitting post:', error);
      submissionMessage.value = 'Error submitting post. Please try again.';
    }
  } else {
    submissionMessage.value = 'You must be logged in to submit a post.';
  }
};
</script>

<style scoped>
.new-post-container {
  max-width: 700px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #D9C5B2;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.preview-item img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.remove-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(255, 0, 0, 0.7);
}

.submission-message {
  color: #28a745;
}
</style>