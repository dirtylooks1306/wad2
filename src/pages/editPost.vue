<template>
  <NavBar />
  <div class="container my-5 edit-post-container">    
    <button @click.prevent="deletePost" class="btn btn-danger delete-button mb-3">
      <img src="../assets/icons/delete.png" style="background: transparent; width: 20px; margin-right: 8px;">
      Delete Post
    </button>
    <h2 class="text-center mb-4">Edit Post</h2>

    <div v-if="isAuthor">
      <form @submit.prevent="updatePost" class="post-form">
        <div class="form-group mb-3">
          <label for="title">Title</label>
          <input
            type="text"
            id="title"
            v-model="post.title"
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
            v-model="post.desc"
            required
            placeholder="Write your post content here"
            class="form-control"
          ></textarea>
        </div>
        <div class="form-group mb-3">
          <label for="media">Upload Media</label>
          <input type="file" id="media" multiple @change="handleFileUpload" class="form-control" />
          
          <!-- Preview Existing Media -->
          <div v-if="existingMedia.length || mediaPreviews.length" class="preview-container mt-3">
            <h3>Media Preview</h3>
            <div class="preview-grid row row-cols-auto g-2">
              <div v-for="(src, index) in existingMedia" :key="'existing-' + index" class="col position-relative">
                <img :src="src" alt="Existing media preview" class="img-thumbnail" />
                <button @click.prevent="removeExistingMedia(index)" class="btn-close remove-button" aria-label="Close"></button>
              </div>
              
              <div v-for="(src, index) in mediaPreviews" :key="'new-' + index" class="col position-relative">
                <img :src="src" alt="New media preview" class="img-thumbnail" />
                <button @click.prevent="removeNewFile(index)" class="btn-close remove-button" aria-label="Close"></button>
              </div>
            </div>
          </div>
        </div>
        <button type="submit" class="btn btn-primary w-100 submit-button">
          <img src="../assets/icons/created.png" style="background: transparent; width: 20px; margin-right: 8px;">
          Update Post
        </button>
      </form>
      <p v-if="submissionMessage" class="submission-message text-center mt-3">{{ submissionMessage }}</p>
    </div>
    <div v-else>
      <p class="text-center text-danger">You do not have permission to edit this post.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db, storage, auth, doc, getDoc, updateDoc, ref as storageRef, arrayRemove, uploadBytes, getDownloadURL, deleteDoc, listAll, deleteObject, collection, getDocs } from '../firebaseConfig.js';
import NavBar from "../components/navBar.vue";

const route = useRoute();
const router = useRouter();
const postId = route.params.id;

const post = ref({ title: '', desc: '', media: [], author: '' });
const existingMedia = ref([]);
const mediaPreviews = ref([]);
const selectedFiles = ref([]);
const submissionMessage = ref('');
const currentUsername = ref('');

const loadPostData = async () => {
  try {
    const docRef = doc(db, 'forum', postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const postData = docSnap.data();
      post.value = { ...postData, media: postData.media || [], author: postData.author };
      existingMedia.value = postData.media || [];
    } else {
      submissionMessage.value = 'Post not found';
    }
  } catch (error) {
    console.error('Error loading post data:', error);
    submissionMessage.value = 'Failed to load post data.';
  }
};

const loadCurrentUser = async () => {
  const user = auth.currentUser;
  if (user) {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      currentUsername.value = userDoc.data().username;
    }
  }
};

const isAuthor = computed(() => post.value.author === currentUsername.value);

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files);
  selectedFiles.value.push(...files);
  mediaPreviews.value.push(...files.map((file) => URL.createObjectURL(file)));
};

const removeExistingMedia = (index) => existingMedia.value.splice(index, 1);
const removeNewFile = (index) => {
  selectedFiles.value.splice(index, 1);
  mediaPreviews.value.splice(index, 1);
};

const deletePost = async () => {
  const confirmed = confirm("Are you sure you want to delete this post and all associated data? This action cannot be undone.");
  if (!confirmed) return;

  try {
    // Step 1: Delete all comments in the subcollection
    const commentsCollectionRef = collection(db, 'forum', postId, 'comments');
    const commentsSnapshot = await getDocs(commentsCollectionRef);

    for (const commentDoc of commentsSnapshot.docs) {
      await deleteDoc(doc(db, 'forum', postId, 'comments', commentDoc.id));
    }
    console.log("All comments have been successfully deleted.");

    // Step 2: Delete all photos in the `Forum/postId` folder in Firebase Storage
    const folderRef = storageRef(storage, `Forum/${postId}`);
    const listResult = await listAll(folderRef);

    for (const itemRef of listResult.items) {
      await deleteObject(itemRef);
    }
    console.log("All photos have been successfully deleted from storage.");

    // Step 3: Delete the main document in the `forum` collection
    const postDocRef = doc(db, 'forum', postId);
    await deleteDoc(postDocRef);
    console.log("Post document successfully deleted!");

    // Step 4: Remove the document ID from the `createdPosts` array in the user's document
    const user = auth.currentUser;
    if (user) {
      const userID = user.uid;
      const userDocRef = doc(db, "users", userID);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, {
          createdPosts: arrayRemove(postId)
        });
        console.log("Document ID removed from user's created posts.");
      } else {
        console.log("User document not found.");
      }
    } else {
      console.log("No authenticated user found.");
    }

    alert("The post and all associated data have been successfully deleted.");
    router.push("/forum");
  } catch (error) {
    console.error("Error deleting post data:", error);
    alert("Failed to delete post data. Please try again.");
  }
};

const updatePost = async () => {
  console.log("Update function triggered for postId:", postId);

  try {
    const postRef = doc(db, 'forum', postId);

    // Step 1: Update post text fields
    await updateDoc(postRef, {
      title: post.value.title,
      desc: post.value.desc
    });

    // Step 2: Upload new media files
    const newMediaUrls = [];
    for (const file of selectedFiles.value) {
      const fileRef = storageRef(storage, `Forum/${postId}/${file.name}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);
      newMediaUrls.push(fileUrl);
    }

    // Step 3: Update post document with the new and existing media URLs
    await updateDoc(postRef, {
      media: [...existingMedia.value, ...newMediaUrls]
    });

    submissionMessage.value = 'Your post has been updated successfully!';
    
    setTimeout(() => router.push(`/forum/thread/${postId}`), 1500);
  } catch (error) {
    console.error('Error updating post:', error);
    submissionMessage.value = 'Error updating post. Please try again.';
  }
};

onMounted(async () => {
  await loadCurrentUser();
  await loadPostData();
});
</script>

<style scoped>
.edit-post-container {
  max-width: 700px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #EED4D4;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.preview-container img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
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
