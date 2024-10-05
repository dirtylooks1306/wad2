<template>
    <div>
      <h1>Firebase Users</h1>
      <ul>
        <li v-for="user in users" :key="user.id">{{ user.username }}</li>
        <li>nigga</li>
      </ul>
    </div>
  </template>
  
  <script>
  // Import Firestore instance from firebaseConfig.js
  import { db } from "../firebaseConfig.js";
  import { getDocs, collection } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
  
  export default {
    data() {
      return {
        users: [] // Data fetched from Firestore
      };
    },
    async mounted() {
      try {
        // Fetch documents from the 'users' collection in Firestore
        const querySnapshot = await getDocs(collection(db, 'users'));
        // Map the documents to this.users array
        this.users = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() // Spread the document data
        }));
      } catch (error) {
        console.error('Error fetching Firestore data:', error);
      }
    }
  };
  </script>
  