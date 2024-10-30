<script setup>
import NavBar from "../components/navBar.vue";
import CustomHeader from "../components/CustomHeader.vue";
import Diary from "../components/Diary.vue";
import DiaryForm from '../components/diaryForm.vue';
/*
To Do:
- Work on static storage of diary contents (Done)
- Figure out how to make flippable diary in Vue component (Done)
- Make diary pages into a Vue component that changes its paper ID for each 2 new entries (Done)
(E.g. Paper 1 has entries 1&2, Paper 2 has entries 3&4, etc.)
- Make a form for users to submit new diary entries (Done)
- Turn storage of diaries into dynamic storage
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
        <Diary v-for="(diary, i) in diaries" 
        :diary="diary" 
        :key="i"/>
      </div>
    </div>
    <div class="form-block container-fluid w-100">
      <CustomHeader header="SUBMIT A NEW ENTRY"/>
      <DiaryForm :entryData="newEntry" @submitEntry="submitEntry"/>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'diaryPage',
    components: {
      Diary,
      DiaryForm,
    },
    data() {
      return {
        // Static storage of diaries, KEEP NAMING CONVENTIONS
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
        newEntry: {},
      }
    },
    methods: {
      submitEntry(formData) {
        this.newEntry = formData
        console.log(this.newEntry); //Ensure form data is successfully retrieved
      }
    }
  }
</script>

<style scoped>
.centered-container {
	width: 100%;
	margin: 10px auto;
}
</style>