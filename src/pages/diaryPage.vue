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
/*
Side Quests:
- Figure out how to remove placeholder if possible
- Modify map marker to be draggable
Top Priority:

*/
</script>
 
<template>
	<NavBar />
  <div class="container-fluid p-3">
    <CustomHeader header="DIARY"/>
    <div class="centered-container">
      <!--
      <h1>Diary Page</h1>
      <p>Insert media and text about your parenting journey here.</p>
      -->
      <div class="diaries">
        <Diary v-for="(diary, i) in userDiaries" 
        :dbDiary="diary" 
        :key="i"
        @deleteEntry="deleteEntry"/>
      </div>
    </div>
    <div class="form-block container-fluid w-100">
      <DiaryForm :entryData="newEntry"
      :diaries="userDiaries" 
      :children="children"
      :entryError="entryError"
      :diaryError="diaryError"
      @submitEntry="submitEntry"
      @addDiary="addDiary"
      @deleteDiary="deleteDiary"/>
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
      }
    },
    methods: {
      async submitEntry(formData) {
        //console.log(formData); //Debugging image path
        //Part 1: Retrieve form data and assign variables
        const diaryOwner = formData.name;
        //console.log(this.newEntry); //Ensure form data is successfully retrieved
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
              await this.deletePlaceholder(diaryOwner);
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
              }) //Bug happens when new entry is submitted while diary is in closed state -> Paper overlaps the Next Page button but works as per normal after button is pressed
            };
            this.entryError = "Entry successfully added!";
            setTimeout(() => {
              this.entryError = "";
            }, 3000);   
          }
        }
      },
      async deleteEntry(name, index) {
        //console.log(name, index); //Ensure that name and entry is correct
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
        //console.log(entries); //Entries successfully retrieved
        return entries; // Returns value of entries array to be used in mounted function
      },
      async addDiary(name) {
        //Check first if diary already exists for the selected person
        for (let d of this.userDiaries) {
          if (d.id === name) {
            this.diaryError = "Diary already exists!";
            setTimeout(() => {
              this.diaryError = "";
            }, 3000);
            return; //Exit the function if diary exists, stops repeated addition of identical diaries
          }
        }
        //If diary does not exist, proceed with creating the new diary
        const newDiary = doc(db, "diary", name);
        await setDoc(newDiary, { created: true }); //Create new path for new diary owner
        
        const newEntries = collection(newDiary, "Entries");
        const placeholder = doc(newEntries, "Placeholder");
        await setDoc(placeholder, { empty: true }) //Create subcollection with placeholder
        //Update dbDiaries
        this.userDiaries.push({
          id: name,
          entries: [],
        })
        this.diaryError = "Diary added successfully";
        setTimeout(() => {
          this.diaryError = "";
        }, 3000);
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
      async deletePlaceholder(name) {
        for (let d of this.userDiaries) {
          if (d.id === name) {
            const entries = d.entries;
            for (let entry of entries) {
              if (entry.id === 'Placeholder') {                
                const deletePlaceholder = doc(db, "diary", name, "Entries", entry.id);
                await deleteDoc(deletePlaceholder);
                d.entries.splice(d.entries.indexOf(entry), 1);
              }
            }
          }
        }
      }
    },
    async mounted() {
      window.vm = this;
      //console.log(storage); //Storage works
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.userId = user.uid;
          //console.log(user.uid); //Check whether user ID is obtained
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
          this.loading = false;
          for (let d of this.dbDiaries) {
            const entries = await this.getEntries(d.id);
            d.entries = entries;
          }
          //Retrieves the user's diaries collection (if any)
          for (let d of this.dbDiaries) {
            if (this.children.includes(d.id)) {
              this.userDiaries.push(d)
            }
          }
          //console.log(this.userDiaries); //Ensures the diaries database is populated
          return this.userDiaries //Ensure the return of user's diaries
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
</style>