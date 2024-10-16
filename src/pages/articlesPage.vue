<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from "../components/navBar.vue";  // Ensure this component exists and works
import { collection, query, where, getDocs, orderBy } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';  // Correct Firestore imports
import { db } from "../firebaseConfig.js";  // Import the Firestore instance (db)
import dayjs from 'dayjs';  // For date formatting

// Log the Firestore instance to ensure it's properly initialized
console.log("Firestore instance (db):", db);

const route = useRoute();
const articles = ref([]);

// Extract the category from the route parameters (or props)
const category = computed(() => route.params.category || '');

// Function to capitalize the category name
const capitalizeCategory = (cat) => {
  if (!cat) return '';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

// Function to fetch articles from Firebase based on the category
const fetchArticles = async () => {
  try {
    const articlesCollection = collection(db, "articles");

    if (category.value.toLowerCase() === 'new') {
      console.log("Fetching articles from the last month...");

      const oneMonthAgo = new Date();  // Current date
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);  // Subtract 1 month dynamically
      console.log("One month ago:", oneMonthAgo);

      // Query for articles published in the last month using Firestore Timestamp
      const q = query(
        articlesCollection,
        where("Date", ">=", oneMonthAgo)  // Querying directly on the Date field
      );

      const querySnapshot = await getDocs(q);
      console.log("Number of articles fetched:", querySnapshot.docs.length);

      if (!querySnapshot.empty) {
        articles.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          Date: doc.data().Date ? doc.data().Date.toDate().toLocaleDateString() : 'No Date'
        }));

        console.log("Fetched articles:", articles.value);
      } else {
        console.log("No new articles found.");
        articles.value = [];  // No articles found
      }
    } else {
      // Fetch for other categories (activities, education, nutrition)
      const q = query(articlesCollection, where("Filter", "==", capitalizeCategory(category.value)));
      const querySnapshot = await getDocs(q);
      articles.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        Date: doc.data().Date ? doc.data().Date.toDate().toLocaleDateString() : 'No Date'
      }));
    }
  } catch (error) {
    console.error("Error fetching articles:", error.message);
  }
};


// Watch for changes in category and re-fetch articles
watch(category, () => {
  fetchArticles();
}, { immediate: true });

onMounted(fetchArticles);
</script>

<template>
  <NavBar />
  <div class="articles-container">
    <h1>{{ capitalizeCategory(category) }} Articles</h1>
    <div v-if="category">
      <div class="articles-grid">
        <div v-for="article in articles" :key="article.id" class="article-card">
          <h2>{{ article.Title }}</h2>
          <p class="article-date">{{ article.Date }}</p>
          <p>{{ article.Description }}</p>
          <div class="article-meta">
            <span class="likes">Likes: {{ article.Likes }}</span>
            <span class="dislikes">Dislikes: {{ article.Dislikes }}</span>
          </div>
        </div>
      </div>
      <div v-if="articles.length === 0">
        <p>No articles found in {{ capitalizeCategory(category) }}.</p>
      </div>
    </div>
    <div v-else>
      <p>Please select an article category.</p>
    </div>
  </div>
</template>

<style scoped>
.articles-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.articles-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.article-card {
  flex: 1 1 30%; /* Ensures three articles per row */
  background-color: #f5f5f5;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.article-date {
  font-style: italic;
  color: #555;
}

.article-meta {
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.likes, .dislikes {
  margin-right: 10px; /* Adds spacing between likes and dislikes */
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

p {
  font-size: 16px;
  margin-bottom: 10px;
}
</style>
