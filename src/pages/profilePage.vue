<script setup>
import NavBar from "../components/navBar.vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { auth, signOut, db, collection, doc, getDocs, setDoc, addDoc, query, where, updateDoc, deleteDoc  } from "../firebaseConfig.js";
import { setPersistence, browserLocalPersistence,onAuthStateChanged } from "firebase/auth";
// State for user information and child details
const user = ref(null);
const username = ref("");
const router = useRouter();

// Child details form fields
const isNewUser = ref(false); // Flag to indicate if it's a new user or first-time data entry
const childName = ref("");
const childAge = ref(getCurrentDate());
const childWeight = ref("");
const childHeight = ref("");
const childGender = ref("");
const children = ref([]); // Array to store the list of children
const successMessage = ref("");

// Track expanded and edit mode for each child
const expandedChildId = ref(null); // ID of the currently expanded child
const editModeChildId = ref(null); // ID of the child being edited
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // Handle successful persistence setting if needed
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });
// Function to fetch the user's username and child data from Firestore
const fetchUserData = async () => {
  onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const childrenCollectionRef = collection(userDocRef, "children");

        // Get the user's children
        const childrenSnapshot = await getDocs(childrenCollectionRef);
        children.value = childrenSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Check if any children exist
        isNewUser.value = children.value.length === 0;

        // Fetch and set user information
        const userCollection = collection(db, "users");
        const q = query(userCollection, where("email", "==", currentUser.email));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          username.value = doc.data().username;
        });

        user.value = currentUser;
      } catch (error) {
        console.error("Error getting user data:", error);
      }
    } else {
      router.push("/login"); // Redirect to login if no user is found
    }
  });
};


// Function to handle form submission and save child data to Firestore
const saveChildData = async () => {
  if (!childName.value || !childAge.value || !childWeight.value || !childGender.value) {
    alert("Please fill in all the details.");
    return;
  }

  try {
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const childrenCollectionRef = collection(userDocRef, "children");

    // Add a new child document to the children subcollection
    const newChildRef = await addDoc(childrenCollectionRef, {
      name: childName.value,
      age: childAge.value,
      weight: childWeight.value,
      gender: childGender.value
    });

    // Use the generated ID for the new child
    const newChildId = newChildRef.id;

    // Add the new child with the ID to the local `children` array for immediate UI update
    children.value.push({
      id: newChildId,
      name: childName.value,
      age: childAge.value,
      weight: childWeight.value,
      height: childHeight.value,
      gender: childGender.value
    });

    // Clear form fields
    childName.value = "";
    childAge.value = "";
    childWeight.value = "";
    childHeight.value = "";
    childGender.value = "";

    isNewUser.value = false; // Mark as existing user after saving details
    successMessage.value = "Child details saved successfully!";
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  }
  catch (error) {
    console.error("Error saving child data:", error);
  }
};

const deleteChild = async (childId) => {
  try {
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const childDocRef = doc(userDocRef, "children", childId);
    // Delete the child document from Firestore
    await deleteDoc(childDocRef);
    // Re-fetch the user data to update the `children` array
    await fetchUserData();

    // Reset `expandedChildId` if it was set to the deleted child’s ID
    if (expandedChildId.value === childId) {
      expandedChildId.value = null;
    }
  } catch (error) {
    console.error("Error deleting child:", error);
  }
};


const toggleEditMode = (childId) => {
  if (editModeChildId.value === childId) {
    editModeChildId.value = null; // Turn off edit mode
  } else {
    editModeChildId.value = childId; // Turn on edit mode for this child
  }
};
const updateChildData = async (child) => {
  try {
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const childDocRef = doc(userDocRef, "children", child.id);
    await updateDoc(childDocRef, {
      name: child.name,
      age: child.age,
      weight: child.weight,
      height: child.height,
      gender: child.gender
    });
    editModeChildId.value = null; // Exit edit mode
  } catch (error) {
    console.error("Error updating child data:", error);
  }
};

function getCurrentDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${year}-${month}-${day}`;
}
// Fetch user data when the component is mounted
onMounted(() => {
  fetchUserData();
});

// Function to handle logout
const handleLogout = async () => {
  try {
    await signOut(auth);
    user.value = null; // Clear the user data
    router.push('/login'); // Redirect to the login page after logging out
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
</script>

<template>
  <NavBar />
  <div class="profile-container" v-if="user">
    <h1>Welcome, {{ username || 'User' }}!</h1>

    <!-- Form to add new child -->
    <div v-if="children.length > 0">
        <h2>Your Children:</h2>
        <div v-for="child in children" :key="child.id" class="child-card">
          <button @click="expandedChildId = expandedChildId === child.id ? null : child.id" class="dropdown-btn w-100 text-start">
              <div class="dropdown-content">
                <span>{{ child.name }}</span>
                <span class="arrow">{{ expandedChildId === child.id ? '▲' : '▼' }}</span>
              </div>
          </button>
          
          <div v-if="expandedChildId === child.id" class="child-details">
            <div v-if="editModeChildId === child.id">
              <label class="m-1">Child's Name:</label>
              <input v-model="child.name" class="form-control" />
              <label class="m-1">Child's Weight:</label>
              <input v-model="child.weight" type="number" class="form-control" />
              <label class="m-1">Child's Height:</label>
              <input v-model="child.height" type="number" class="form-control" />
              <label class="m-1">Child's Gender:</label>
              <select v-model="child.gender" class="form-control">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <button @click="updateChildData(child)" class="btn btn-save">Save</button>
              <button @click="toggleEditMode(null)" class="btn btn-cancel">Cancel</button>
            </div>
            <div v-else>
              <p><strong>Date of birth:</strong> {{ child.age }} </p>
              <p><strong>Weight:</strong> {{ child.weight }} kg</p>
              <p><strong>Height:</strong> {{ child.height }} cm</p>
              <p><strong>Gender:</strong> {{ child.gender }}</p>
              <button @click="toggleEditMode(child.id)" class="btn btn-edit">Edit</button>
              <button @click="deleteChild(child.id)" class="btn btn-delete">Delete</button>
            </div>
          </div>
        </div>
      </div>
    <div v-if="isNewUser || children.length === 0">
      <h2>Please add your child's details:</h2>
    </div>

    <div>
      <h2 v-if="children.length != 0">Add Another Child:</h2>
      <form @submit.prevent="saveChildData" class="child-details-form">
        <div class="form-group">
          <label for="childName">Child's Name:</label>
          <input v-model="childName" type="text" id="childName" class="form-control" required />
        </div>

        <div class="form-group">
          <label for="childAge">Date of birth:</label>
          <input v-model="childAge" type="date" id="childAge" class="form-control" required />
        </div>

        <div class="form-group">
          <label for="childWeight">Weight (kg):</label>
          <input v-model="childWeight" type="number" id="childWeight" class="form-control" required />
        </div>

        <div class="form-group">
          <label for="childHeight">Height (cm):</label>
          <input v-model="childHeight" type="number" id="childHeight" class="form-control" required />
        </div>

        <div class="form-group">
          <label for="childGender">Gender:</label>
          <select v-model="childGender" id="childGender" class="form-control" required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary">Save Details</button>
      </form>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    </div>

    <!-- Display list of children -->


    <button @click="handleLogout" class="btn btn-danger">Logout</button>
  </div>
</template>



<style scoped>
.profile-container {
  max-width: 600px;
  margin: 100px auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.child-details-form .form-group {
  margin-bottom: 15px;
}

.form-control {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.child-card {
  border: 1px solid #ddd;
  padding: 10px;
  margin-top: 10px;
  border-radius: 5px;
  background: #f9f9f9;
  text-align: left;
}

.btn {
  background-color: #FF9689;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  margin: 5px;
}

.btn-primary {
  background-color: #4CAF50;
}

.btn-danger:hover {
  background-color: #e57e74;
}

.dropdown-btn {
  background: #f1f1f1;
  color: #333;
  width: 100%;
  text-align: left;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.dropdown-content {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.arrow {
  font-size: 16px;
  text-align: end;
}
.success-message {
  color: green;
  font-size: 14px;
  margin-top: 10px;
}

</style>
