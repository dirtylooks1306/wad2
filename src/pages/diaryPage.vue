<script setup>
import NavBar from "../components/navBar.vue";
import CustomHeader from "../components/CustomHeader.vue";
import Diary from "../components/Diary.vue";
import DiaryForm from '../components/diaryForm.vue';
import {
	db,
	collection,
	getDocs,
	doc,
	deleteDoc,
	setDoc,
  query,
  storage,
  auth,
  ref as sRef,
  uploadBytes,
  getDownloadURL,
} from "../firebaseConfig.js";
import { orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
</script>
 
<template>
	<NavBar />
  <div class="container-fluid p-3">
    <CustomHeader header="DIARY"/>
    <div v-if="children.length === 0" class="modal-overlay">
      <div class="modal-content">
				<h2 class="modal-title">No Children Registered</h2>
				<p class="modal-message">It looks like you haven't registered any children yet.</p>
				<p class="modal-subtext">Please visit your profile page to add a child and start recording wonderful memories of your children.</p>
				<button class="modal-button" @click="redirectToProfile">Go to Profile Page</button>
			</div>
    </div>
    <div class="centered-container">
      <div class="diaries">
        <Diary v-for="(diary, i) in userDiaries" 
        :dbDiary="diary" 
        :key="i"
        @deleteEntry="deleteEntry"
        @deleteDiary="deleteDiary"
        @toggled="setOwnerName"/>
      </div>
    </div>
    <div class="form-block container-fluid w-75">
      <DiaryForm :entryData="newEntry"
      :diaries="userDiaries" 
      :children="children"
      :entryError="entryError"
      :diaryError="diaryError"
      @submitEntry="submitEntry"
      :owner="selectedOwnerName"/>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'diaryPage',
    components: {
      Diary,
      DiaryForm,
      NavBar,
      CustomHeader,
    },
    data() {
      return {
        dbDiaries: [], //Gets the database's diaries
        userDiaries: [], //Gets diaries that belong to the user
        children: [],
        newEntry: {},
        entryError: "",
        diaryError: "",
        selectedOwnerName: "", //To pass to the diary component
      }
    },
    methods: {
      async submitEntry(formData) {
        //Part 1: Retrieve form data and assign variables
        const diaryOwner = formData.name;
        //Part 2: Update database with new entry
        for (let d of this.userDiaries) {
          if (d.id === diaryOwner) {
            if (formData.imageURL) {
              //Logic for uploading files to Firestore (only happen if user chooses to upload an image)
              const fileRef = sRef(storage, `DiaryImages/${diaryOwner}/${formData.imageURL.name}`);
              await uploadBytes(fileRef, formData.imageURL);
              const fileURL = await getDownloadURL(fileRef);
              formData.imageURL = fileURL;
            }
            //if-loop only when diary is first initialised -> Removes placeholder with actual entry
            if (d.entries.length === 1 && d.entries[0].id === "Placeholder") {
              const id = "Entry 001"
              const entry = {
                body: formData.body,
                date: formData.date ? new Date(formData.date) : null,
                imageURL: formData.imageURL,
                header: formData.header
              }
              const newDiaryEntry = doc(db, "diary", diaryOwner, "Entries", id)
              await setDoc(newDiaryEntry, entry)
              d.entries.push({
                id: id,
                ...entry,
                date: entry.date ? entry.date.toLocaleDateString() : 'No Date',
              })
            }
            else {
              const entryId = String(d.entries.length + 1).padStart(3, '0'); //Firebase sorts path names ALPHABETICALLY
              //Add new entry into Firebase
              const newEntryRef = doc(db, "diary", diaryOwner, "Entries", `Entry ${entryId}`);
              this.newEntry = {
                body: formData.body,
                date: formData.date ? new Date(formData.date) : null, //Convert date string to Timestamp object
                imageURL: formData.imageURL,
                header: formData.header,
              };
              await setDoc(newEntryRef, this.newEntry); //setDoc used instead of addDoc since there is custom ID set
              this.getEntries(diaryOwner); //Re-fetch entries after insertion (optional)
              //Part 3: Update entries array instantly
              d.entries.push({
                id: `Entry ${entryId}`,
                ...this.newEntry,
                date: this.newEntry.date ? this.newEntry.date.toLocaleDateString() : 'No Date',
              })
            };
            this.entryError = "Entry successfully added!";
            setTimeout(() => {
              this.entryError = "";
            }, 3000);   
          }
        }
      },
      async deleteEntry(name, index) {
        for (let d of this.userDiaries) {
          if (d.id === name) {
            //Delete entry from Firebase
            const entryId = String(index + 1).padStart(3, '0');
            const entryRef = doc(db, "diary", name, "Entries", `Entry ${entryId}`);
            await deleteDoc(entryRef);
            //Update entries array instantly
            d.entries.splice(index, 1);
          }
        }
      },
      async getEntries(name) {
        var entries = [];
        const dbEntries = collection(db, "diary", name, "Entries");
        const orderedQuery = query(dbEntries, orderBy("date", "asc")) //Sort by date ascending
        const snapshot = await getDocs(orderedQuery);
        entries = snapshot.docs.map((doc) => ({
          id: doc.id, 
          header: doc.data().header,
          date: doc.data().date ? doc.data().date.toDate().toLocaleDateString() : 'No Date',
          body: doc.data().body,
          imageURL: doc.data().imageURL,
        }))
        return entries; // Returns value of entries array to be used in mounted function
      },
      async addDiary(name) {
        //If diary does not exist, proceed with creating the new diary
        const newDiary = doc(db, "diary", name);
        await setDoc(newDiary, { created: true }); //Create new path for new diary owner
        
        const newEntries = collection(newDiary, "Entries");
        const placeholder = doc(newEntries, "Placeholder");
        await setDoc(placeholder, { empty: true }) //Create subcollection with placeholder
        //Remove placeholder immediately after diary is created
        const deletePlaceholder = doc(db, "diary", name, "Entries", 'Placeholder');
        await deleteDoc(deletePlaceholder);
        //Update userDiaries
        this.userDiaries.push({
          id: name,
          entries: [],
        })
      },
      async deleteDiary(name) {
        const toRemove = doc(db, "diary", name);
        await deleteDoc(toRemove);
        for (let i = 0; i < this.userDiaries.length; i++) {
          if (this.userDiaries[i].id === name) {
            this.userDiaries.splice(i, 1);
          }
        }
        this.diaryError = "Diary deleted successfully";
        setTimeout(() => {
          this.diaryError = "";
        }, 3000);
      },
      setOwnerName(name) {
        this.selectedOwnerName = name;
      },
      redirectToProfile() {
        this.$router.push("/profile");
      }
    },
    async mounted() {
      window.vm = this;
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.userId = user.uid;
          //Retrieves all of user's children
          var childrenList = [];
          const childrenRef = collection(db, "users", this.userId, "children");
          const snapshot = await getDocs(childrenRef);
          childrenList = snapshot.docs.map((doc) => ({
            ...doc.data()
          }))
          for (let child of childrenList) {
            this.children.push(child.name);
          }
          //Initialises the diaries collection from Firebase
          const diaries = collection(db, "diary");
          const diarySnapshot = await getDocs(diaries);
          this.dbDiaries = diarySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            entries: [] //Ensures that entries array exists when database data is transferred over
          })).sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
          });
          for (let d of this.dbDiaries) {
            const entries = await this.getEntries(d.id);
            d.entries = entries;
          }
          //Retrieves the user's diaries collection (if any)
          for (let child of this.children) {
            const existingDiary = this.dbDiaries.find(diary => diary.id === child);
            if (!existingDiary) {
              await this.addDiary(child)
            } else if (this.children.includes(existingDiary.id)) {
              this.userDiaries.push(existingDiary);
            }
          }
          this.loading = false;
        } else {
          this.$router.push("/login");
        }
      })
    },
  }
</script>

<style scoped>
.centered-container {
	width: 100%;
	margin: 10px auto;
}

/* Modal Overlay */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2); /* Softer shadow */
    padding: 30px;
    max-width: 400px;
    text-align: center;
    animation: fadeIn 0.3s ease; /* Subtle fade-in animation */
}

.modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 10px;
}

.modal-message {
    font-size: 1rem;
    font-weight: 500;
    color: #555;
    margin-bottom: 15px;
}

.modal-subtext {
    font-size: 0.9rem;
    color: #777;
    margin-bottom: 20px;
}

.modal-button {
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.modal-button:hover {
    background-color: #0056b3; /* Darker blue on hover */
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>