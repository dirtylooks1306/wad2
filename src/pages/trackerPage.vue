<script setup>
import NavBar from "../components/navBar.vue";
</script>

<template>
	<NavBar />
	<div class="container-fluid">
		<div class="mt-3">
			<ul class="d-md-flex desktop-tabs">
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
			<div v-if="activeTab === 'GrowthTracker'">bob</div>
			<div v-else-if="activeTab === 'Vaccine'">bob2</div>
			<table class="logging-table">
				<thead>
					<tr>
						<th>Date</th>
						<th>9-Sep</th>
						<th>10-Sep</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Weight</td>
						<td>1 kg</td>
						<td>1.2 kg</td>
					</tr>
					<tr>
						<td>Height</td>
						<td>4 cm</td>
						<td>5 cm</td>
					</tr>
					<tr>
						<td>Head circumference</td>
						<td>5 cm</td>
						<td>5.5 cm</td>
					</tr>
					<tr>
						<td>Remarks</td>
						<td colspan="2">Notes here</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class="row pt-3">
			<div class="input-container col-md-6 ps-5">
				<div class="form-group row p-1">
					<div class="col-md-1"></div>
					<label for="date" class="col-md-3 col-12 col-form-label"
						>Date of record</label
					>
					<div class="col-md-8 col-12">
						<input type="date" class="form-control" id="date" v-model="selectedDate"/>
					</div>
				</div>
				<div class="form-group row p-1">
					<div class="col-md-1"></div>
					<label for="age" class="col-md-3 col-12 col-form-label"
						>Current age</label
					>
					<div class="col-md-8 col-12">
						<select for="age" class="form-control" v-model="selectedAge">
							<option value="0-2 months">0-2 months</option>
							<option value="2-4 months">2-4 months</option>
							<option value="4-6 months">4-6 months</option>
							<option value="6-9 months">6-9 months</option>
							<option value="9-12 months">9-12 months</option>
							<option value="12-18 months">12-18 months</option>
							<option value="18-24 months">18-24 months</option>
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
					<label for="steps" class="col-md-3 col-12 col-form-label"
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
							<label class="form-check-label" for="inlineRadio1"
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
							<label class="form-check-label" for="inlineRadio2"
								>No</label
							>
						</div>
					</div>
				</div>
				<div class="form-group row ps-1">
					<div class="col-md-1"></div>
					<label for="words" class="col-md-3 col-12 col-form-label"
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
							<label class="form-check-label" for="inlineRadio1"
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
							<label class="form-check-label" for="inlineRadio2"
								>No</label
							>
						</div>
					</div>
				</div>
				<div class="form-group row p-1">
					<div class="col-md-1"></div>
					<label for="remarks" class="col-md-3 col-12 col-form-label"
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
					<div class="col-md-1">
						<button type="submit" class="btn btn-primary">
							Submit
						</button>
					</div>
					<div class="col-md-7"></div>
				</div>
			</div>

			<div class="col-md-6">
				<img src="../assets/homepageBaby.jpg" class="w-50" />
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "trackerPage",
	data() {
		return {
			activeTab: "GrowthTracker",
      selectedDate: '',
      selectedAge:"0-2 months",
      selectedWeight: "",
      selectedHeight: "",
      selectedSteps: "",
      selectedWords: "",
      selectedRemarks: ""
		};
	},
	methods: {
		changeTab() {},
    currentDate(){
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
      const year = today.getFullYear();

      let tdyDate = `${year}-${month}-${day}`;
      return tdyDate;
    }
	},
  created() {
    this.selectedDate = this.currentDate();
  },
  mounted() {
    window.vm = this; // Assign the Vue instance to a global variable
  }
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
