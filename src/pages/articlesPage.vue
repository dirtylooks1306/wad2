<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from "../components/navBar.vue";
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { db } from "../firebaseConfig.js";
import dayjs from 'dayjs';

const route = useRoute();
const articles = ref([]);

// Track user reactions to each article (like/dislike)
const userReactions = ref({});

const category = computed(() => route.params.category || '');

const capitalizeCategory = (cat) => {
  if (!cat) return '';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

const fetchArticles = async () => {
  try {
    const articlesCollection = collection(db, "articles");

    if (category.value.toLowerCase() === 'new') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const q = query(articlesCollection, where("Date", ">=", oneMonthAgo));
      const querySnapshot = await getDocs(q);
      articles.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        Date: doc.data().Date ? doc.data().Date.toDate().toLocaleDateString() : 'No Date'
      }));
    } else {
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

// Toggle like for an article
const likeArticle = async (articleId) => {
  try {
    const articleRef = doc(db, "articles", articleId);
    const article = articles.value.find(a => a.id === articleId);

    if (userReactions.value[articleId] === 'liked') {
      // Unlike the article
      await updateDoc(articleRef, { Likes: (article.Likes || 0) - 1 });
      article.Likes -= 1;
      userReactions.value[articleId] = null;
    } else {
      // Like the article and undo dislike if previously disliked
      if (userReactions.value[articleId] === 'disliked') {
        await updateDoc(articleRef, { Dislikes: (article.Dislikes || 0) - 1 });
        article.Dislikes -= 1;
      }
      await updateDoc(articleRef, { Likes: (article.Likes || 0) + 1 });
      article.Likes += 1;
      userReactions.value[articleId] = 'liked';
    }
  } catch (error) {
    console.error("Error updating likes:", error.message);
  }
};

// Toggle dislike for an article
const dislikeArticle = async (articleId) => {
  try {
    const articleRef = doc(db, "articles", articleId);
    const article = articles.value.find(a => a.id === articleId);

    if (userReactions.value[articleId] === 'disliked') {
      // Undislike the article
      await updateDoc(articleRef, { Dislikes: (article.Dislikes || 0) - 1 });
      article.Dislikes -= 1;
      userReactions.value[articleId] = null;
    } else {
      // Dislike the article and undo like if previously liked
      if (userReactions.value[articleId] === 'liked') {
        await updateDoc(articleRef, { Likes: (article.Likes || 0) - 1 });
        article.Likes -= 1;
      }
      await updateDoc(articleRef, { Dislikes: (article.Dislikes || 0) + 1 });
      article.Dislikes += 1;
      userReactions.value[articleId] = 'disliked';
    }
  } catch (error) {
    console.error("Error updating dislikes:", error.message);
  }
};

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
            <span class="likes">
              <button 
                @click="likeArticle(article.id)" 
                :class="{ active: userReactions[article.id] === 'liked' }">
                👍
              </button>
              Likes: {{ article.Likes }}
            </span>
            <span class="dislikes">
              Dislikes: {{ article.Dislikes }}
              <button 
                @click="dislikeArticle(article.id)" 
                :class="{ active: userReactions[article.id] === 'disliked' }">
                👎
              </button>
            </span>
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
.article-meta button.active {
  font-weight: bold;
  color: #007bff;
}
</style>
