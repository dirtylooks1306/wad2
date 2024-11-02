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
} from "../firebaseConfig.js";
import { orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
/*
To Do:
- Figure out how to add subcollections to Firebase (Done, figure out how to remove placeholder)
- Change button animations when webpage accessed from mobile (2nd priority) -> Try @media / Change JS functions to check if class is desktop or mobile
- Add button animations for form component -> Refer to Emergency Page for button CSS
- Integrate login guard into diary page
*/

/*
Plan:
1) Make a flippable diary within each collapsible
  - Fit the diary's contents into each page using page component
  - Header and content to be changed for each new page
2) Take data from Firebase
  - Contents of diary will be ported to Page component, diary owner's name will remain in Diary Conponent
3) Form will take in new entries
  - Form parameters are: Date of Entry, Entry Name (header), Entry Body (content) -> Body has max character limit of 395 characters
  - New entry info added into Firebase via addDocs function
4) Button to delete existing entries
  - Tag each entry to a unique ID
  - Once users click on the delete button, entry removed via removeDocs function
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
        <Diary v-for="(diary, i) in dbDiaries" 
        :dbDiary="diary" 
        :key="i"
        @deleteEntry="deleteEntry"/>
      </div>
    </div>
    <div class="form-block container-fluid w-100">
      <CustomHeader header="SUBMIT A NEW ENTRY"/>
      <DiaryForm :entryData="newEntry"
      :diaries="dbDiaries" 
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
        dbDiaries: [],
        // Static storage of diaries, KEEP NAMING CONVENTIONS
        /*
        diaries: [
          { name: 'Jason',   
            entries: [
              { header: 'Baby spoke his first words!', body: 'A', date: '10/5/2024' },
              { header: 'day2', body: 'B', date: '14/5/2024' },
              { header: 'day3', body: 'C', date: '16/5/2024' },
              { header: 'day4', body: 'D', date: '18/5/2024' },
              { header: 'day5', body: 'E', date: '24/5/2024' },
              { header: 'day6', body: 'F', date: '29/5/2024' },
              { header: 'day7', body: 'G', date: '1/6/2024' },
              { header: 'day8', body: 'H', date: '6/6/2024' },
              { header: 'day9', body: 'I', date: '10/6/2024' },
            ]
          },
          { name: 'Michael', 
            entries: [
              { header: 'day1', body: 'urmumgae', date: '1/8/2024' },
              { header: 'day2', body: 'no u', date: '10/8/2024' },
            ] 
          },
        ],
        */
        newEntry: {},
      }
    },
    methods: {
      async submitEntry(formData) {
        //Part 1: Retrieve form data and assign variables
        const diaryOwner = formData.name;
        //console.log(this.newEntry); //Ensure form data is successfully retrieved
        //Part 2: Update database with new entry
        for (let d of this.dbDiaries) {
          if (d.id === diaryOwner) {
            //if-loop only when diary is first initialised -> Removes placeholder with actual entry
            if (d.entries.length === 1 && d.entries[0].id === "Placeholder") {
              const id = "Entry 001"
              const entry = {
                body: formData.body,
                date: formData.date ? new Date(formData.date) : null,
                header: formData.header
              }
              const newDiaryEntry = doc(db, "diary", diaryOwner, "Entries", id)
              await setDoc(newDiaryEntry, entry)
              this.deletePlaceholder(diaryOwner);
              d.entries.push({
                id: id,
                ...this.entry,
                date: this.newEntry.date ? this.newEntry.date.toLocaleDateString() : 'No Date',
              })
            }
            else {
              const entryId = String(d.entries.length + 1).padStart(3, '0'); //Firebase sorts path names ALPHABETICALLY
              //Add new entry into Firebase
              const newEntryRef = doc(db, "diary", diaryOwner, "Entries", `Entry ${entryId}`);
              this.newEntry = {
                body: formData.body,
                date: formData.date ? new Date(formData.date) : null, //Convert date string to Timestamp object
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
            }
            alert("Entry successfully added!")    
          }
        }
      },
      async deleteEntry(name, index) {
        //console.log(name, index); //Ensure that name and entry is correct
        for (let d of this.dbDiaries) {
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
        }))
        //console.log(entries); //Entries successfully retrieved
        return entries; // Returns value of entries array to be used in mounted function
      },
      async addDiary(name) {
        const newDiary = doc(db, "diary", name);
        await setDoc(newDiary, { created: true }); //Create new path for new diary owner
        
        const newEntries = collection(newDiary, "Entries");
        const placeholder = doc(newEntries, "Placeholder");
        await setDoc(placeholder, { empty: true }) //Create subcollection with placeholder
        //Update dbDiaries
        this.dbDiaries.push({
          id: name,
          entries: [],
        })
      },
      async deleteDiary(name) {
        const toRemove = doc(db, "diary", name);
        await deleteDoc(toRemove);
        for (let i = 0; i < this.dbDiaries.length; i++) {
          if (this.dbDiaries[i].id === name) {
            this.dbDiaries.splice(i, 1);
          }
        }
      },
      async deletePlaceholder(name) {
        for (let d of this.dbDiaries) {
          if (d.id === name) {
            const entries = d.entries;
            for (let entry of entries) {
              if (entry.id === 'Placeholder') {
                d.entries.splice(d.entries.indexOf(entry), 1);
                
                const deletePlaceholder = doc(db, "diary", name, "Entries", entry.id);
                await deleteDoc(deletePlaceholder);
              }
            }
          }
        }
      }
    },
    async mounted() {
      window.vm = this;
      //alert("If you're using this feature from a mobile phone, it is recommended to view the page in landscape mode!"); // Temporary alert
      /*
      // Check user authentication on component mount
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.userId = user.uid; // Set userId to the logged-in user’s UID
          // Get the user's tracking info data from Firebase
          await this.fetchChildrenNames();
          const userPostsRefGet = collection(db, "users", this.userId, "posts");
          const snapshot = await getDocs(userPostsRefGet);

          // Map and sort the posts data
          this.posts = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              return dateA - dateB;
            });

          // Set loading to false and initialize charts
          this.loading = false;
          this.sortPosts();
          await this.fetchPosts();
          this.toggleCharts();
        } else {
          // Redirect to login if no user is found
          this.$router.push("/login");
        }
      });
      */
      const diaries = collection(db, "diary");
      const snapshot = await getDocs(diaries);
      this.dbDiaries = snapshot.docs.map((doc) => ({
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
      console.log(this.dbDiaries); //Ensures the diaries database is populated
      return this.dbDiaries //Ensure the return of populated database
    },
  }
</script>

<style scoped>
.centered-container {
	width: 100%;
	margin: 10px auto;
}
</style>