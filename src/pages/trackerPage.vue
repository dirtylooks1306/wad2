<script setup>
import NavBar from "../components/navBar.vue";
import {
	db,
	collection,
	getDocs,
	auth,
	addDoc,
	doc,
	deleteDoc,
	setDoc,
} from "../firebaseConfig.js";
import Chart from "chart.js/auto";
import Utils from "../components/Utils.js";
import CustomHeader from "../components/CustomHeader.vue";
import FormComponent from "../components/form.vue";
import TableTracker from "../components/TableTracker.vue";
import { ref } from "vue";
import { onAuthStateChanged } from "firebase/auth";
// const childrenNames = ref([]);



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
					<div class="chart-container">
						<canvas id="babyGrowthWeightChart"></canvas>
						<canvas id="babyGrowthHeightChart"></canvas>
					</div>

					<ul class="d-md-flex desktop-tabs mt-3">
						<li :class="{ selected: activeSubTab === 'WeightGraph' }" @click="activeSubTab = 'WeightGraph'">
							<a href="#WeightGraph">Weight</a>
						</li>
						<li :class="{ selected: activeSubTab === 'HeightGraph' }" @click="activeSubTab = 'HeightGraph'">
							<a href="#HeightGraph">Height</a>
						</li>
					</ul>
					<button @click="refreshCharts" class="btn refresh-button">
						Refresh Charts
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "growthTrackerPage",
	data() {
		return {
			userId: null,
			children: [],
			selectedChildId: null, 
			selectedChildPosts: [],
			activeTab: "GrowthTracker",
			activeSubTab: "WeightGraph",
			posts: [],
			loading: true,
			weightChart: null,
			heightChart: null,
			gender: "",
			globalWeightArray: [],
			globalHeightArray: [],
			currentChildAge: "",
		};
	},
	methods: {
		sortPosts() {
			this.posts = this.posts.sort((a, b) => {
				const dateA = new Date(a.date);
				const dateB = new Date(b.date);
				return dateA - dateB; // Sort in ascending order
			});
		},
		async handleChildSelection() {
		if (!this.selectedChildId) return;

		const childPostsRef = collection(db, "users", this.userId, "children", this.selectedChildId, "posts");
		const snapshot = await getDocs(childPostsRef);

		this.selectedChildPosts = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		}));
		// Optional: sort posts if needed
		this.selectedChildPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
		},
		async fetchChildrenNames() {
			try {
				if (!this.userId) return;

				const userChildrenRef = collection(db, "users", this.userId, "children");
				const snapshot = await getDocs(userChildrenRef);

				// Map through each document to get the `id` and `name` field
				this.children = snapshot.docs.map((doc) => ({
					id: doc.id,
					name: doc.data().name
				}));
			} catch (error) {
				console.error("Error fetching children names:", error);
			}
		},
		async handleUpdatePost(updatedPost) {
			const postRef = doc(db, "users", this.userId, "posts", updatedPost.id);
			await setDoc(postRef, updatedPost); // Update post in Firebase
			this.fetchPosts(); // Re-fetch posts after update (optional)
		},
		async handleDeletePost(postId) {
			const postRef = doc(db, "users", this.userId, "posts", postId);
			await deleteDoc(postRef); // Delete post from Firebase
			this.fetchPosts(); // Re-fetch posts after deletion (optional)
		},
		async savePost(formData) {
			// posting user's tracking info data into firebase
			const userPostsRefPost = collection(db, "users", this.userId, "posts");
			const newPost = {
				date: formData.selectedDate,
				age: formData.selectedAge,
				weight: formData.selectedWeight,
				height: formData.selectedHeight,
				remarks: formData.selectedRemarks,
			};
			const docRef = await addDoc(userPostsRefPost, newPost);
			await this.fetchPosts();
		},
		async fetchPosts() {
			if (this.posts.length === 0) {
				// Fetch initial post and set gender from `children` collection
				await this.fetchInitialPostFromChildren();
			} else {
				// Check if gender is already set
				if (!this.gender) {
					// Set gender from `children` collection if not already set
					await this.setGenderFromChildren();
				}
				// Fetch posts from user collection
				await this.fetchPostsFromUserCollection();
			}

			this.sortPosts(); // Sort posts by date
			this.currentChildAge = this.getMappedAgeRange(this.posts[this.posts.length - 1].age);
			
			// Now that gender is set, fetch global data for charts
			if (this.gender) {
				await this.fetchGlobalDataByGender();
			} else {
				console.warn("Gender not defined, skipping global data fetch");
			}
			// Initialize the appropriate chart
			if (this.activeSubTab === "WeightGraph") {
				this.createChartWeight(this.currentChildAge);
			} else if (this.activeSubTab === "HeightGraph") {
				this.createChartHeight(this.currentChildAge);
			}
		},

		async fetchInitialPostFromChildren() {
			const childrenRef = collection(db, "users", this.userId, "children");
			const childrenSnapshot = await getDocs(childrenRef);
			const firstChild = childrenSnapshot.docs[0];
			const firstChildData = firstChild.data();

			// Set gender and initialize post data
			this.gender = firstChildData.gender.toLowerCase();
			const date = firstChildData.age;
			const weight = firstChildData.weight;
			const height = firstChildData.height;

			let age = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
			age = this.calculateAgeDisplay(age);

			this.posts = [{ id: firstChild.id, date, age, weight, height }];

			// Add this initial post to the `posts` collection in Firestore
			const postRef = collection(db, "users", this.userId, "posts");
			await addDoc(postRef, { date, age, weight, height });
		},

		async setGenderFromChildren() {
			const childrenRef = collection(db, "users", this.userId, "children");
			const childrenSnapshot = await getDocs(childrenRef);
			const firstChildData = childrenSnapshot.docs[0]?.data();

			if (firstChildData) {
				this.gender = firstChildData.gender.toLowerCase();
			}
		},

		async fetchGlobalDataByGender() {
			const globalHeight = collection(db, "globalBabyData", this.gender, "height");
			const globalWeight = collection(db, "globalBabyData", this.gender, "weight");
			
			let age = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
			age = this.calculateAgeDisplay(age);

			const snapshotChartHeight = await getDocs(globalHeight);
			this.globalHeightArray = snapshotChartHeight.docs.map((doc) => ({
				id: doc.id,
				age: doc.data().age,
				...doc.data(),
			}));

			const snapshotChartWeight = await getDocs(globalWeight);
			this.globalWeightArray = snapshotChartWeight.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
		},
		async fetchPostsFromUserCollection() {
			const postsRef = collection(db, "users", this.userId, "posts");
			const snapshot = await getDocs(postsRef);
			this.posts = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
    	},
		calculateAgeDisplay(days) {
        if (days < 2) return days + " day";
        if (days < 31) return days + " days";
        const months = Math.floor(days / 30);
        return months < 2 ? months + " month" : months + " months";
    	},
		getMappedAgeRange(currentAge) {
			// Split age into number and unit
			const [amount, unit] = currentAge.split(" ");
			const ageInDays = parseInt(amount);

			let ageInMonths;

			if (unit === "days" || unit === "day") {
				// Convert days to approximate months (1 month ~ 30.44 days)
				ageInMonths = Math.floor(ageInDays / 30.44);
			} else if (unit === "months" || unit === "month") {
				ageInMonths = ageInDays; // Already in months
			}
			// Map age to age range
			if (ageInMonths <= 2) return "1-2 months";
			else if (ageInMonths <= 4) return "2-4 months";
			else if (ageInMonths <= 6) return "4-6 months";
			else if (ageInMonths <= 9) return "6-9 months";
			else if (ageInMonths <= 12) return "9-12 months";
			else if (ageInMonths <= 18) return "12-18 months";
			else return "18-24 months";
			},
		createChartWeight(currentChildAge) {
			if (this.weightChart) {
				this.weightChart.destroy();
			}
			const ageRangeMapping = {
				"1-2 months": 1,
				"2-4 months": 2,
				"4-6 months": 3,
				"6-9 months": 4,
				"9-12 months": 5,
				"12-18 months": 6,
				"18-24 months": 7,
			};

			let dateData = this.posts.map((post) => post.date); // date in array
			let weightData = this.posts.map((post) => post.weight); // weight in array
			this.currentChildAge = this.getMappedAgeRange(this.currentChildAge);
			let averageWeight =
				this.globalWeightArray[0][
					ageRangeMapping[this.currentChildAge]
				];

			let averageWeightArray = Array.from(
				{ length: this.posts.length },
				() => averageWeight
			);
			const ctx = document
				.getElementById("babyGrowthWeightChart")
				.getContext("2d");
			const data = {
				labels: dateData,
				datasets: [
					{
						label: "Weight (in kg)",
						data: weightData,
						fill: false,
						borderColor: Utils.CHART_COLORS.red,
						tension: 0.1,
					},
					{
						label:
							"Average SG baby Weight at " +
							`${this.currentChildAge}` +
							" (in kg)",
						data: averageWeightArray,
						fill: false,
						borderColor: Utils.CHART_COLORS.green,
						tension: 0.1,
					},
				],
			};

			const config = {
				type: "line",
				data: data,
				options: {
					responsive: true,
					plugins: {
						legend: {
							position: "top",
						},
						title: {
							display: true,
							text: "Your Child's Weight over Time",
						},
					},
				},
			};

			this.weightChart = new Chart(ctx, config);
		},
		createChartHeight(currentChildAge) {
			if (this.heightChart) {
				this.heightChart.destroy();
			}
			const ageRangeMapping = {
				"1-2 months": 1,
				"2-4 months": 2,
				"4-6 months": 3,
				"6-9 months": 4,
				"9-12 months": 5,
				"12-18 months": 6,
				"18-24 months": 7,
			};
			let heightData = this.posts.map((post) => post.height); // height in array
			let dateData = this.posts.map((post) => post.date); // date in array
			let averageHeight =
				this.globalHeightArray[0][
					ageRangeMapping[this.currentChildAge]
				];
			let averageHeightArray = Array.from(
				{ length: this.posts.length },
				() => averageHeight
			);

			const ctx = document
				.getElementById("babyGrowthHeightChart")
				.getContext("2d");
			const data = {
				labels: dateData,
				datasets: [
					{
						label: "Height (in cm)",
						data: heightData,
						fill: false,
						borderColor: Utils.CHART_COLORS.blue,
						tension: 0.1,
					},
					{
						label:
							"Average SG baby Height at " +
							`${this.currentChildAge}` +
							" (in cm)",
						data: averageHeightArray,
						fill: false,
						borderColor: Utils.CHART_COLORS.green,
						tension: 0.1,
					},
				],
			};

			const config = {
				type: "line",
				data: data,
				options: {
					responsive: true,
					plugins: {
						legend: {
							position: "top",
						},
						title: {
							display: true,
							text: "Your Child's Height over Time",
						},
					},
				},
			};

			this.heightChart = new Chart(ctx, config);
		},
		toggleCharts() {
			// Toggle the visibility of the charts based on the active tab
			if (this.activeSubTab === "WeightGraph") {
				document.getElementById("babyGrowthWeightChart").style.display =
					"block";
				document.getElementById("babyGrowthHeightChart").style.display =
					"none";
				if (!this.weightChart) {
					this.createChartWeight();
				}
			} else if (this.activeSubTab === "HeightGraph") {
				document.getElementById("babyGrowthWeightChart").style.display =
					"none";
				document.getElementById("babyGrowthHeightChart").style.display =
					"block";
				if (!this.heightChart) {
					this.createChartHeight();
				}
			}
		},
		async refreshCharts() {
			this.loading = true; // Show a loading spinner if needed

			// Fetch posts and update the charts
			await this.fetchPosts(); // This will update the active chart

			this.loading = false; // Hide the loading spinner
		},
	},
	async mounted() {
		window.vm = this;
		
		// Check user authentication on component mount
		onAuthStateChanged(auth, async (user) => {
			if (user) {
				this.userId = user.uid; // Set userId to the logged-in user’s UID
				// Get the user's tracking info data from Firebase
				await this.fetchChildrenNames();
				const userPostsRefGet = collection(db, "users", this.userId, "posts");
				const snapshot = await getDocs(userPostsRefGet);

				// Map and sort the posts data
				this.posts = snapshot.docs
					.map((doc) => ({ id: doc.id, ...doc.data() }))
					.sort((a, b) => {
						const dateA = new Date(a.date);
						const dateB = new Date(b.date);
						return dateA - dateB;
					});

				// Set loading to false and initialize charts
				this.loading = false;
				this.sortPosts();
				await this.fetchPosts();
				this.toggleCharts();
			} else {
				// Redirect to login if no user is found
				this.$router.push("/login");
			}
	});
},

	watch: {
		// Watch the active tab and re-render the chart accordingly
		activeSubTab(newTab) {
			this.toggleCharts();
		},
		posts: {
			handler() {
				this.sortPosts();
			},
			deep: true, // Deep watch to track changes in the posts array
		},
	},
};
</script>

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

/* Chart Container */
.chart-container {
	background-color: #ffffff;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
	margin-bottom: 20px;
	overflow: hidden;
}

.chart-container canvas {
	width: 100% !important; /* Ensures the canvas takes the full width of its container */
	height: auto !important; /* Maintains aspect ratio */
	max-width: 100%; /* Prevents overflow */
}
/* Tabs for Chart Selection */
.desktop-tabs {
	display: flex;
	gap: 10px;
	margin-top: 15px;
}

.desktop-tabs li {
	list-style-type: none;
	padding: 10px 20px;
	border-radius: 20px;
	background-color: #e9ecef;
	cursor: pointer;
	transition: background-color 0.3s;
}

.desktop-tabs li:hover,
.desktop-tabs li.selected {
	background-color: #9e9e9e;
	color: white;
	font-weight: bold;
}	

/* Refresh Button */
.refresh-button {
	background-color: #28a745;
	color: #fff;
	padding: 10px 20px;
	border: none;
	border-radius: 8px;
	font-size: 1rem;
	margin-top: 10px;
	cursor: pointer;
	transition: background-color 0.3s;
}

.refresh-button:hover {
	background-color: #218838;
}

/* Responsive Design */
@media (max-width: 768px) {
	.form-and-charts {
		flex-direction: column;
	}

	.chart-container {
		max-height: 400px;
	}

	.desktop-tabs {
		flex-direction: column;
		align-items: center;
	}
}
</style>
