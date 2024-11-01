<script setup>
import { doc, setDoc, db, getDocs, collection } from "../firebaseConfig";
import { ref, onMounted } from "vue";
const user = ref(null);
console.log(user);
</script>
<template>
	<div>
		<!-- Toggle Button for Sidebar -->
		<button class="sidebar-toggle mb-2" @click="toggleSidebar">
			☰ Infant Vaccine Checklist
		</button>

		<!-- Sidebar Content - Visible only when `isOpen` is true -->
		<div v-if="isOpen" class="sidebar">
			<h2><u>Infant Vaccine Checklist</u></h2>
			<div
				v-for="(vaccine, index) in vaccines"
				:key="index"
				class="vaccine"
			>
				<h3>{{ vaccine.name }}</h3>
				<ul>
					<li
						v-for="(dose, doseIndex) in vaccine.doses"
						:key="doseIndex"
					>
						<label>
							<input
								type="checkbox"
								:value="dose"
								v-model="vaccine.dosesCompleted"
								@change="updateStatus(vaccine, dose)"
							/>
							{{ dose }}
						</label>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			isOpen: true,
			vaccines: [
				{
					name: "Hepatitis B (HepB)",
					doses: ["At birth", "1-2 months", "6-18 months"],
					dosesCompleted: [],
				},
				{
					name: "Rotavirus (RV)",
					doses: ["2 months", "4 months", "6 months (if needed)"],
					dosesCompleted: [],
				},
				{
					name: "Diphtheria, Tetanus, and Pertussis (DTaP)",
					doses: ["2 months", "4 months", "6 months", "15-18 months"],
					dosesCompleted: [],
				},
				{
					name: "Haemophilus Influenzae Type b (Hib)",
					doses: [
						"2 months",
						"4 months",
						"6 months (if needed)",
						"12-15 months",
					],
					dosesCompleted: [],
				},
				{
					name: "Pneumococcal Conjugate (PCV13)",
					doses: ["2 months", "4 months", "6 months", "12-15 months"],
					dosesCompleted: [],
				},
				{
					name: "Inactivated Poliovirus (IPV)",
					doses: ["2 months", "4 months", "6-18 months"],
					dosesCompleted: [],
				},
				{
					name: "Influenza (Flu)",
					doses: ["6 months (yearly afterward)"],
					dosesCompleted: [],
				},
				{
					name: "Measles, Mumps, and Rubella (MMR)",
					doses: ["12-15 months"],
					dosesCompleted: [],
				},
				{
					name: "Varicella (Chickenpox)",
					doses: ["12-15 months"],
					dosesCompleted: [],
				},
				{
					name: "Hepatitis A (HepA)",
					doses: ["12-23 months (two doses, six months apart)"],
					dosesCompleted: [],
				},
			],
		};
	},
	methods: {
		toggleSidebar() {
			this.isOpen = !this.isOpen;
		},
		async updateStatus(vaccine, dose) {
			const isChecked = vaccine.dosesCompleted.includes(dose);
			try {
				const vaccineDocRef = doc(
					db,
					"users",
					"user2",
					"vaccines",
					vaccine.name
				);
				await setDoc(
					vaccineDocRef,
					{
						[dose]: isChecked, // e.g., { "At birth": true }
					},
					{ merge: true }
				);
			} catch (error) {
				console.error("Error updating status:", error);
			}
		},
		async fetchVaccineStatus() {
			try {
				// Reference to the vaccines subcollection under the user "user2"
				const vaccinesCollectionRef = collection(
					db,
					"users",
					"user2",
					"vaccines"
				);
				const querySnapshot = await getDocs(vaccinesCollectionRef);

				// Iterate over each document in the vaccines subcollection
				querySnapshot.forEach((docSnap) => {
					if (docSnap.exists()) {
						const vaccineData = docSnap.data();
						const vaccineName = docSnap.id;

						// Find the corresponding vaccine in the local data
						const vaccine = this.vaccines.find(
							(v) => v.name === vaccineName
						);
						if (vaccine) {
							// Set dosesCompleted array based on Firestore data
							vaccine.dosesCompleted = Object.keys(
								vaccineData
							).filter((dose) => vaccineData[dose] === true);
						}
					}
				});
			} catch (error) {
				console.error("Error fetching vaccine status:", error);
			}
		},
	},
	mounted() {
		this.fetchVaccineStatus();
	},
};
</script>

<style>
/* Toggle Button Styles */
.sidebar-toggle {
	background-color: #333;
	color: #fff;
	border: none;
	padding: 10px 15px;
	cursor: pointer;
	font-size: 16px;
	border-radius: 5px;
}

/* Sidebar Styles */
.sidebar {
	width: 100%;
	padding: 20px;
	background-color: #f9f9f9;
	box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
	margin-top: 10px; /* Space between button and content */
}

.vaccine {
	margin-bottom: 1.5rem;
}

h2,
h3 {
	color: #333;
}

ul {
	list-style: none;
	padding: 0;
}

li {
	margin: 0.5rem 0;
}
</style>
