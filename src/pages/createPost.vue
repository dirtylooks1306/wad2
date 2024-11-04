<template>
  <div class="new-post-container">
    <h2>Create a New Post</h2>
    <form @submit.prevent="submitPost">
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
      </div>
      <button type="submit" class="submit-button">Submit Post</button>
    </form>
    <p v-if="submissionMessage" class="submission-message">{{ submissionMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { auth, db, storage, addDoc, collection, doc, updateDoc, getDoc, ref as storageRef, uploadBytes, getDownloadURL } from '../firebaseConfig.js';

const newPost = ref({
  title: '',
  desc: '',
  mediaFiles: []
});

const submissionMessage = ref('');
const selectedFiles = ref([]);

// Function to handle file uploads
const handleFileUpload = (event) => {
  selectedFiles.value = Array.from(event.target.files);
};

// Function to get the current username and profileimage
const getCurrentUsername = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return {
        username: userDoc.data().username, // Assumes username field exists in the document
        profileimage: userDoc.data().profileimage // Assumes profileimage field exists in the document
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
  background-color: #f9f9f9;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
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

.submit-button {
  width: 100%;
  padding: 10px;
  background-color: #28a745;
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