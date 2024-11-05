<script setup>
import CustomHeader from "../components/CustomHeader.vue";
import FormComponent from "../components/form.vue";
import TableTracker from "../components/TableTracker.vue";
import NavBar from "../components/navBar.vue";
import GrowthCharts from "../components/GrowthCharts.vue";
import { ref } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import { db, collection, getDocs, setDoc, deleteDoc, doc, auth, addDoc, getDoc } from "../firebaseConfig";
import { useRouter } from "vue-router";

const router = useRouter();
// Reactive variables
const posts = ref([]);
const userId = ref(null);
const selectedChildId = ref(null);
const children = ref([]);
const gender = ref(null);
const error = ref("");
// Fetch posts for the selected child
const sortPosts = () => {
    posts.value = posts.value.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB; // Sort in ascending order by date
    });
};

const fetchPosts = async () => {

	const childDocRef = doc(db, "users", userId.value, "children", selectedChildId.value);
	const childSnapshot = await getDoc(childDocRef);
	gender.value = childSnapshot.data().gender;

	const childPostsRef = collection(db, "users", userId.value, "children", selectedChildId.value, "posts");
	const snapshot = await getDocs(childPostsRef);
	posts.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	sortPosts();
};

// Handle child selection change
const handleChildSelection = async () => {
  	await fetchPosts();
};

// Handle updating a post
const handleUpdatePost = async (updatedPost) => {
	const postRef = doc(db, "users", userId.value, "children", selectedChildId.value, "posts", updatedPost.id);
	await setDoc(postRef, updatedPost, { merge: true });
	await fetchPosts();
};

// Handle deleting a post
const handleDeletePost = async (postId) => {
	const postRef = doc(db, "users", userId.value, "children", selectedChildId.value, "posts", postId);
	await deleteDoc(postRef);
	await fetchPosts();
};

const savePost = async (formData) => {
	const postRef = collection(db, "users", userId.value, "children", selectedChildId.value, "posts");

	// Use formData passed from FormComponent
	const newPost = {
		date: formData.selectedDate || new Date(), // Default to current date if not provided
		age: formData.selectedAge,
		weight: formData.selectedWeight,
		height: formData.selectedHeight,
		remarks: formData.selectedRemarks,
	};

	await addDoc(postRef, newPost); // Automatically generates document ID
	await fetchPosts(); // Refresh the posts
};


const redirectToProfile = () => {
  // Navigate to the profile page
  	router.push("/profile");
};

const fetchChildren = async () => {
  if (!userId.value) return;

  const childrenRef = collection(db, "users", userId.value, "children");
  const snapshot = await getDocs(childrenRef);
  children.value = snapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name }));

  if (children.value.length > 0) {
    selectedChildId.value = children.value[0].id;
    await fetchPosts();
  } else {
    error.value = "No children found, please add a child to get started.";
  }
};


// Set user ID on authentication
onAuthStateChanged(auth, async (user) => {
  if (user) {
    userId.value = user.uid;
    await fetchChildren();
	sortPosts();
  }
});

</script>

<template>
	<NavBar />
	<div class="page-container">
	  <div class="container-fluid header-section">
		<div class="left-align">
		  <CustomHeader header="GrowthTracker" />
		  <div class="child-selector mb-3">
			<label for="childDropdown" class="me-2">Select Child:</label>
			<select id="childDropdown" v-model="selectedChildId" @change="handleChildSelection">
			  <option v-for="child in children" :key="child.id" :value="child.id">
				{{ child.name }}
			  </option>
			</select>
		  </div>
		</div>
	  </div>
  
	  <!-- Modal for no children found -->
	<div v-if="error" class="modal-overlay">
		<div class="modal-content">
			<h2 class="modal-title">No Children Registered</h2>
			<p class="modal-message">It looks like you haven't registered any children yet.</p>
			<p class="modal-subtext">Please visit your profile page to add a child and start tracking growth information.</p>
			<button class="modal-button" @click="redirectToProfile">Go to Profile Page</button>
		</div>
	</div>
  
	  <div>
		<div class="table-tracker text-center">
		  <div class="center">
			<TableTracker
			  :posts="posts"
			  @delete-post="handleDeletePost"
			  @update-post="handleUpdatePost"
			  class="m-3"
			/>
		  </div>
		</div>
  
		<div class="form-and-charts">
		  <div class="form-section">
			<FormComponent @submit="savePost" />
		  </div>
  
		  <div class="charts-section">
			<GrowthCharts :posts="posts" :gender="gender"/>
		  </div>
		</div>
	  </div>
	</div>
  </template>
  
<style scoped>
/* General Page Layout */
.page-container {
	max-width: 1200px;
	margin: auto;
	padding: 20px;
	color: #333;
	font-family: Arial, sans-serif;
}

/* Header Section */
.header-section {
	margin-bottom: 20px;
	padding: 20px;
	background-color: #f8f9fa;
	border-radius: 8px;
	box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}

.child-selector {
	display: flex;
	align-items: center;
	font-weight: bold;
}

#childDropdown {
	padding: 10px;
	border-radius: 8px;
	border: 1px solid #ccc;
	font-size: 1rem;
}

/* Table Tracker Section */
.table-tracker {
	background-color: #ffffff;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
	margin-bottom: 20px;
	width: 100%;
	text-align: center;
}
.center {
	display: flex;
	justify-content: center;
}

/* Form and Charts Section */
.form-and-charts {
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
}

.form-section {
	background-color: #f9f9f9;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
	flex: 1 1 40%;
}

.charts-section {
	flex: 1 1 55%;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2); /* Softer shadow */
    padding: 30px;
    max-width: 400px;
    text-align: center;
    animation: fadeIn 0.3s ease; /* Subtle fade-in animation */
}

.modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 10px;
}

.modal-message {
    font-size: 1rem;
    font-weight: 500;
    color: #555;
    margin-bottom: 15px;
}

.modal-subtext {
    font-size: 0.9rem;
    color: #777;
    margin-bottom: 20px;
}

.modal-button {
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.modal-button:hover {
    background-color: #0056b3; /* Darker blue on hover */
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}


</style>