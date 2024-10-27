<script setup>
import NavBar from "../components/navBar.vue";
import {
	db,
	collection,
	getDocs,
	ref,
	set,
	getDatabase,
	addDoc,
	doc,
	deleteDoc,
	setDoc,
} from "../firebaseConfig.js";
import { nextTick } from "vue";
import Chart from "chart.js/auto";
import Utils from "../components/Utils.js";
import CustomHeader from "../components/CustomHeader.vue";
import FormComponent from "../components/form.vue";
import TableTracker from "../components/TableTracker.vue";
</script>

<template>
	<NavBar />
	<div class="row">
		<div class="col-3"></div>
		<div class="col-2">
			
		</div>
		<div class="col-7"></div>
	</div>
	<div>
		<!-- <ul class="d-md-flex desktop-tabs mt-3">
			<li
				:class="{ selected: activeTab === 'GrowthTracker' }"
				@click="activeTab = 'GrowthTracker'"
			>
				<a href="#GrowthTracker">Growth Tracker</a>
			</li>
			<li
				:class="{ selected: activeTab === 'Vaccine' }"
				@click="activeTab = 'Vaccine'"
			>
				<a href="#Vaccine">Vaccination Tracker</a>
			</li>
		</ul> -->

		<div class="container-fluid">
			<div class="left-align">
        		<CustomHeader header="GrowthTracker" />
    		</div>
			<TableTracker
				:posts="posts"
				@delete-post="handleDeletePost"
				@update-post="handleUpdatePost"
				class="m-3"
			/>
		</div>
			<div class="secondary-background container-fluid p-0">
				<div class="row pt-3">
					<div class="input-container col-md-5 ps-5">
						<FormComponent @submit="savePost" />
					</div>

					<div class="col-md-7 container-fluid">
						<canvas id="babyGrowthWeightChart"></canvas>
						<canvas id="babyGrowthHeightChart"></canvas>
						<ul class="d-md-flex desktop-tabs mt-3">
							<li
								:class="{
									selected: activeSubTab === 'WeightGraph',
								}"
								@click="activeSubTab = 'WeightGraph'"
							>
								<a href="#WeightGraph">Weight</a>
							</li>
							<li
								:class="{
									selected: activeSubTab === 'HeightGraph',
								}"
								@click="activeSubTab = 'HeightGraph'"
							>
								<a href="#HeightGraph">Height</a>
							</li>
						</ul>
						<button @click="refreshCharts" class="btn btn-success">
							Refresh Charts
						</button>
					</div>
				</div>

		</div>
		<!-- <div v-else-if="activeTab === 'Vaccine'">bob2</div> -->
	</div>
</template>

<script>
export default {
	name: "growthTrackerPage",
	data() {
		return {
			activeTab: "GrowthTracker",
			activeSubTab: "WeightGraph",
			posts: [],
			loading: true,
			weightChart: null,
			heightChart: null,
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
		async handleUpdatePost(updatedPost) {
			const postRef = doc(db, "users", "user2", "posts", updatedPost.id);
			await setDoc(postRef, updatedPost); // Update post in Firebase
			this.fetchPosts(); // Re-fetch posts after update (optional)
		},
		async handleDeletePost(postId) {
			const postRef = doc(db, "users", "user2", "posts", postId);
			await deleteDoc(postRef); // Delete post from Firebase
			this.fetchPosts(); // Re-fetch posts after deletion (optional)
		},
		async savePost(formData) {
			// posting user's tracking info data into firebase
			const userPostsRefPost = collection(db, "users", "user2", "posts");
			const newPost = {
				date: formData.selectedDate,
				age: formData.selectedAge,
				weight: formData.selectedWeight,
				height: formData.selectedHeight,
				sex: formData.selectedSex,
				walk: formData.selectedSteps === "yes",
				talk: formData.selectedWords === "no",
				remarks: formData.selectedRemarks,
			};
			const docRef = await addDoc(userPostsRefPost, newPost);
			await this.fetchPosts();
		},
		async fetchPosts() {
			const postsRef = collection(db, "users", "user2", "posts");
			const snapshot = await getDocs(postsRef);
			this.posts = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})); // Update posts array

			const gender = "male"; // Hardcoded for now
			this.sortPosts(); // sort posts by date AGAIN
			this.currentChildAge = await this.posts[this.posts.length-1].age;
			const globalHeight = collection(
				db,
				"globalBabyData",
				gender,
				"height"
			);
			const snapshotChart = await getDocs(globalHeight);
			this.globalHeightArray = snapshotChart.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})); // height data for the chart based on AGE

			const globalWeight = collection(
				db,
				"globalBabyData",
				gender,
				"weight"
			);
			const snapshotChartWeight = await getDocs(globalWeight);
			this.globalWeightArray = snapshotChartWeight.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})); // weight data for the chart based on AGE

			if (this.activeSubTab === "WeightGraph") {
				this.createChartWeight(this.currentChildAge); // Only create the weight chart
			} else if (this.activeSubTab === "HeightGraph") {
				this.createChartHeight(this.currentChildAge); // Only create the height chart
			}
		},
		createChartWeight(currentChildAge) {
			console.log(currentChildAge)
			if (this.weightChart) {
				this.weightChart.destroy();
			}
			const ageRangeMapping = {
				"0-2 months": 1,
				"2-4 months": 2,
				"4-6 months": 3,
				"6-9 months": 4,
				"9-12 months": 5,
				"12-18 months": 6,
				"18-24 months": 7,
			};

			let dateData = this.posts.map((post) => post.date); // date in array
			let weightData = this.posts.map((post) => post.weight); // weight in array
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
				"0-2 months": 1,
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

		// GET user;s tracking info data from firebase
		const userPostsRefGet = collection(db, "users", "user2", "posts");
		const snapshot = await getDocs(userPostsRefGet);
		this.posts = snapshot.docs
			.map((doc) => ({ id: doc.id, ...doc.data() }))
			.sort((a, b) => {
				const dateA = new Date(a.date);
				const dateB = new Date(b.date);
				return dateA - dateB;
			});
		this.loading = false;
		this.sortPosts();
		await this.fetchPosts();
		this.toggleCharts();
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
li {
	list-style-type: none;
	padding: 20px;
	display: inline;
	border: 1px solid transparent;
	transition: all 0.3s ease;
	border-radius: 20%;
}

.selected {
	border-color: #f1f1f1;
	background-color: lightgray;
}

li:not(.selected) {
	opacity: 0.5;
	cursor: pointer;
}
.secondary-background {
	background-color: #eed4d4;
	width: 100%;
	display: flex;
	margin: auto;
	margin-left:-20px;
	margin-right:-20px;
}
.container-fluid {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	margin: auto;
}
.left-align {
	align-self: flex-start;
}

.desktop-tabs {
	display: block;
}

.mobile-dropdown {
	display: none;
}
.text-left {
	align-self: flex-start;
	width: 100%;
}

@media (max-width: 768px) {
	.desktop-tabs {
		display: none;
	}
	.mobile-dropdown {
		display: block;
		position: absolute;
		top: 10%;
		left: 50%;
		width: 90%;
	}
}
</style>
