<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from "../components/navBar.vue";
import { doc, getDoc, updateDoc, increment, runTransaction } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { db, auth } from "../firebaseConfig.js"; 

const route = useRoute();
const article = ref(null);
const paragraphs = ref([]);
const userReaction = ref(null);
const userId = ref(null);

const fetchArticleDetails = async () => {
  try {
    const articleId = route.params.id;
    const articleRef = doc(db, "articles", articleId);
    const articleDoc = await getDoc(articleRef);

    if (articleDoc.exists()) {
      article.value = articleDoc.data();
      article.value.id = articleId;
      paragraphs.value = article.value.Content || [];

      if (userId.value) {
        const reactionRef = doc(db, "articles", articleId, "reactions", userId.value);
        const reactionDoc = await getDoc(reactionRef);
        userReaction.value = reactionDoc.exists() ? reactionDoc.data().type : null;
      }
    } else {
      console.warn("Article not found in Firestore.");
    }
  } catch (error) {
    console.error("Error fetching article details:", error);
  }
};

const toggleSave = async () => {
  if (!userId.value || !article.value) return;

  try {
    const articleRef = doc(db, "articles", article.value.id);
    const newSaveStatus = !article.value.Saved;
    await updateDoc(articleRef, { Saved: newSaveStatus });
    article.value.Saved = newSaveStatus;
  } catch (error) {
    console.error("Error toggling save status:", error);
  }
};

const likeArticle = async () => {
  if (!userId.value || !article.value) return;
  try {
    await runTransaction(db, async (transaction) => {
      const articleRef = doc(db, "articles", article.value.id);
      const reactionRef = doc(db, "articles", article.value.id, "reactions", userId.value);

      const articleSnapshot = await transaction.get(articleRef);
      const reactionSnapshot = await transaction.get(reactionRef);

      const currentLikes = articleSnapshot.data().Likes || 0;
      const currentReaction = reactionSnapshot.exists() ? reactionSnapshot.data().type : null;

      if (currentReaction === 'liked') {
        transaction.update(articleRef, { Likes: increment(-1) });
        transaction.delete(reactionRef);
        article.value.Likes -= 1;
        userReaction.value = null;
      } else {
        if (currentReaction === 'disliked') {
          transaction.update(articleRef, { Dislikes: increment(-1) });
          article.value.Dislikes -= 1;
        }
        transaction.update(articleRef, { Likes: increment(1) });
        transaction.set(reactionRef, { type: 'liked' });
        article.value.Likes += 1;
        userReaction.value = 'liked';
      }
    });
  } catch (error) {
    console.error("Error updating likes:", error);
  }
};

const dislikeArticle = async () => {
  if (!userId.value || !article.value) return;

  try {
    await runTransaction(db, async (transaction) => {
      const articleRef = doc(db, "articles", article.value.id);
      const reactionRef = doc(db, "articles", article.value.id, "reactions", userId.value);

      const articleSnapshot = await transaction.get(articleRef);
      const reactionSnapshot = await transaction.get(reactionRef);

      const currentDislikes = articleSnapshot.data().Dislikes || 0;
      const currentReaction = reactionSnapshot.exists() ? reactionSnapshot.data().type : null;

      if (currentReaction === 'disliked') {
        transaction.update(articleRef, { Dislikes: increment(-1) });
        transaction.delete(reactionRef);
        article.value.Dislikes -= 1;
        userReaction.value = null;
      } else {
        if (currentReaction === 'liked') {
          transaction.update(articleRef, { Likes: increment(-1) });
          article.value.Likes -= 1;
        }
        transaction.update(articleRef, { Dislikes: increment(1) });
        transaction.set(reactionRef, { type: 'disliked' });
        article.value.Dislikes += 1;
        userReaction.value = 'disliked';
      }
    });
  } catch (error) {
    console.error("Error updating dislikes:", error);
  }
};

onMounted(() => {
  auth.onAuthStateChanged((user) => {
    userId.value = user ? user.uid : null;
    fetchArticleDetails();
  });
});
</script>

<template>
  <NavBar />
  <div class="article-details-container" v-if="article">
    <h1 class="article-title">{{ article.Title }}</h1>
    <p class="article-author"><b><i>Author: {{ article.Author }}</i></b></p>
    <p class="article-date">{{ article.Date ? article.Date.toDate().toLocaleDateString() : 'No Date' }}</p>
    
    <img v-if="article.ImageUrl" :src="article.ImageUrl" alt="Article Image" class="article-image" />

    <div class="partition-line"></div>

    <div v-for="(paragraph, index) in paragraphs" :key="index" class="article-paragraph">
      <p>{{ paragraph }}</p>
    </div>

    <div class="partition-line"></div>

    <div class="article-meta">
      <span class="likes">
        <button @click="likeArticle" :class="{ active: userReaction === 'liked' }">
          <i class="fas fa-thumbs-up"></i>
        </button>
        <span>{{ article.Likes }}</span>
      </span>
      <span class="dislikes">
        <button @click="dislikeArticle" :class="{ active: userReaction === 'disliked' }">
          <i class="fas fa-thumbs-down"></i>
        </button>
        <span>{{ article.Dislikes }}</span>
      </span>
      <span class="saved">
        <button @click="toggleSave" :class="{ saved: article.Saved }">
          <i class="fas fa-bookmark"></i>
        </button>
      </span>
    </div>
  </div>
  <p v-else>Loading article...</p>
</template>

<style scoped>
.article-details-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background-color: #ffffff;
  color: #333333;
  line-height: 1.6;
  transition: color 0.3s, background-color 0.3s;
}

.article-title {
  text-align: center;
  font-size: 24px;
  color: #ff9689;
  font-family: "Cherry Bomb", sans-serif;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  position: relative;
  margin: 0.5em 0;
}

.article-title::after {
  content: '';
  display: block;
  width: 60%;
  height: 4px;
  background-color: #ff9689;
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 2px;
}

.article-author, .article-date {
  text-align: center;
  font-size: 1em;
  color: #555;
  margin-bottom: 1em;
}

.article-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 10px 0;
  object-fit: cover;
}

.partition-line {
  width: 100%;
  height: 4px;
  background-color: #ff9689;
  margin: 1em 0;
  border-radius: 2px;
}

.article-paragraph {
  margin-bottom: 1.5em;
  text-align: justify;
  font-size: 1.1em;
}

.article-meta {
  display: flex;
  gap: 10px;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.likes, .dislikes {
  display: flex;
  align-items: center;
  gap: 10px;
}

.saved {
  margin-left: auto;
  display: flex;
  align-items: center;
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

button.saved i {
  color: #FFD700;
}

button:hover i {
  color: #0056b3;
}

.article-meta i {
  font-size: 1.2em;
  margin-right: 5px;
}
</style>
