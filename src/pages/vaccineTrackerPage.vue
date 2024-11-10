<script setup>
import { onAuthStateChanged } from "firebase/auth";
import { ref, onMounted, watch } from "vue";
import { db, auth, collection, getDocs, doc } from "../firebaseConfig";
import NavBar from "../components/navBar.vue";
import CustomHeader from "../components/CustomHeader.vue";
import CalendarComponent from "../components/Calendar.vue";
import VaccineCheckList from "../components/VaccineCheckList.vue";
import ChatBot from "../components/ChatBot.vue";

const children = ref([]);
const isNewUser = ref(false);
const selectedChildId = ref(null); // Selected child ID
const vaccineRecords = ref({});
const currentUserValue = ref(null);
const defaultQuestions = ref([
  "Are vaccines linked to autism or other developmental disorders?",
  "Is it safe for my baby to get multiple vaccines at once?",
  "What vaccines does my 2 month-old baby need and when?",
]);
// Fetch user data including children
const fetchUserData = async (currentUser) => {
  if (currentUser) {
    try {
      currentUserValue.value = currentUser.uid;
      const childrenCollectionRef = collection(db, "users", currentUser.uid, "children");
      const childrenSnapshot = await getDocs(childrenCollectionRef);
      children.value = childrenSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      isNewUser.value = children.value.length === 0;

      // Set the first child as default
      if (children.value.length > 0) {
        selectedChildId.value = children.value[0].id;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }
};

// Watch for selectedChildId changes and trigger updates
watch(selectedChildId, (newChildId) => {
  fetchVaccineRecords(newChildId);
});

// Fetch vaccine records for the selected child
const fetchVaccineRecords = async (childId) => {
  if (childId) {
    const childDocRef = doc(db, "users", auth.currentUser.uid, "children", childId);
    const vaccineCollectionRef = collection(childDocRef, "vaccines");
    const vaccineSnapshot = await getDocs(vaccineCollectionRef);
    vaccineRecords.value = vaccineSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
};

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      fetchUserData(currentUser);
    }
  });
});
</script>

<template>
  <NavBar />
  <div class="row">
    <!-- Dropdown for selecting a child -->
    <div class="col-12 mb-4 d-flex justify-content-center">
      <div class="dropdown-container mt-3">
        <label for="childSelect" class="dropdown-label">Select Child:</label>
        <select v-model="selectedChildId" id="childSelect" class="form-control dropdown-select">
          <option v-for="child in children" :key="child.id" :value="child.id">
            {{ child.name }}
          </option>
        </select>
        <div v-if="errorMessage" class="dropdown-error">{{ errorMessage }}</div>
      </div>
    </div>



    <!-- Vaccine Checklist Component for the Selected Child -->
    <div class="col-md-4 col-12">
      <VaccineCheckList :vaccineRecords="vaccineRecords" :childId="selectedChildId" />
    </div>

    <!-- Calendar Component for Tracking Vaccines -->
    <div class="col-md-8 col-12 calendar">
      <CustomHeader header="Vaccine Tracker" />
      <div class="calendar-size pb-2">
        <CalendarComponent :childId="selectedChildId"/>
      </div>
    </div>

    <ChatBot :userId="currentUserValue" :defaultQuestions="defaultQuestions"/>
  </div>

</template>

<style scoped>
.calendar {
  background-color: rgba(173, 183, 146, 0.337);
}

.calendar-size {
  width: 100%;
  height: 100%;
}

.form-control {
  padding: 8px;
  font-size: 16px;
  border-radius: 4px;
  margin-top: 5px;
}

.dropdown-container {
  display: flex;
  align-items: center;
  gap: 10px; 
  max-width: 400px;
  width: 100%;
}

.dropdown-label {
  font-size: 1rem; 
  color: #333;
  margin: 0; 
  white-space: nowrap;
}

.dropdown-select {
  width: 100%;
  padding: 12px;
  font-size: 18px;
  font-weight: bold; 
  border-radius: 10px;
  border: 2px solid #a3c4bc;
  background-color: #f0f4f8;
  color: #333;
  transition: border-color 0.3s ease;
}

.dropdown-select:hover,
.dropdown-select:focus {
  border-color: #6f9e9b; /* Darker color on hover/focus */
  outline: none;
}

.dropdown-select option {
  padding: 10px;
}

.dropdown-error {
  color: #d9534f; /* Red color for error message */
  font-weight: bold;
  font-size: 16px;
  margin-top: 8px;
  text-align: center;
}




</style>