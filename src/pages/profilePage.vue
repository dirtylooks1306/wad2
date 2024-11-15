<script setup>
import NavBar from "../components/navBar.vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { auth, signOut, db, collection, doc, getDocs, getDoc, addDoc, query, where, updateDoc, deleteDoc, storage, ref as sRef  } from "../firebaseConfig.js";
import { setPersistence, browserLocalPersistence,onAuthStateChanged } from "firebase/auth";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";

const user = ref(null);
const username = ref("");
const profileImage = ref("");
const fileInput = ref(null); // Reference to the file input element
const router = useRouter();


const isNewUser = ref(false); 
const childName = ref("");
const childAge = ref(getCurrentDate());
const childWeight = ref("");
const childHeight = ref("");
const childGender = ref("male");
const imageFile = ref(null); 
const children = ref([]); 
const successMessage = ref("");
const errorMessage = ref("");
const expandedChildId = ref(null); 
const editModeChildId = ref(null); 
setPersistence(auth, browserLocalPersistence)
  .then(() => {
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

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

        // check if any children exist
        isNewUser.value = children.value.length === 0;

        // fetch user information
        const userCollection = collection(db, "users");
        const q = query(userCollection, where("email", "==", currentUser.email));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          username.value = doc.data().username;
          profileImage.value = doc.data().profileimage;
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

const triggerFileInput = () => {
  fileInput.value.click(); // Programmatically click the file input
};

const handleImageSelection = async (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFile.value = file;
    await updateProfileImage(); // Automatically upload the image upon selection
  }
};

const updateProfileImage = async () => {
  if (imageFile.value) {
    try {
      const imageRef = sRef(storage, `ProfileImages/${auth.currentUser.uid}/${imageFile.value.name}-${Date.now()}`);
      await uploadBytes(imageRef, imageFile.value);
      const imageUrl = await getDownloadURL(imageRef);
      profileImage.value = imageUrl;
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, {profileimage: imageUrl});
      
    } catch (error) {
      console.error("Error uploading profile image:", error);
    }
  }
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFile.value = file;
  }
};


const saveChildData = async () => {
  if (!childName.value || !childAge.value || !childWeight.value || !childGender.value) {
    errorMessage.value = "Please fill in all the details.";
    return;
  }

  let imageUrl = "https://firebasestorage.googleapis.com/v0/b/cradlecare-5870f.appspot.com/o/ProfileImages%2Fimages.jpg?alt=media&token=b608cb96-680e-475c-8730-b009ec748aed";

  try {
    // Upload the image if selected

    if (imageFile.value) {
      const imageRef = sRef(storage, `ProfileImages/${auth.currentUser.uid}/${childName.value}-${Date.now()}`);
      await uploadBytes(imageRef, imageFile.value);
      imageUrl = await getDownloadURL(imageRef);
    }

    // Reference to the user's document and children collection
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const childrenCollectionRef = collection(userDocRef, "children");

    // Add the new child data to Firestore with image URL
    const newChildRef = await addDoc(childrenCollectionRef, {
      name: childName.value,
      age: childAge.value,
      weight: childWeight.value,
      height: childHeight.value,
      gender: childGender.value,
      imageUrl: imageUrl // Save the image URL in Firestore
    });

    const newChildId = newChildRef.id;

    // Add the new child to the local `children` array for immediate UI update
    children.value.push({
      id: newChildId,
      name: childName.value,
      age: childAge.value,
      weight: childWeight.value,
      height: childHeight.value,
      gender: childGender.value,
      imageUrl: imageUrl
    });

    // Clear form fields
    childName.value = "";
    childAge.value = "";
    childWeight.value = "";
    childHeight.value = "";
    childGender.value = "";
    imageFile.value = null; // Clear the image file

    isNewUser.value = false; // Mark as existing user after saving details
    successMessage.value = "Child details saved successfully!";
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
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
    let imageUrl = "";
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const childDocRef = doc(userDocRef, "children", child.id);
    const imageRef = sRef(storage, `ProfileImages/${auth.currentUser.uid}/${childName.value}-${Date.now()}`);
    await uploadBytes(imageRef, imageFile.value);
    imageUrl = await getDownloadURL(imageRef);
    await updateDoc(childDocRef, {
      name: child.name,
      age: child.age,
      weight: child.weight,
      height: child.height,
      gender: child.gender,
      imageUrl: imageUrl
    });
    editModeChildId.value = null;
    refreshPage()

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

function refreshPage () {
  window.location.reload();
};
// Fetch user data when the component is mounted
onMounted(() => {
  fetchUserData();
});


</script>

<template>
  <NavBar />
  <div class="profile-container" v-if="user">
    <h1>Welcome, {{ username || 'User' }}!</h1>

    <div v-if="profileImage" class="profile-image-container" @click="triggerFileInput">
      <img :src="profileImage" alt="Profile Image" class="profile-image">
      <input type="file" ref="fileInput" @change="handleImageSelection" accept="image/*" class="file-input" />
    </div>
    
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
              <label class="m-1">Child's Date of Birth:</label>
              <input v-model="child.age" class="form-control" />
              <label class="m-1">Child's Weight:</label>
              <input v-model="child.weight" type="number" class="form-control" />
              <label class="m-1">Child's Height:</label>
              <input v-model="child.height" type="number" class="form-control" />
              <label class="m-1">Child's Gender:</label>
              <select v-model="child.gender" class="form-control">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <label for="childImage">Upload Image:</label>
              <input type="file" id="childImage" @change="handleImageUpload" class="form-control" accept="image/*" />
              <button @click="updateChildData(child)" class="btn btn-save">Save</button>
              <button @click="toggleEditMode(null)" class="btn btn-cancel">Cancel</button>
            </div>
            <div v-else >
              <div class="child-info-container">
              <div class="child-info-text">
                <p><strong>Date of birth:</strong> {{ child.age }}</p>
                <p><strong>Weight:</strong> {{ child.weight }} kg</p>
                <p><strong>Height:</strong> {{ child.height }} cm</p>
                <p><strong>Gender:</strong> {{ child.gender }}</p>
              </div>
              <img :src="child.imageUrl" class="child-image-small" alt="Child Image" />
            </div>
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
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div class="form-group">
          <label for="childImage">Upload Image:</label>
          <input type="file" id="childImage" @change="handleImageUpload" class="form-control" accept="image/*" />
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button type="submit" class="btn btn-primary">Save Details</button>
      </form>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    </div>


  
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
.profile-image {
  border: 1px solid black;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
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
.error-message {
  color: red;
  font-weight: bold;
  margin-top: 10px;
}
.child-info-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.child-info-text p {
  margin: 10px;
  font-size: 0.9rem;
}

.child-image-small {
  width: 100px;
  height: auto;
  border-radius: 8px;
  margin: 10px;
}

.child-buttons {
  margin-top: 10px;
}

.profile-image-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  transition: transform 0.3s, opacity 0.3s;
}

.profile-image-container:hover .profile-image {
  transform: scale(1.05);
  opacity: 0.8;
}

.file-input {
  display: none;
}


</style>
