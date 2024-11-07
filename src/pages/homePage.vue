<template>
  <NavBar />
  <header>
    <div class="jumbotron header_class">
      <div class="row">
        <div class="col-md-6 header">
          <div class="title-class text-end">
            <span class="line-1">Empowering Parents</span><br />
            <span class="line-2">Nurturing Futures</span>
          </div>
          <br />
          <router-link to="/diary">
            <button class="btn btn-primary">Get Started</button>
          </router-link>
        </div>
        <div class="col-md-6">
          <img src="../assets/HomeMasthead.svg" alt="baby" />
        </div>
      </div>
    </div>
  </header>
  <div class="secondary-background p-3">
    <div class="container-fluid">
      <CustomHeader header="Article" />
      <h2>TRENDING ARTICLES</h2>
      <Carousel :items="carouselItems" @item-click="goToArticleDetails" />
    </div>
  </div>

  <!-- Remaining sections unchanged -->

  <footer>
    <p class="text-center">CradleCare © 2024</p>
  </footer>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { collection, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { db } from "../firebaseConfig.js";  // Import Firestore instance
import CustomHeader from "../components/CustomHeader.vue";
import Carousel from "../components/Carousel.vue";
import NavBar from "../components/navBar.vue";
import { useRouter } from 'vue-router';

const router = useRouter();
const carouselItems = ref([]);

// Function to fetch top 3 articles by Likes
const fetchTopArticles = async () => {
try {
  const articlesCollection = collection(db, "articles");
  const q = query(articlesCollection, orderBy("Likes", "desc"), limit(3));
  const querySnapshot = await getDocs(q);

  carouselItems.value = querySnapshot.docs.map(doc => ({
    id: doc.id, // Add the document ID to the item
    title: doc.data().Title || "Untitled",
    description: doc.data().Description || "No description available.",
    image: doc.data().ImageURL || "src/assets/placeholder.svg",  // Ensure there is an ImageURL field or use a placeholder
    alt: doc.data().Alt || "Article Image",  // Placeholder alt text
    icon1: "src/assets/heart.svg",  // Static icon paths as defined in carousel component
    icon2: "src/assets/bookmark.svg"
  }));
} catch (error) {
  console.error("Error fetching top articles:", error.message);
}
};

// Fetch top articles on component mount
onMounted(fetchTopArticles);

// Function to navigate to the article details page
const goToArticleDetails = (itemId) => {
router.push({ name: 'ArticleDetails', params: { id: itemId } });
};
</script>

<style scoped>
.carousel-image {
  width: 500px;
  height: 400px;
}
.secondary-background {
  background-color: #eed4d4;
  width: 100%;
  display: flex;
}
h1,
h2 {
  text-align: center;
  font-size: 32px;
  color: #ff9689;
  font-family: "Cherry Bomb", sans-serif;
}

h1 .line-1,
h1 .line-2 {
  display: block;
}

h1 .line-2 {
  margin-top: 10px;
}

.header_class {
  color: #ff9689;
  font-family: "Cherry Bomb", sans-serif;
}
.header {
margin: auto;
display: flex;
flex-direction: column;
align-items: center;
}
img {
  max-width: 100%;
  height: auto;
}

.row {
  display: flex;
  align-items: center;
}

.intro,
.features {
  margin: 20px 0;
}

.feature-card {
  display: inline-block;
  border: 1px solid #ddd;
  padding: 10px;
  margin: 10px;
  width: 30%;
}

footer {
  margin-top: 40px;
  padding: 20px 0px;
}
</style>
