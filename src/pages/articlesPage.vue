<script setup>
import { onMounted, ref, reactive, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavBar from "../components/navBar.vue";
import CustomHeader from "../components/CustomHeader.vue";
import ToTop from '../components/ToTop.vue';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, increment, runTransaction, Timestamp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { db, auth, getDoc } from "../firebaseConfig.js";

const route = useRoute();
const router = useRouter();
const articles = ref([]);
const userReactions = ref({});
const userId = ref(null);
const userRole = ref(null);
const showArticleForm = ref(false); // Controls form visibility

// Initialize newArticle with a default structure using reactive to handle nested properties
const newArticle = reactive({
  Title: '',
  Author: '',
  Category: '',
  Description: '',
  Content: [''] // Initialize Content as an array with one empty string
});

// New state for sorting options
const sortOption = ref('date');

// Options for sorting
const sortOptions = {
  likes: 'Likes (Descending)',
  date: 'Date (Newest First)',
};

const category = computed(() => route.params.category || '');
const isSavedView = computed(() => category.value.toLowerCase() === 'saved');

// List of categories for the dropdown
const categories = ['Activities', 'Education', 'Nutrition'];

// Listen for authentication state changes
auth.onAuthStateChanged(async (user) => {
  if (user) {
    userId.value = user.uid;
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      console.log(userDoc.data().role);
      userRole.value = userDoc.data().role;
    } 
    fetchArticles();
  } else {
    userId.value = null;
    articles.value = [];
  }
});

const capitalizeCategory = (cat) => cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : '';

// Function to fetch and sort articles based on the selected sorting option
const fetchArticles = async () => {
  try {
    const articlesCollection = collection(db, "articles");
    let q;

    if (isSavedView.value) {
      q = query(articlesCollection, where("Saved", "==", true));
    } else {
      q = category.value.toLowerCase() === 'new'
        ? query(articlesCollection, where("Date", ">=", Timestamp.fromDate(new Date(new Date().setMonth(new Date().getMonth() - 1)))))
        : query(articlesCollection, where("Filter", "==", capitalizeCategory(category.value)));
    }

    const querySnapshot = await getDocs(q);
    articles.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      Date: doc.data().Date instanceof Timestamp 
        ? doc.data().Date.toMillis() 
        : new Date(doc.data().Date).getTime() // Convert string dates to milliseconds for sorting
    }));

    // Apply sorting
    sortArticles();
  } catch (error) {
    console.error("Error fetching articles:", error.message);
  }
};

// Function to sort articles based on the selected sorting option
const sortArticles = () => {
  if (sortOption.value === 'likes') {
    articles.value.sort((a, b) => (b.Likes ?? 0) - (a.Likes ?? 0));
  } else if (sortOption.value === 'date') {
    articles.value.sort((a, b) => b.Date - a.Date); // Sort by Date in descending order
  }
};

// Computed property to format the date for display
const formattedArticles = computed(() => {
  return articles.value.map(article => ({
    ...article,
    displayDate: new Date(article.Date).toLocaleDateString() // Format date for display
  }));
});

// Update sorting when the sort option changes
watch(sortOption, sortArticles);

// Function to publish a new article
const publishArticle = async () => {
  if (!userId.value || !newArticle.Title || !newArticle.Author || !newArticle.Category || !newArticle.Description || !newArticle.Content[0]) return;

  try {
    const articlesCollection = collection(db, "articles");
    const articleData = {
      Title: newArticle.Title,
      Author: newArticle.Author,
      Filter: newArticle.Category,
      Description: newArticle.Description,
      Date: Timestamp.fromDate(new Date()), // Store date as a Firestore Timestamp
      Likes: 0,
      Dislikes: 0,
      Saved: false,
      Content: newArticle.Content // Store all paragraphs in the Content array
    };

    await addDoc(articlesCollection, articleData);
    // Reset form fields after publishing
    Object.assign(newArticle, { Title: '', Author: '', Category: '', Description: '', Content: [''] });
    showArticleForm.value = false; // Close the form
    fetchArticles(); // Refresh articles list
  } catch (error) {
    console.error("Error publishing article:", error.message);
  }
};

// Function to handle Enter key in content input field
const handleContentEnter = (event, index) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent new line in the current text area
    if (newArticle.Content[index]) {
      newArticle.Content.splice(index + 1, 0, ''); // Insert new empty content block after the current one
    }
  }
};

// Toggle save status
const toggleSaved = async (articleId) => {
  if (!userId.value) return;

  try {
    const articleRef = doc(db, "articles", articleId);
    const article = articles.value.find(a => a.id === articleId);
    const newSavedStatus = !article.Saved;

    await updateDoc(articleRef, { Saved: newSavedStatus });
    article.Saved = newSavedStatus;

    if (isSavedView.value) fetchArticles();
  } catch (error) {
    console.error("Error toggling saved status:", error.message);
  }
};

const goToArticleDetails = (articleId) => {
  router.push({ name: 'ArticleDetails', params: { id: articleId } });
};

const likeArticle = async (articleId) => {
  if (!userId.value) return;

  await runTransaction(db, async (transaction) => {
    const articleRef = doc(db, "articles", articleId);
    const reactionRef = doc(db, "articles", articleId, "reactions", userId.value);
    const article = articles.value.find(a => a.id === articleId);

    const articleSnapshot = await transaction.get(articleRef);
    const reactionSnapshot = await transaction.get(reactionRef);

    const currentLikes = articleSnapshot.data().Likes || 0;
    const currentReaction = reactionSnapshot.exists() ? reactionSnapshot.data().type : null;

    if (currentReaction === 'liked') {
      transaction.update(articleRef, { Likes: increment(-1) });
      transaction.delete(reactionRef);
      article.Likes -= 1;
      userReactions.value[articleId] = null;
    } else {
      if (currentReaction === 'disliked') {
        transaction.update(articleRef, { Dislikes: increment(-1) });
        article.Dislikes -= 1;
      }
      transaction.update(articleRef, { Likes: increment(1) });
      transaction.set(reactionRef, { type: 'liked' });
      article.Likes += 1;
      userReactions.value[articleId] = 'liked';
    }
  });
};

const dislikeArticle = async (articleId) => {
  if (!userId.value) return;

  await runTransaction(db, async (transaction) => {
    const articleRef = doc(db, "articles", articleId);
    const reactionRef = doc(db, "articles", articleId, "reactions", userId.value);
    const article = articles.value.find(a => a.id === articleId);

    const articleSnapshot = await transaction.get(articleRef);
    const reactionSnapshot = await transaction.get(reactionRef);

    const currentDislikes = articleSnapshot.data().Dislikes || 0;
    const currentReaction = reactionSnapshot.exists() ? reactionSnapshot.data().type : null;

    if (currentReaction === 'disliked') {
      transaction.update(articleRef, { Dislikes: increment(-1) });
      transaction.delete(reactionRef);
      article.Dislikes -= 1;
      userReactions.value[articleId] = null;
    } else {
      if (currentReaction === 'liked') {
        transaction.update(articleRef, { Likes: increment(-1) });
        article.Likes -= 1;
      }
      transaction.update(articleRef, { Dislikes: increment(1) });
      transaction.set(reactionRef, { type: 'disliked' });
      article.Dislikes += 1;
      userReactions.value[articleId] = 'disliked';
    }
  });
};

watch(category, fetchArticles, { immediate: true });

onMounted(fetchArticles);
</script>

<template>
  <NavBar />
  <div class="articles-container">
    <h1 class="article-title">{{ capitalizeCategory(category) }} Articles</h1>

    <!-- Write Article Form -->
    <div v-if="showArticleForm" class="article-form">
      <CustomHeader header="Write a New Article"/>
      <input v-model="newArticle.Title" placeholder="Article Title" required />
      <input v-model="newArticle.Author" placeholder="Author Name" required />
      
      <select v-model="newArticle.Category" required>
        <option disabled value="">Select Category</option>
        <option v-for="cat in categories" :key="cat">{{ cat }}</option>
      </select>
      
      <textarea v-model="newArticle.Description" placeholder="Brief Description" rows="3" required></textarea>
      
      <!-- Content Section -->
      <div v-for="(paragraph, index) in newArticle.Content" :key="index">
        <textarea 
          v-model="newArticle.Content[index]" 
          :placeholder="'Content'" 
          rows="4" 
          @keydown="handleContentEnter($event, index)" 
          required>
        </textarea>
      </div>
      
      <button @click="publishArticle" class="btn article-form-button">Publish Article</button>
      <button @click="showArticleForm = false" class="btn article-form-button">Cancel</button>
    </div>

    <!-- Sort Options -->
    <div class="sort-container">
      <CustomHeader header="Sort By:" />
      <div class="sort-dropdown">
        <select id="sort" v-model="sortOption">
          <option value="date">{{ sortOptions.date }}</option>
          <option value="likes">{{ sortOptions.likes }}</option>
        </select>
      </div>
    </div>

    <div v-if="formattedArticles.length" class="articles-grid">
      <div
        v-for="article in formattedArticles"
        :key="article.id"
        class="article-card"
        @click="goToArticleDetails(article.id)"
      >
        <h1 class="article-card-title">{{ article.Title }}</h1>

        <div class="article-info">
          <p class="article-author"><b>Author: {{ article.Author || 'Unknown' }}</b></p>
          <p class="article-date">{{ article.displayDate || 'No Date' }}</p>
        </div>

        <div class="partition-line"></div>
        <p>{{ article.Description || 'No description available' }}</p>
        <div class="partition-line"></div>

        <div class="article-meta">
          <span class="reaction">
            <button @click.stop="likeArticle(article.id)" :class="{ active: userReactions[article.id] === 'liked' }">
              <i class="fas fa-thumbs-up"></i>
            </button>
            <span class="reaction-count">{{ article.Likes ?? 0 }}</span>
          </span>
          <span class="reaction">
            <button @click.stop="dislikeArticle(article.id)" :class="{ active: userReactions[article.id] === 'disliked' }">
              <i class="fas fa-thumbs-down"></i>
            </button>
            <span class="reaction-count">{{ article.Dislikes ?? 0 }}</span>
          </span>
        </div>

        <div class="saved">
          <button @click.stop="toggleSaved(article.id)" :class="{ saved: article.Saved }">
            <i class="fas fa-bookmark"></i>
          </button>
        </div>
      </div>
    </div>
    <div v-else>
      <p>No articles found in {{ capitalizeCategory(category) }}.</p>
    </div>
    
    <!-- "Back to Top" and "Write Article" buttons -->
    <ToTop />
    <button v-if="userRole === 'admin'" @click="showArticleForm = true" class="write-article-button">
      Write Article
    </button>

  </div>
</template>

<style scoped>
.article-title {
  text-align: center;
  font-size: 32px;
  color: #ff9689;
  font-family: "Cherry Bomb", sans-serif;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0.5em 0;
}

.articles-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.sort-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}

.sort-dropdown select {
  padding: 8px 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f5f5f5;
  color: #555;
  cursor: pointer;
  transition: border-color 0.3s;
}

.sort-dropdown select:focus {
  outline: none;
  border-color: #ff9689;
}

.articles-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.article-card {
  flex: 1 1 30%;
  background-color: #f5e1e1;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.article-card:hover {
  transform: scale(1.02);
}

.article-card-title {
  text-align: center;
  font-size: 18px;
  color: #ff9689;
  font-family: "Cherry Bomb", sans-serif;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0.5em 0;
}

.article-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.article-author {
  font-style: italic;
  color: #555;
  margin: 0;
}

.article-date {
  color: #555;
  margin: 0;
  font-size: 0.9em;
}

.partition-line {
  width: 100%;
  height: 2px;
  background-color: #ff9689;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  border-radius: 2px;
}

.article-meta {
  display: flex;
  gap: 12px;
  position: absolute;
  bottom: 10px;
  left: 10px;
  align-items: center;
}

.reaction {
  display: flex;
  align-items: center;
  gap: 3px;
}

.reaction-count {
  font-size: 0.9em;
  color: #555;
}

button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: #555;
  font-size: 1.2em;
}

button.active i {
  color: #007bff;
}

.saved {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 10px;
}

button.saved i {
  color: #FFD700;
}

button:hover i {
  color: #0056b3;
}

.write-article-button {
  position: fixed;
  top: 90px;
  right: 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 12px;
  cursor: pointer;
  font-size: 16px;
  font-family: "Cherry Bomb", sans-serif;
}

.write-article-button:hover {
  background-color: #0056b3;
}

.article-form {
  background-color: transparent;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.article-form input,
.article-form textarea,
.article-form select {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  color: inherit;
}

.article-form input::placeholder,
.article-form textarea::placeholder,
.article-form select::placeholder {
  color: inherit;
}

.article-form button {
  margin-right: 10px;
}

.article-form button.article-form-button {
  color: #fff;
  background-color: #007bff;
  border: none;
  font-size: 16px;
  font-family: "Cherry Bomb", sans-serif;
}

.article-form button.article-form-button:hover {
  background-color: #0056b3;
}

#to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #333;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  z-index: 1000;
}
</style>
