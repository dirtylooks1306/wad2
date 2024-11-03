<script setup>
import { onAuthStateChanged } from "firebase/auth";
import { ref, onMounted } from "vue";
import { db, doc, setDoc, collection, getDocs, auth } from "../firebaseConfig";
import { defineProps, watch } from "vue";

    const isOpen = ref(true);
    const userId = ref(null); // Store the current user's ID
    const props = defineProps({
		childId: String, // Receive childId from the parent component
	});
    const vaccines = ref([
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
        doses: ["2 months", "4 months", "6 months (if needed)", "12-15 months"],
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
    ]);

    // Toggle the sidebar


const updateStatus = async (vaccine, dose) => {
  const isChecked = vaccine.dosesCompleted.includes(dose);
  if (userId.value && props.childId) {
    try {
      const vaccineDocRef = doc(
        db,
        "users",
        userId.value,
        "children",
        props.childId,
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
  }
};

// Fetch vaccine status from Firestore
// Fetch vaccine status from Firestore
const fetchVaccineStatus = async () => {
  // Clear previous dosesCompleted data
  vaccines.value.forEach((vaccine) => {
    vaccine.dosesCompleted = []; // Reset dosesCompleted for each vaccine
  });

  if (props.childId && userId.value) {
    try {
      const vaccinesCollectionRef = collection(
        db,
        "users",
        userId.value,
        "children",
        props.childId,
        "vaccines"
      );
      const querySnapshot = await getDocs(vaccinesCollectionRef);

      querySnapshot.forEach((docSnap) => {
        if (docSnap.exists()) {
          const vaccineData = docSnap.data();
          const vaccineName = docSnap.id;

          // Find the matching vaccine in the local data
          const vaccine = vaccines.value.find((v) => v.name === vaccineName);
          if (vaccine) {
            // Set dosesCompleted based on Firestore data for the new child
            vaccine.dosesCompleted = Object.keys(vaccineData).filter(
              (dose) => vaccineData[dose] === true
            );
          }
        }
      });
    } catch (error) {
      console.error("Error fetching vaccine status:", error);
    }
  }
};

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
};

// Watch for changes in `childId` and refetch vaccine data
watch(
  () => props.childId,
  (newChildId) => {
    if (newChildId) {
      fetchVaccineStatus();
    }
  }
);


// Fetch user ID on component mount and fetch data initially
onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      userId.value = currentUser.uid;
      fetchVaccineStatus(); // Fetch data after getting userId
    }
  });
});

// Watch for changes in `childId` and refetch vaccine data
watch(
  () => props.childId,
  (newChildId) => {
    if (newChildId) {
      fetchVaccineStatus();
    }
  }
);

</script>
<template>
	<div>
		<!-- Toggle Button for Sidebar -->
		<button class="sidebar-toggle m-2" @click="toggleSidebar">
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


<style>
/* Toggle Button Styles */
.sidebar-toggle {
    background-color: #333;
    color: #fff;
    border: none;
    padding: 12px 18px;
    cursor: pointer;
    font-size: 18px;
    border-radius: 8px;
    transition: background-color 0.3s ease, transform 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.sidebar-toggle:hover {
    background-color: #555;
    transform: scale(1.05);
}

/* Sidebar Styles */
.sidebar {
    width: 100%;
    padding: 15px;
    background-color: #edcfb4;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    margin-top: 8px;
    animation: fadeIn 0.5s ease-out;
}

/* Sidebar Header Styles */
.sidebar h2 {
    color: #333;
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
    border-bottom: 2px solid #a3c4bc;
    padding-bottom: 10px;
    text-transform: uppercase;
}

/* Vaccine Section Styling */
.vaccine {
    background-color: #ffffff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
    transition: box-shadow 0.3s ease;
    border-left: 5px solid #a3c4bc;
}

.vaccine:hover {
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
}

/* Vaccine Header */
.vaccine h3 {
    color: #333;
    font-size: 20px;
    margin-bottom: 12px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 5px;
}

/* Doses List */
ul {
    list-style: none;
    padding: 0;
}

li {
    margin: 0.7rem 0;
    display: flex;
    align-items: center;
}

/* Checkbox Styling */
input[type="checkbox"] {
    appearance: none;
    width: 20px;
    height: 20px;
    margin-right: 10px;
    border: 2px solid #ddd;
    border-radius: 4px;
    transition: background-color 0.3s ease, border-color 0.3s ease;
    cursor: pointer;
    position: relative;
}

input[type="checkbox"]:checked {
    background-color: #a3c4bc;
    border-color: #a3c4bc;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M20.292 5.292a1 1 0 0 1 1.415 1.415l-12 12a1 1 0 0 1-1.415 0l-6-6a1 1 0 1 1 1.415-1.415L8.293 16.293l11.292-11.001z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
}

/* Checkbox Hover Effect */
input[type="checkbox"]:hover {
    border-color: #a3c4bc;
}

/* Label Styling */
label {
    font-size: 16px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
}
</style>
