<script setup>
import NavBar from "../components/navBar.vue";
import {
	db,
	collection,
	getDocs,
	ref,
	set,
	getDatabase,
	addDoc
} from "../firebaseConfig.js";
import { toRaw } from "vue";
</script>

<template>
	<NavBar />
	<div class="container-fluid">
		<ul class="d-md-flex desktop-tabs mt-3">
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
		</ul>

		<!-- <select v-model="activeTab" class="mobile-dropdown" @change="changeTab">
      <option value="GrowthTracker">Growth Tracker</option>
      <option value="Vaccine">Vaccination Tracker</option>
    </select> -->
		<div v-if="activeTab === 'GrowthTracker'" class="container-fluid">
			<table class="logging-table">
				<tbody>
					<tr>
						<th>Date of Record</th>
						<td v-for="(post, index) in posts" :key="index">
							{{ post.date || "" }}
						</td>
						<td
							v-for="n in 6 - posts.length"
							:key="n + posts.length"
						></td>
					</tr>
					<tr>
						<th>Current age</th>
						<td v-for="post in posts" :key="post.id">
							{{ post.age || "" }}
						</td>
						<td
							v-for="n in 6 - posts.length"
							:key="n + posts.length"
						></td>
					</tr>
					<tr>
						<th>Weight (in kg)</th>
						<td v-for="post in posts" :key="post.id">
							{{ post.weight || "" }}
						</td>
						<td
							v-for="n in 6 - posts.length"
							:key="n + posts.length"
						></td>
					</tr>
					<tr>
						<th>Height / Length (in cm)</th>
						<td v-for="post in posts" :key="post.id">
							{{ post.height || "" }}
						</td>
						<td
							v-for="n in 6 - posts.length"
							:key="n + posts.length"
						></td>
					</tr>
					<tr>
						<th>First steps</th>
						<td v-for="n in 6" :key="n">
							{{ posts[n - 1] && typeof posts[n - 1].walk === 'boolean' ? (posts[n - 1].walk ? 'Yes' : 'No') : "" }}
						</td>
					</tr>
					<tr>
						<th>First words</th>
						<td v-for="n in 6" :key="n">
							{{ posts[n - 1] && typeof posts[n - 1].talk === 'boolean' ? (posts[n - 1].talk ? 'Yes' : 'No') : "" }}
						</td>
					</tr>
					<tr>
						<th>Remarks</th>
						<td v-for="n in 6" :key="n">
							{{ posts[n - 1] ? posts[n - 1].remarks : "" }}
						</td>
					</tr>
				</tbody>
			</table>

			<div class="row pt-3">
				<div class="input-container col-md-6 ps-5">
					<div class="form-group row p-1">
						<div class="col-md-1"></div>
						<label for="date" class="col-md-3 col-12 col-form-label"
							>Date of record</label
						>
						<div class="col-md-8 col-12">
							<input
								type="date"
								class="form-control"
								id="date"
								v-model="selectedDate"
							/>
						</div>
					</div>
					<div class="form-group row p-1">
						<div class="col-md-1"></div>
						<label for="age" class="col-md-3 col-12 col-form-label"
							>Current age</label
						>
						<div class="col-md-8 col-12">
							<select
								for="age"
								class="form-control"
								v-model="selectedAge"
							>
								<option value="0-2 months">0-2 months</option>
								<option value="2-4 months">2-4 months</option>
								<option value="4-6 months">4-6 months</option>
								<option value="6-9 months">6-9 months</option>
								<option value="9-12 months">9-12 months</option>
								<option value="12-18 months">
									12-18 months
								</option>
								<option value="18-24 months">
									18-24 months
								</option>
							</select>
						</div>
					</div>
					<div class="form-group row p-1">
						<div class="col-md-1"></div>
						<label for="date" class="col-md-3 col-12 col-form-label"
							>Weight</label
						>
						<div class="col-md-8 col-12">
							<input
								type="number"
								class="form-control"
								id="weight"
								placeholder="11.4 kg"
								v-model="selectedWeight"
							/>
						</div>
					</div>
					<div class="form-group row p-1">
						<div class="col-md-1"></div>
						<label for="date" class="col-md-3 col-12 col-form-label"
							>Height/ Length</label
						>
						<div class="col-md-8 col-12">
							<input
								type="number"
								class="form-control"
								id="date"
								placeholder="30 cm"
								v-model="selectedHeight"
							/>
						</div>
					</div>
					<div class="form-group row ps-1">
						<div class="col-md-1"></div>
						<label
							for="steps"
							class="col-md-3 col-12 col-form-label"
							>First Steps?</label
						>
						<div class="col-md-8 col-12 pt-2">
							<div class="form-check form-check-inline">
								<input
									class="form-check-input"
									type="radio"
									name="steps"
									id="yesSteps"
									value="yes"
									v-model="selectedSteps"
								/>
								<label
									class="form-check-label"
									for="inlineRadio1"
									>Yes</label
								>
							</div>
							<div class="form-check form-check-inline">
								<input
									class="form-check-input"
									type="radio"
									name="steps"
									id="noSteps"
									value="no"
								/>
								<label
									class="form-check-label"
									for="inlineRadio2"
									>No</label
								>
							</div>
						</div>
					</div>
					<div class="form-group row ps-1">
						<div class="col-md-1"></div>
						<label
							for="words"
							class="col-md-3 col-12 col-form-label"
							>First Words?</label
						>
						<div class="col-md-8 col-12 pt-2">
							<div class="form-check form-check-inline">
								<input
									class="form-check-input"
									type="radio"
									name="words"
									id="yesWords"
									value="yes"
								/>
								<label
									class="form-check-label"
									for="inlineRadio1"
									>Yes</label
								>
							</div>
							<div class="form-check form-check-inline">
								<input
									class="form-check-input"
									type="radio"
									name="words"
									id="noWords"
									value="no"
									v-model="selectedWords"
								/>
								<label
									class="form-check-label"
									for="inlineRadio2"
									>No</label
								>
							</div>
						</div>
					</div>
					<div class="form-group row p-1">
						<div class="col-md-1"></div>
						<label
							for="remarks"
							class="col-md-3 col-12 col-form-label"
							>Remarks</label
						>
						<div class="col-md-8 col-12">
							<textarea
								class="form-control"
								id="remarks"
								rows="2"
								placeholder="Notes here"
								v-model="selectedRemarks"
							></textarea>
						</div>
					</div>
					<div class="row pt-3">
						<div class="col-md-4"></div>
						<div class="col-md-4">
							<button
								type="submit"
								class="btn btn-primary"
								@click="savePost"
							>
								Submit
							</button>
						</div>
						<div class="col-md-4"></div>
					</div>
				</div>

				<div class="col-md-6">
					<img src="../assets/homepageBaby.jpg" class="w-50" />
				</div>
			</div>
		</div>
		<div v-else-if="activeTab === 'Vaccine'">bob2</div>
	</div>
</template>

<script>
export default {
	name: "trackerPage",
	data() {
		return {
			activeTab: "GrowthTracker",
			selectedDate: "",
			selectedAge: "0-2 months",
			selectedWeight: "",
			selectedHeight: "",
			selectedSteps: "",
			selectedWords: "",
			selectedRemarks: "",
			posts: [],
			loading:true,
		};
	},
	methods: {
		changeTab() {},
		currentDate() {
			// sets selectedDate default value to today's date
			const today = new Date();
			const day = String(today.getDate()).padStart(2, "0");
			const month = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
			const year = today.getFullYear();
			let tdyDate = `${year}-${month}-${day}`;
			return tdyDate;
		},
		async savePost() {
			// posting user's tracking info data into firebase
			const userPostsRefPost = collection(db, "users", "user2", "posts");
			const newPost = {
				date: this.selectedDate,
				age: this.selectedAge,
				weight: this.selectedWeight,
				height: this.selectedHeight,
				walk: this.selectedSteps,
				talk: this.selectedWords,
				remarks: this.selectedRemarks,
			};
		const docRef = await addDoc(userPostsRefPost, newPost);
		},
	},
	created() {
		this.selectedDate = this.currentDate();
	},
	async mounted() {
		window.vm = this;

		// GET user;s tracking info data from firebase
		const userPostsRefGet = collection(db, "users", "user2", "posts");
		const snapshot = await getDocs(userPostsRefGet);
		this.posts = snapshot.docs
							.map(doc => ({ id: doc.id, ...doc.data() }))
							.sort((a, b) => {
								const dateA = new Date(a.date); 
								const dateB = new Date(b.date); 
								return dateA - dateB;
            				});
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
.container-fluid {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	margin: auto;
}

.desktop-tabs {
	display: block;
}

.mobile-dropdown {
	display: none;
}
table,
tr,
td,
th,
thead,
tbody {
	border: 2px solid black;
}
.logging-table th,
.logging-table td {
	min-width: 100px;
	text-align: left;
	padding: 10px;
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
		/* transform: translateX(-50%); */
		width: 90%;
	}
}
</style>
