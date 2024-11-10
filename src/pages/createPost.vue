<template>
  <NavBar/>
  <div class="new-post-container">
    <h2>Create a New Post</h2>
    <form @submit.prevent="submitPost" class="post-form">
      <div class="form-group">
        <label for="title">Title</label>
        <input
          type="text"
          id="title"
          v-model="newPost.title"
          required
          placeholder="Enter the title"
        />
      </div>
      <div class="form-group">
        <label for="desc">Description</label>
        <textarea
          id="desc"
          v-model="newPost.desc"
          required
          placeholder="Write your post content here"
        ></textarea>
      </div>
      <div class="form-group">
        <label for="media">Upload Media</label>
        <input type="file" id="media" multiple @change="handleFileUpload" />
        <div v-if="mediaPreviews.length" class="preview-container">
          <h3>Media Preview</h3>
          <div class="preview-grid">
            <div v-for="(src, index) in mediaPreviews" :key="index" class="preview-item">
              <img :src="src" alt="Uploaded media preview" />
              <button @click.prevent="removeFile(index)" class="remove-button">✕</button>
            </div>
          </div>
        </div>
      </div>
      <button type="submit" style="background-color: #ff6e61;" class="w-100 submit-button">Submit Post</button>
    </form>
    <p v-if="submissionMessage" class="submission-message">{{ submissionMessage }}</p>
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
  margin: 30px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #D9C5B2;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.post-form {
  width: 100%;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

input[type="text"],
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

textarea {
  min-height: 150px;
  resize: vertical;
}

input[type="file"] {
  display: block;
  margin-top: 5px;
}

.preview-container {
  margin-top: 15px;
}

.preview-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.preview-item {
  position: relative;
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
  border: none;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-button:hover {
  background-color: rgba(255, 0, 0, 0.9);
}

.submit-button {
  width: 100%;
  padding: 10px;
  background-color: #FF9689;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.submit-button:hover {
  background-color: #218838;
}

.submission-message {
  text-align: center;
  color: #28a745;
  margin-top: 15px;
}
</style>