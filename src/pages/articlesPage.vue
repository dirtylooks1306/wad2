<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavBar from "../components/navBar.vue";
import CustomHeader from "../components/CustomHeader.vue";
import ToTop from '../components/ToTop.vue';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, increment, runTransaction } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { db, auth } from "../firebaseConfig.js";

const route = useRoute();
const router = useRouter();
const articles = ref([]);
const userReactions = ref({});
const userId = ref(null);
const showArticleForm = ref(false); // Controls form visibility
const newArticle = ref({
  Title: '',
  Author: '',
  Category: '',
  Description: '',
  Paragraphs: [''], // Start with one paragraph
});

const category = computed(() => route.params.category || '');
const isSavedView = computed(() => category.value.toLowerCase() === 'saved');

// List of categories for the dropdown
const categories = ['Activities', 'Education', 'Nutrition'];

// Listen for authentication state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    userId.value = user.uid;
    fetchArticles();
  } else {
    userId.value = null;
    articles.value = [];
  }
});

const capitalizeCategory = (cat) => cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : '';

const fetchArticles = async () => {
  try {
    const articlesCollection = collection(db, "articles");
    let q;

    if (isSavedView.value) {
      q = query(articlesCollection, where("Saved", "==", true));
    } else {
      q = category.value.toLowerCase() === 'new'
        ? query(articlesCollection, where("Date", ">=", new Date(new Date().setMonth(new Date().getMonth() - 1))))
        : query(articlesCollection, where("Filter", "==", capitalizeCategory(category.value)));
    }

    const querySnapshot = await getDocs(q);
    articles.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      Date: doc.data().Date ? doc.data().Date.toDate().toLocaleDateString() : 'No Date'
    }));
  } catch (error) {
    console.error("Error fetching articles:", error.message);
  }
};

// Function to publish a new article
const publishArticle = async () => {
  if (!userId.value || !newArticle.value.Title || !newArticle.value.Author || !newArticle.value.Category || !newArticle.value.Description || !newArticle.value.Paragraphs[0]) return;

  try {
    const articlesCollection = collection(db, "articles");
    const articleData = {
      Title: newArticle.value.Title,
      Author: newArticle.value.Author,
      Filter: newArticle.value.Category,
      Description: newArticle.value.Description,
      Date: new Date(),
      Likes: 0,
      Dislikes: 0,
      Saved: false,
    };
    // Dynamically add paragraphs
    newArticle.value.Paragraphs.forEach((paragraph, index) => {
      if (paragraph) {
        articleData[`Para${index + 1}`] = paragraph;
      }
    });

    await addDoc(articlesCollection, articleData);
    newArticle.value = { Title: '', Author: '', Category: '', Description: '', Paragraphs: [''] }; // Reset form fields
    showArticleForm.value = false; // Close the form
    fetchArticles(); // Refresh articles list
  } catch (error) {
    console.error("Error publishing article:", error.message);
  }
};

// Add a new paragraph field
const addParagraph = () => {
  newArticle.value.Paragraphs.push('');
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
    
    <!-- Article Form -->
    <div v-if="showArticleForm" class="article-form">
      <CustomHeader header="Write a New Article"/>
      <input v-model="newArticle.Title" placeholder="Article Title" required />
      <input v-model="newArticle.Author" placeholder="Author Name" required />
      
      <select v-model="newArticle.Category" required>
        <option disabled value="">Select Category</option>
        <option v-for="cat in categories" :key="cat">{{ cat }}</option>
      </select>
      
      <textarea v-model="newArticle.Description" placeholder="Brief Description" rows="3" required></textarea>
      
      <!-- Paragraphs Section -->
      <div v-for="(paragraph, index) in newArticle.Paragraphs" :key="index">
        <textarea v-model="newArticle.Paragraphs[index]" :placeholder="'Paragraph ' + (index + 1)" rows="4" required></textarea>
      </div>
      
      <button @click="addParagraph" class="btn article-form-button">Add Paragraph</button>
      <button @click="publishArticle" class="btn article-form-button">Publish Article</button>
      <button @click="showArticleForm = false" class="btn article-form-button">Cancel</button>
    </div>
    
    <div v-if="articles.length">
      <div class="articles-grid">
        <div
          v-for="article in articles"
          :key="article.id"
          class="article-card"
          @click="goToArticleDetails(article.id)"
        >
          <h1 class="article-card-title">{{ article.Title }} </h1>

          <div class="article-info">
            <p class="article-author"><b>Author: {{ article.Author || 'Unknown' }}</b></p>
            <p class="article-date">{{ article.Date || 'No Date' }}</p>
          </div>

          <div class="partition-line"></div>
          <p>{{ article.Description || 'No description available' }}</p>
          <div class="partition-line"></div>

          <div class="article-meta">
            <span class="likes">
              <button @click.stop="likeArticle(article.id)" :class="{ active: userReactions[article.id] === 'liked' }">👍</button>
              <span>{{ article.Likes ?? 0 }}</span>
            </span>
            <span class="dislikes">
              <button @click.stop="dislikeArticle(article.id)" :class="{ active: userReactions[article.id] === 'disliked' }">👎</button>
              <span>{{ article.Dislikes ?? 0 }}</span>
            </span>
            <span class="saved">
              <button @click.stop="toggleSaved(article.id)" :class="{ saved: article.Saved }">🔖</button>
            </span>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p>No articles found in {{ capitalizeCategory(category) }}.</p>
    </div>
    
    <ToTop />
    <button @click="showArticleForm = true" class="write-article-button">Write Article</button>
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

.articles-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
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
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5em;
}

.likes, .dislikes {
  display: flex;
  align-items: center;
  gap: 5px;
}

.likes {
  margin-right: 10px;
}

.saved {
  margin-left: auto;
  display: flex;
  align-items: center;
}

button {
  background-color: transparent;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

button.active {
  color: #007bff;
  font-weight: bold;
  background-color: #e6f0ff;
}

button.saved {
  color: #FFD700;
  background-color: #e6f0ff;
}

button:hover {
  background-color: #f0f0f0;
}

.write-article-button {
  position: fixed;
  bottom: 20px;
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
  bottom: 90px;
  right: 20px;
  background-color: #333;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  display: none;
  z-index: 1000;
}
</style>
