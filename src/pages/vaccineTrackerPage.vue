<script setup>
import { onAuthStateChanged } from "firebase/auth";
import { ref,onMounted } from "vue";
import { db, auth,collection, getDocs } from "../firebaseConfig";
import NavBar from "../components/NavBar.vue";
import CustomHeader from "../components/CustomHeader.vue";
import CalendarComponent from "../components/Calendar.vue";
import VaccineCheckList from "../components/VaccineCheckList.vue";
const children = ref([]);
const isNewUser = ref(false);
const selectedChildId = ref(null);
const vaccineRecords = ref({});
const fetchUserData = async (currentUser) => {
  if (currentUser) {
    try {
      // Correctly reference the 'children' collection under the user's document
      const childrenCollectionRef = collection(db, "users", currentUser.uid, "children");

      // Fetch the user's children
      const childrenSnapshot = await getDocs(childrenCollectionRef);
      children.value = childrenSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Set isNewUser based on whether there are any children records
      isNewUser.value = children.value.length === 0;

      // Optionally log the children data for debugging
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }
};

// Listen to auth state changes once on component mount
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
    <div class="col-12 mb-4">
      <label for="childSelect">Select Child:</label>
      <select v-model="selectedChildId" id="childSelect" class="form-control">
        <option v-for="child in children" :key="child.id" :value="child.id">
          {{ child.name }}
        </option>
      </select>
    </div>

    <!-- Vaccine Checklist Component for the Selected Child -->
    <div class="col-md-4 col-12">
      <VaccineCheckList :vaccineRecords="vaccineRecords" :childId="selectedChildId" />
    </div>

    <!-- Calendar Component for Tracking Vaccines -->
    <div class="col-md-8 col-12 calendar">
      <CustomHeader header="Vaccine Tracker" />
      <div class="calendar-size pb-2">
        <CalendarComponent />
      </div>
    </div>
  </div>
</template>

### Styles (Optional)

```css
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
</style>
