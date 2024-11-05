<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavBar from "../components/navBar.vue";
import CustomHeader from "../components/CustomHeader.vue";
import { collection, query, where, getDocs, doc, updateDoc, increment, runTransaction } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { db, auth } from "../firebaseConfig.js";

const route = useRoute();
const router = useRouter();
const articles = ref([]);
const userReactions = ref({});
const userId = ref(null);

const category = computed(() => route.params.category || '');
const isFavouriteView = computed(() => category.value.toLowerCase() === 'favourite');

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

    if (isFavouriteView.value) {
      q = query(articlesCollection, where("Favourited", "==", true));
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

const toggleFavourite = async (articleId) => {
  if (!userId.value) return;

  try {
    const articleRef = doc(db, "articles", articleId);
    const article = articles.value.find(a => a.id === articleId);
    const newFavouriteStatus = !article.Favourited;

    await updateDoc(articleRef, { Favourited: newFavouriteStatus });
    article.Favourited = newFavouriteStatus;

    if (isFavouriteView.value) fetchArticles();
  } catch (error) {
    console.error("Error toggling favourite:", error.message);
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
    <div v-if="articles.length">
      <div class="articles-grid">
        <div
          v-for="article in articles"
          :key="article.id"
          class="article-card"
          @click="goToArticleDetails(article.id)"
        >
          <CustomHeader :header="article.Title || 'Untitled'" />

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
            <span class="favourite">
              <button @click.stop="toggleFavourite(article.id)" :class="{ favourited: article.Favourited }">⭐</button>
            </span>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p>No articles found in {{ capitalizeCategory(category) }}.</p>
    </div>
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

/* Partition Line Styling */
.partition-line {
  width: 100%;
  height: 2px;
  background-color: #ff9689;
  margin-top: 0.5em; /* Minimized space above the partition line */
  margin-bottom: 0.5em; /* Minimized space below the partition line */
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

.favourite {
  margin-left: auto;
  display: flex;
  align-items: center;
}

/* Button styling */
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

button.favourited {
  color: #FFD700;
  background-color: #e6f0ff;
}

button:hover {
  background-color: #f0f0f0;
}
</style>
