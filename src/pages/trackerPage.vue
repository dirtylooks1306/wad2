<script setup>
import CustomHeader from "../components/CustomHeader.vue";
import FormComponent from "../components/form.vue";
import TableTracker from "../components/TableTracker.vue";
import NavBar from "../components/navBar.vue";
import GrowthCharts from "../components/GrowthCharts.vue";
import ChatBot from "../components/ChatBot.vue";
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
const currentUserValue = ref(null);
const error = ref("");
const todayDate = ref("");
const childImage = ref("");

const defaultQuestions = ref([
	"How can I tell if my baby is growing at a healthy rate?",
	"What milestones should I expect as my baby grows during their first year?",
	"What are some signs that my baby might have a growth or developmental delay?",
]);
// Fetch posts for the selected child
const sortPosts = () => {
    posts.value = posts.value.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB; // Sort in ascending order by date
    });
};
function calculateAgeRange(dob) {
	const today = new Date();
	const birthDate = new Date(dob);

	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
	const day = String(today.getDate()).padStart(2, '0');

	todayDate.value = `${year}-${month}-${day}`;
	// Calculate the difference in years and convert it to months, then add the difference in months
	let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
	months -= birthDate.getMonth();
	months += today.getMonth();

	// Adjust for any days difference within the current month
	if (today.getDate() < birthDate.getDate()) {
		months--;
	}

  // Determine the age range based on the number of months
	if (months >= 0 && months <= 2) return "0-2 months";
	else if (months > 2 && months <= 4) return "2-4 months";
	else if (months > 4 && months <= 6) return "4-6 months";
	else if (months > 6 && months <= 9) return "6-9 months";
	else if (months > 9 && months <= 12) return "9-12 months";
	else if (months > 12 && months <= 18) return "12-18 months";
	else if (months > 18 && months <= 24) return "18-24 months";
}
const calculateAge = (birthDate, targetDate = new Date()) => {
	const birth = new Date(birthDate);
	const target = new Date(targetDate);

	let months = (target.getFullYear() - birth.getFullYear()) * 12 + (target.getMonth() - birth.getMonth());

	// Adjust if the target date is earlier in the month than the birth date
	if (target.getDate() < birth.getDate()) {
		months -= 1;
	}

	// Determine age range
	if (months >= 0 && months <= 2) return "0-2 months";
	else if (months > 2 && months <= 4) return "2-4 months";
	else if (months > 4 && months <= 6) return "4-6 months";
	else if (months > 6 && months <= 9) return "6-9 months";
	else if (months > 9 && months <= 12) return "9-12 months";
	else if (months > 12 && months <= 18) return "12-18 months";
	else if (months > 18 && months <= 24) return "18-24 months";
	else return "24+ months"; // Optional: Handle cases over 24 months
};
const fetchPosts = async () => {
	const childDocRef = doc(db, "users", userId.value, "children", selectedChildId.value);
	const childSnapshot = await getDoc(childDocRef);
	gender.value = childSnapshot.data().gender;
	childImage.value = childSnapshot.data().imageUrl;

	const childPostsRef = collection(db, "users", userId.value, "children", selectedChildId.value, "posts");
	const snapshot = await getDocs(childPostsRef);
	if (snapshot.empty) { // If no posts exist in Firestore, add the first post
		let ageVal = calculateAgeRange(childSnapshot.data().age);
		const firstPost = {
		dateOfBirth: childSnapshot.data().age,
		date: todayDate.value,
		age: ageVal,
		weight: childSnapshot.data().weight,
		height: childSnapshot.data().height,
		};
		await addDoc(childPostsRef, firstPost); // Save first post to Firestore
		posts.value = [firstPost];
	} else {
		// Load existing posts from Firestore if they exist
		posts.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	}

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
	const childDocRef = doc(db, "users", userId.value, "children", selectedChildId.value);
	const childSnapshot = await getDoc(childDocRef);
	let ageVal = calculateAge(childSnapshot.data().age,formData.selectedDate);
	const newPost = {
		dateOfBirth: childSnapshot.data().age,
		date: formData.selectedDate || new Date(), // Default to current date if not provided
		age: ageVal,
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
	currentUserValue.value = user.uid;
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
			<img :src="childImage" alt="Child's Image" class="child-image mb-3" v-if="childImage" />
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
			<div class="table-wrapper">
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
		<ChatBot :userId="currentUserValue" :defaultQuestions="defaultQuestions"/>
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

.table-wrapper {
  overflow-x: auto; /* Enable horizontal scrolling on the wrapper */
  margin: 0 -10px; /* Adjust margins to align with screen */
}
@import url('https://fonts.googleapis.com/css2?family=Baloo+2&display=swap');
.table-tracker {
	background-color: #ffffff;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
	font-family: 'Baloo 2', sans-serif;
	margin-bottom: 20px;
	width: 100%;
	text-align: center;
	overflow-x: auto;
	min-width: 600px;
}

.table-tracker .table-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
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
	font-family: 'Comic Sans MS', sans-serif;
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

.child-image {
	width: 100px; /* Adjust width to your preference */
	height: 100px;
	border-radius: 50%; /* Make the image circular */
	object-fit: cover;
}

@media (max-width: 768px) {
  .table-tracker {
    font-size: 0.9rem; /* Reduce font size for mobile */
    padding: 10px; /* Reduce padding */

  }

  .table-tracker .table-row {
    flex-direction: column; /* Stack each cell vertically */
    text-align: left;
  }

  .table-tracker .table-row > div {
    padding: 8px 0; /* Adjust padding for mobile */
    text-align: left;
  }
}


</style>